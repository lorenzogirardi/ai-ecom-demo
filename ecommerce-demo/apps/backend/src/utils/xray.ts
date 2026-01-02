/**
 * AWS X-Ray Integration
 *
 * Provides distributed tracing for the backend application.
 * Uses captureAsyncFunc for proper segment management.
 *
 * Enable with XRAY_ENABLED=true environment variable.
 */

import crypto from "crypto";
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
 * Create a root segment for an HTTP request
 * Uses express-style segment creation for proper daemon communication
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openSegment(name: string): any {
  if (!isXRayEnabled()) {
    return null;
  }

  try {
    // Create a proper root segment with trace ID
    const segment = new AWSXRay.Segment(name);

    // Add required fields for root segment
    const traceId = `1-${Math.floor(Date.now() / 1000).toString(16)}-${crypto.randomBytes(12).toString("hex")}`;
    segment.trace_id = traceId;
    segment.id = crypto.randomBytes(8).toString("hex");
    segment.name = name;
    segment.start_time = Date.now() / 1000;

    // Set as current segment
    AWSXRay.setSegment(segment);

    return segment;
  } catch (error) {
    logger.debug({ error }, "Failed to open X-Ray segment");
    return null;
  }
}

/**
 * Close a segment and send to daemon
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function closeSegment(segment: any, statusCode?: number): void {
  if (!segment) return;

  try {
    segment.end_time = Date.now() / 1000;
    if (statusCode) {
      segment.http = {
        response: { status: statusCode },
      };
      if (statusCode >= 400 && statusCode < 500) {
        segment.error = true;
      }
      if (statusCode >= 500) {
        segment.fault = true;
      }
    }

    // Manually send segment to daemon
    try {
      const SegmentEmitter = AWSXRay.SegmentEmitter;
      if (SegmentEmitter) {
        SegmentEmitter.send(segment);
        logger.debug({ traceId: segment.trace_id }, "X-Ray segment sent");
      }
    } catch (sendError) {
      logger.debug({ sendError }, "Failed to send X-Ray segment");
    }

    segment.close();
  } catch {
    // Ignore close errors
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
