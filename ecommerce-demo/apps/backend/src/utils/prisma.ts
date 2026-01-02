import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";
import { logger } from "./logger.js";

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

export const prisma = basePrisma;

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}

export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
