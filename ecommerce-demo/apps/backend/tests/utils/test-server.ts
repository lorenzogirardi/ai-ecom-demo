import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { PrismaClient } from "@prisma/client";

import { authRoutes } from "../../src/modules/auth/auth.routes.js";
import { catalogRoutes } from "../../src/modules/catalog/catalog.routes.js";
import { searchRoutes } from "../../src/modules/search/search.routes.js";
import { ordersRoutes } from "../../src/modules/orders/orders.routes.js";
import { errorHandler } from "../../src/middleware/error-handler.js";
import { TestFactory } from "./factories.js";

export interface TestContext {
  app: FastifyInstance;
  prisma: PrismaClient;
  factory: TestFactory;
}

// Create test server with mocked dependencies
export async function createTestServer(prisma: PrismaClient): Promise<TestContext> {
  const app = Fastify({
    logger: false, // Disable logging in tests
  });

  // Register minimal plugins for testing
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "test-secret",
    sign: {
      expiresIn: "7d",
    },
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health check
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Register routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(catalogRoutes, { prefix: "/api/catalog" });
  await app.register(searchRoutes, { prefix: "/api/search" });
  await app.register(ordersRoutes, { prefix: "/api/orders" });

  await app.ready();

  const factory = new TestFactory(prisma);

  return { app, prisma, factory };
}

// Helper to make authenticated requests
export async function getAuthToken(
  app: FastifyInstance,
  user: { id: string; role: string }
): Promise<string> {
  return app.jwt.sign({
    sub: user.id,
    role: user.role,
  });
}

// Response type helpers
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
  };
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Type-safe response parsing
export function parseResponse<T>(response: { body: string }): ApiResponse<T> {
  return JSON.parse(response.body) as ApiResponse<T>;
}
