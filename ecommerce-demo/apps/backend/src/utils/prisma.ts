import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";
import { logger } from "./logger.js";

/**
 * Prisma Client Configuration
 *
 * Connection pooling is configured via DATABASE_URL query parameters:
 * - connection_limit: Max connections per Prisma instance (default: 2-4)
 * - pool_timeout: Timeout waiting for a connection (default: 10s)
 *
 * Example: postgresql://...?connection_limit=10&pool_timeout=10
 *
 * With multiple pods (6-7), consider total connections:
 * 7 pods × 10 connections = 70 total connections
 * Ensure RDS max_connections can handle this (check RDS instance size)
 */
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
