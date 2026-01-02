/**
 * AWS X-Ray Integration
 *
 * Provides distributed tracing for the backend application.
 * Traces HTTP requests, database queries, and cache operations.
 *
 * Enable with XRAY_ENABLED=true environment variable.
 */

import { config } from "../config";
import { logger } from "./logger";

// X-Ray SDK types
type XRaySegment = {
  addAnnotation: (key: string, value: string | number | boolean) => void;
  addMetadata: (key: string, value: unknown, namespace?: string) => void;
  addError: (error: Error) => void;
  addNewSubsegment: (name: string) => XRaySubsegment;
  close: (error?: Error) => void;
};

type XRaySubsegment = XRaySegment & {
  close: (error?: Error) => void;
};

// Extended X-Ray segment type for Fastify integration
type XRayFullSegment = XRaySegment & {
  http?: {
    request?: {
      method?: string;
      url?: string;
      user_agent?: string;
      client_ip?: string;
    };
    response?: {
      status?: number;
    };
  };
};

// Lazy-loaded X-Ray SDK reference
let AWSXRay: {
  setDaemonAddress: (address: string) => void;
  getSegment: () => XRaySegment | undefined;
  setSegment: (segment: XRaySegment) => void;
  captureHTTPsGlobal: (http: unknown) => void;
  capturePromise: () => void;
  getNamespace: () => {
    run: <T>(fn: () => T) => T;
    runAndReturn: <T>(fn: () => T) => T;
  };
  Segment: new (
    name: string,
    rootId?: string,
    parentId?: string,
  ) => XRayFullSegment;
  middleware: {
    setDefaultName: (name: string) => void;
  };
  express: {
    openSegment: (name: string) => unknown;
    closeSegment: () => unknown;
  };
} | null = null;

let xrayInitialized = false;

/**
 * Initialize X-Ray SDK
 * Must be called early in application startup, before HTTP modules are imported
 */
export function initXRay(): void {
  if (!config.xray?.enabled) {
    logger.info("X-Ray tracing disabled");
    return;
  }

  if (xrayInitialized) {
    logger.warn("X-Ray already initialized");
    return;
  }

  try {
    // Dynamic import to avoid loading X-Ray when disabled
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AWSXRay = require("aws-xray-sdk");

    // Configure daemon address
    AWSXRay.setDaemonAddress(config.xray.daemonAddress);

    // Set service name for segment naming
    AWSXRay.middleware.setDefaultName(config.xray.serviceName);

    // Capture all HTTP/HTTPS requests
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AWSXRay.captureHTTPsGlobal(require("http"));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AWSXRay.captureHTTPsGlobal(require("https"));

    // Capture Promise rejections
    AWSXRay.capturePromise();

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
 * Get current X-Ray segment
 */
export function getSegment(): XRaySegment | undefined {
  if (!config.xray?.enabled || !AWSXRay) {
    return undefined;
  }
  return AWSXRay.getSegment();
}

/**
 * Create a new subsegment for tracing a specific operation
 *
 * @param name - Name of the subsegment (e.g., "Prisma.User.findUnique")
 * @returns Subsegment or null if X-Ray is disabled
 */
export function createSubsegment(name: string): XRaySubsegment | null {
  if (!config.xray?.enabled || !AWSXRay) {
    return null;
  }

  try {
    const segment = AWSXRay.getSegment();
    if (!segment) {
      return null;
    }
    return segment.addNewSubsegment(name);
  } catch {
    // Segment may not exist outside of a request context
    return null;
  }
}

/**
 * Add annotation to current segment
 * Annotations are indexed for filtering in X-Ray console
 *
 * @param key - Annotation key (alphanumeric, max 500 chars)
 * @param value - Annotation value (string, number, or boolean)
 */
export function addAnnotation(
  key: string,
  value: string | number | boolean,
): void {
  if (!config.xray?.enabled) return;

  try {
    const segment = getSegment();
    segment?.addAnnotation(key, value);
  } catch {
    // Ignore errors when segment doesn't exist
  }
}

/**
 * Add metadata to current segment
 * Metadata is not indexed but can store complex objects
 *
 * @param key - Metadata key
 * @param value - Any JSON-serializable value
 * @param namespace - Optional namespace (defaults to "default")
 */
export function addMetadata(
  key: string,
  value: unknown,
  namespace?: string,
): void {
  if (!config.xray?.enabled) return;

  try {
    const segment = getSegment();
    segment?.addMetadata(key, value, namespace);
  } catch {
    // Ignore errors when segment doesn't exist
  }
}

/**
 * Record an error in the current segment
 *
 * @param error - Error to record
 */
export function addError(error: Error): void {
  if (!config.xray?.enabled) return;

  try {
    const segment = getSegment();
    segment?.addError(error);
  } catch {
    // Ignore errors when segment doesn't exist
  }
}

/**
 * Wrap an async function with X-Ray subsegment tracing
 *
 * @param name - Subsegment name
 * @param fn - Async function to trace
 * @returns Result of the function
 */
export async function traceAsync<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (!config.xray?.enabled) {
    return fn();
  }

  const subsegment = createSubsegment(name);
  try {
    const result = await fn();
    subsegment?.close();
    return result;
  } catch (error) {
    subsegment?.addError(error as Error);
    subsegment?.close(error as Error);
    throw error;
  }
}

/**
 * Check if X-Ray is enabled and initialized
 */
export function isXRayEnabled(): boolean {
  return Boolean(config.xray?.enabled) && xrayInitialized;
}

/**
 * Create a new X-Ray segment for a Fastify request
 * Returns the segment that should be closed when request completes
 */
export function createRequestSegment(
  method: string,
  url: string,
  headers: Record<string, string | string[] | undefined>,
): XRayFullSegment | null {
  if (!config.xray?.enabled || !AWSXRay) {
    return null;
  }

  try {
    const segment = new AWSXRay.Segment(config.xray.serviceName);

    // Add HTTP request info
    segment.http = {
      request: {
        method,
        url,
        user_agent:
          typeof headers["user-agent"] === "string"
            ? headers["user-agent"]
            : undefined,
        client_ip:
          typeof headers["x-forwarded-for"] === "string"
            ? headers["x-forwarded-for"].split(",")[0]
            : undefined,
      },
    };

    // Set as current segment in context
    AWSXRay.setSegment(segment);

    return segment;
  } catch (error) {
    logger.error({ error }, "Failed to create X-Ray segment");
    return null;
  }
}

/**
 * Close a request segment with response info
 */
export function closeRequestSegment(
  segment: XRayFullSegment | null,
  statusCode: number,
  error?: Error,
): void {
  if (!segment) return;

  try {
    // Add response info
    if (segment.http) {
      segment.http.response = { status: statusCode };
    }

    if (error) {
      segment.addError(error);
      segment.close(error);
    } else {
      segment.close();
    }
  } catch (err) {
    logger.error({ err }, "Failed to close X-Ray segment");
  }
}

/**
 * Run a function within an X-Ray namespace context
 * This ensures segment context is available for subsegments
 */
export function runInXRayContext<T>(fn: () => T): T {
  if (!config.xray?.enabled || !AWSXRay) {
    return fn();
  }

  try {
    const ns = AWSXRay.getNamespace();
    return ns.runAndReturn(fn);
  } catch {
    return fn();
  }
}
