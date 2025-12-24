import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./utils/prisma.js";
import { redis } from "./utils/redis.js";

import { authRoutes } from "./modules/auth/auth.routes.js";
import { catalogRoutes } from "./modules/catalog/catalog.routes.js";
import { searchRoutes } from "./modules/search/search.routes.js";
import { ordersRoutes } from "./modules/orders/orders.routes.js";

import { errorHandler } from "./middleware/error-handler.js";

async function buildServer() {
  const app = Fastify({
    logger: logger,
    trustProxy: true,
  });

  // Register plugins
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  if (config.rateLimit.enabled) {
    await app.register(rateLimit, {
      max: config.rateLimit.max,
      timeWindow: config.rateLimit.timeWindow,
    });
  }

  await app.register(jwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn,
    },
  });

  // Swagger documentation
  if (config.swagger.enabled) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "E-commerce Demo API",
          description: "API documentation for the e-commerce demo backend",
          version: "1.0.0",
        },
        servers: [
          {
            url: `http://localhost:${config.port}`,
            description: "Development server",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    });

    await app.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
      },
    });
  }

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health check
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Readiness check (for Kubernetes)
  app.get("/ready", async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await redis.ping();
      return { status: "ready", timestamp: new Date().toISOString() };
    } catch (error) {
      throw new Error("Service not ready");
    }
  });

  // Register routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(catalogRoutes, { prefix: "/api/catalog" });
  await app.register(searchRoutes, { prefix: "/api/search" });
  await app.register(ordersRoutes, { prefix: "/api/orders" });

  return app;
}

async function main() {
  const app = await buildServer();

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      await prisma.$disconnect();
      await redis.quit();
      process.exit(0);
    });
  });

  try {
    await app.listen({ port: config.port, host: config.host });
    logger.info(`Server running at http://${config.host}:${config.port}`);
    if (config.swagger.enabled) {
      logger.info(`API docs available at http://${config.host}:${config.port}/docs`);
    }
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

main();

export { buildServer };
