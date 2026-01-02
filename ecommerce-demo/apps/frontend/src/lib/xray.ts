/**
 * AWS X-Ray Integration for Next.js Frontend
 *
 * Provides distributed tracing for server-side rendering and API routes.
 * Based on backend implementation with lessons learned:
 * - Avoid setSegment() due to CLS context issues
 * - Use setContextMissingStrategy("LOG_ERROR") to prevent exceptions
 * - Manage segments manually
 *
 * Enable with XRAY_ENABLED=true environment variable.
 */

/* eslint-disable */

let AWSXRay: any = null;
let xrayInitialized = false;

// Configuration from environment
const config = {
  enabled: process.env.XRAY_ENABLED === "true",
  daemonAddress: process.env.XRAY_DAEMON_ADDRESS || "127.0.0.1:2000",
  serviceName: process.env.XRAY_SERVICE_NAME || "ecommerce-frontend",
};

/**
 * Initialize X-Ray SDK
 * Must be called early in application startup (instrumentation.ts)
 */
export function initXRay(): void {
  // Only run on server
  if (typeof window !== "undefined") {
    return;
  }

  if (!config.enabled) {
    console.log("[X-Ray] Tracing disabled");
    return;
  }

  if (xrayInitialized) {
    return;
  }

  try {
    // Dynamic import to avoid bundling issues
    AWSXRay = require("aws-xray-sdk-core");

    // Configure daemon address
    AWSXRay.setDaemonAddress(config.daemonAddress);

    // Set context missing strategy to LOG_ERROR (don't throw)
    // This is critical - prevents "No context available" errors
    AWSXRay.setContextMissingStrategy("LOG_ERROR");

    // Capture outgoing HTTP requests automatically
    // This traces calls from Next.js server to backend API
    AWSXRay.captureHTTPsGlobal(require("http"));
    AWSXRay.captureHTTPsGlobal(require("https"));

    xrayInitialized = true;
    console.log(
      `[X-Ray] Tracing initialized - daemon: ${config.daemonAddress}`
    );
  } catch (error) {
    console.error("[X-Ray] Failed to initialize:", error);
  }
}

/**
 * Check if X-Ray is enabled and initialized
 */
export function isXRayEnabled(): boolean {
  return config.enabled && xrayInitialized && AWSXRay !== null;
}

/**
 * Open a new segment for tracing
 * Does NOT use setSegment() to avoid CLS context issues
 */
export function openSegment(name: string): any {
  if (!isXRayEnabled()) {
    return null;
  }

  try {
    const segment = new AWSXRay.Segment(name);
    return segment;
  } catch (error) {
    console.error("[X-Ray] Failed to open segment:", error);
    return null;
  }
}

/**
 * Close a segment and send to daemon
 */
export function closeSegment(segment: any, statusCode?: number): void {
  if (!segment) return;

  try {
    if (statusCode) {
      segment.addAnnotation("http_status", statusCode);
      if (statusCode >= 400 && statusCode < 500) {
        segment.addErrorFlag();
      }
      if (statusCode >= 500) {
        segment.addFaultFlag();
      }
    }
    segment.close();
  } catch (error) {
    console.error("[X-Ray] Failed to close segment:", error);
  }
}

/**
 * Add annotation to a segment
 */
export function addAnnotation(
  segment: any,
  key: string,
  value: string | number | boolean
): void {
  if (!segment) return;

  try {
    segment.addAnnotation(key, value);
  } catch {
    // Ignore errors
  }
}

/**
 * Add metadata to a segment
 */
export function addMetadata(
  segment: any,
  key: string,
  value: any,
  namespace?: string
): void {
  if (!segment) return;

  try {
    segment.addMetadata(key, value, namespace || config.serviceName);
  } catch {
    // Ignore errors
  }
}

/**
 * Trace an async function
 * Creates a subsegment within the provided parent segment
 */
export async function traceAsync<T>(
  parentSegment: any,
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!parentSegment || !isXRayEnabled()) {
    return fn();
  }

  const subsegment = parentSegment.addNewSubsegment(name);
  try {
    const result = await fn();
    subsegment.close();
    return result;
  } catch (error) {
    subsegment.addError(error);
    subsegment.close();
    throw error;
  }
}

/**
 * Get the X-Ray SDK instance (for advanced usage)
 */
export function getXRaySDK(): any {
  return AWSXRay;
}
