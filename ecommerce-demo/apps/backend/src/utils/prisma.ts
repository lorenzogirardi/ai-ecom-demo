import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";
import { logger } from "./logger.js";
import { createSubsegment } from "./xray.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDevelopment
      ? [
          { emit: "event", level: "query" },
          { emit: "stdout", level: "info" },
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" },
        ]
      : [
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" },
        ],
  });

if (config.isDevelopment) {
  basePrisma.$on("query" as never, (e: { query: string; duration: number }) => {
    logger.debug({ query: e.query, duration: e.duration }, "Prisma query");
  });
}

// Add X-Ray tracing middleware
if (config.xray.enabled) {
  basePrisma.$use(async (params, next) => {
    const model = params.model ?? "Unknown";
    const action = params.action;
    const subsegmentName = `Prisma.${model}.${action}`;
    const subsegment = createSubsegment(subsegmentName);

    const startTime = Date.now();
    try {
      const result = await next(params);
      const duration = Date.now() - startTime;

      // Add metadata about the query
      if (subsegment) {
        subsegment.addMetadata("duration_ms", duration, "prisma");
        subsegment.addMetadata("model", model, "prisma");
        subsegment.addMetadata("action", action, "prisma");
      }
      subsegment?.close();

      return result;
    } catch (error) {
      subsegment?.addError(error as Error);
      subsegment?.close(error as Error);
      throw error;
    }
  });
}

export const prisma = basePrisma;

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}

export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
