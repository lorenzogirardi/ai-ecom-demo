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
    logger.info(
      { daemonAddress: config.xray.daemonAddress },
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
 * Create a segment for an HTTP request
 * Returns a function to close the segment
 */
export function startRequestTrace(
  name: string,
  method: string,
  url: string,
): (() => void) | null {
  if (!isXRayEnabled()) {
    return null;
  }

  try {
    const segment = new AWSXRay.Segment(name);
    segment.addAnnotation("http_method", method);
    segment.addAnnotation("http_url", url);

    AWSXRay.setSegment(segment);

    return () => {
      try {
        segment.close();
      } catch {
        // Ignore close errors
      }
    };
  } catch (error) {
    logger.debug({ error }, "Failed to start X-Ray trace");
    return null;
  }
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
