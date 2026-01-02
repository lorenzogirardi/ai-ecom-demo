/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js during server startup.
 * Used to initialize AWS X-Ray tracing for server-side operations.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server (Node.js runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initXRay } = await import("./lib/xray");
    initXRay();
  }
}
