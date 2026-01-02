/**
 * AWS X-Ray Integration
 *
 * Provides distributed tracing for the backend application.
 * Uses captureAsyncFunc for proper segment management.
 *
 * Enable with XRAY_ENABLED=true environment variable.
 */

import { config } from "../config/index.js";
import { logger } from "./logger.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AWSXRay: any = null;
let xrayInitialized = false;

/**
 * Initialize X-Ray SDK
 * Must be called early in application startup
 */
export function initXRay(): void {
  if (!config.xray?.enabled) {
    logger.info("X-Ray tracing disabled");
    return;
  }

  if (xrayInitialized) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AWSXRay = require("aws-xray-sdk-core");

    // Configure daemon address
    AWSXRay.setDaemonAddress(config.xray.daemonAddress);

    // Set context missing strategy to LOG_ERROR (don't throw)
    AWSXRay.setContextMissingStrategy("LOG_ERROR");

    // Capture outgoing HTTP requests
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AWSXRay.captureHTTPsGlobal(require("http"));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AWSXRay.captureHTTPsGlobal(require("https"));

    xrayInitialized = true;

    // Log available SDK properties for debugging
    const sdkKeys = Object.keys(AWSXRay).filter(
      (k) => typeof AWSXRay[k] !== "function",
    );
    logger.info(
      {
        daemonAddress: config.xray.daemonAddress,
        sdkProperties: sdkKeys.slice(0, 10),
      },
      "X-Ray tracing initialized",
    );
  } catch (error) {
    logger.error({ error }, "Failed to initialize X-Ray");
  }
}

/**
 * Check if X-Ray is enabled and initialized
 */
export function isXRayEnabled(): boolean {
  return Boolean(config.xray?.enabled) && xrayInitialized && AWSXRay !== null;
}

/**
 * Trace an async function with X-Ray
 * Creates a segment/subsegment and properly handles context
 */
export async function traceAsync<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (!isXRayEnabled()) {
    return fn();
  }

  return new Promise((resolve, reject) => {
    AWSXRay.captureAsyncFunc(
      name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (subsegment: any) => {
        try {
          const result = await fn();
          if (subsegment) subsegment.close();
          resolve(result);
        } catch (error) {
          if (subsegment) {
            subsegment.addError(error);
            subsegment.close();
          }
          reject(error);
        }
      },
    );
  });
}

/**
 * Create a root segment for an HTTP request
 * Let the SDK handle trace ID and segment ID generation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openSegment(name: string): any {
  if (!isXRayEnabled()) {
    return null;
  }

  try {
    // Create segment - SDK auto-generates trace_id and id
    const segment = new AWSXRay.Segment(name);

    logger.info(
      { traceId: segment.trace_id, segmentId: segment.id },
      "X-Ray segment opened",
    );

    // Set as current segment for context propagation
    AWSXRay.setSegment(segment);

    return segment;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    logger.error(
      { errorMessage: errMsg, errorStack: errStack },
      "Failed to open X-Ray segment",
    );
    return null;
  }
}

/**
 * Close a segment - SDK handles sending to daemon
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function closeSegment(segment: any, statusCode?: number): void {
  if (!segment) return;

  try {
    // Add HTTP response info
    if (statusCode) {
      segment.addAnnotation("http_status", statusCode);
      if (statusCode >= 400 && statusCode < 500) {
        segment.addErrorFlag();
      }
      if (statusCode >= 500) {
        segment.addFaultFlag();
      }
    }

    logger.info(
      { traceId: segment.trace_id, segmentId: segment.id, statusCode },
      "Closing X-Ray segment",
    );

    // close() should trigger segment emission to daemon
    segment.close();
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error({ errorMessage: errMsg }, "Failed to close X-Ray segment");
  }
}

/**
 * Legacy function for compatibility
 */
export function startRequestTrace(
  name: string,
  _method: string,
  _url: string,
): (() => void) | null {
  const segment = openSegment(name);
  if (!segment) return null;

  return () => closeSegment(segment);
}

/**
 * Add annotation to current segment (if exists)
 */
export function addAnnotation(
  key: string,
  value: string | number | boolean,
): void {
  if (!isXRayEnabled()) return;

  try {
    const segment = AWSXRay.getSegment();
    if (segment) {
      segment.addAnnotation(key, value);
    }
  } catch {
    // Ignore - no segment in context
  }
}

/**
 * Get the X-Ray SDK instance (for advanced usage)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getXRaySDK(): any {
  return AWSXRay;
}
