import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma.js";
import { config } from "../../config/index.js";
import { authGuard } from "../../middleware/auth-guard.js";
import { cache, cacheKeys } from "../../utils/redis.js";
import { logger } from "../../utils/logger.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../middleware/error-handler.js";

// Security: Rate limit configurations for auth endpoints
// Supports bypass via X-Load-Test-Bypass header for k6 load testing
const loginRateLimitConfig = {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: "15 minutes",
      allowList: (request: FastifyRequest) => {
        const bypassHeader = request.headers["x-load-test-bypass"];
        return bypassHeader === config.rateLimit.bypassToken;
      },
    },
  },
};

const registerRateLimitConfig = {
  config: {
    rateLimit: {
      max: 3,
      timeWindow: "1 hour",
      allowList: (request: FastifyRequest) => {
        const bypassHeader = request.headers["x-load-test-bypass"];
        return bypassHeader === config.rateLimit.bypassToken;
      },
    },
  },
};

// Schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Register (rate limited: 3 per hour)
  app.post(
    "/register",
    registerRateLimitConfig,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = registerSchema.parse(request.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        // Security: Log registration attempt with existing email
        logger.warn(
          {
            event: "register_conflict",
            email: body.email,
            ip: request.ip,
            timestamp: new Date().toISOString(),
          },
          "Security: Registration attempted with existing email",
        );
        throw new ConflictError("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        body.password,
        config.bcrypt.saltRounds,
      );

      // Create user
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          firstName: body.firstName,
          lastName: body.lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      // Security: Log successful registration
      logger.info(
        {
          event: "register_success",
          userId: user.id,
          email: user.email,
          ip: request.ip,
          timestamp: new Date().toISOString(),
        },
        "Security: User registered successfully",
      );

      // Generate token
      const token = app.jwt.sign({
        sub: user.id,
        role: user.role,
      });

      return reply.status(201).send({
        success: true,
        data: {
          user,
          token,
        },
      });
    },
  );

  // Login (rate limited: 5 per 15 minutes)
  app.post(
    "/login",
    loginRateLimitConfig,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = loginSchema.parse(request.body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (!user) {
        // Security: Log failed login - user not found
        logger.warn(
          {
            event: "login_failed",
            reason: "user_not_found",
            email: body.email,
            ip: request.ip,
            timestamp: new Date().toISOString(),
          },
          "Security: Login failed - user not found",
        );
        throw new UnauthorizedError("Invalid email or password");
      }

      if (!user.isActive) {
        // Security: Log failed login - account disabled
        logger.warn(
          {
            event: "login_failed",
            reason: "account_disabled",
            userId: user.id,
            email: body.email,
            ip: request.ip,
            timestamp: new Date().toISOString(),
          },
          "Security: Login failed - account disabled",
        );
        throw new UnauthorizedError("Account is disabled");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        body.password,
        user.password,
      );

      if (!isValidPassword) {
        // Security: Log failed login - invalid password
        logger.warn(
          {
            event: "login_failed",
            reason: "invalid_password",
            userId: user.id,
            email: body.email,
            ip: request.ip,
            timestamp: new Date().toISOString(),
          },
          "Security: Login failed - invalid password",
        );
        throw new UnauthorizedError("Invalid email or password");
      }

      // Security: Log successful login
      logger.info(
        {
          event: "login_success",
          userId: user.id,
          email: user.email,
          ip: request.ip,
          timestamp: new Date().toISOString(),
        },
        "Security: Login successful",
      );

      // Generate token
      const token = app.jwt.sign({
        sub: user.id,
        role: user.role,
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token,
        },
      });
    },
  );

  // Get current user profile (cached for performance)
  app.get(
    "/me",
    { preHandler: [authGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const cacheKey = cacheKeys.user(request.userId!);

      // Try cache first (reduces DB hits on frequent /me calls)
      const cached = await cache.get<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
      }>(cacheKey);

      if (cached) {
        return reply.send({
          success: true,
          data: cached,
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: request.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Cache user profile for 5 minutes
      await cache.set(cacheKey, user, 300);

      return reply.send({
        success: true,
        data: user,
      });
    },
  );

  // Update profile
  app.patch(
    "/me",
    { preHandler: [authGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = updateProfileSchema.parse(request.body);

      // Check email uniqueness if updating
      if (body.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: body.email,
            NOT: { id: request.userId },
          },
        });

        if (existingUser) {
          throw new ConflictError("Email is already in use");
        }
      }

      const user = await prisma.user.update({
        where: { id: request.userId },
        data: body,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          updatedAt: true,
        },
      });

      // Invalidate user cache on profile update
      await cache.del(cacheKeys.user(request.userId!));

      return reply.send({
        success: true,
        data: user,
      });
    },
  );

  // Change password
  app.post(
    "/change-password",
    { preHandler: [authGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = changePasswordSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: request.userId },
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        body.currentPassword,
        user.password,
      );

      if (!isValidPassword) {
        // Security: Log failed password change attempt
        logger.warn(
          {
            event: "password_change_failed",
            reason: "invalid_current_password",
            userId: request.userId,
            ip: request.ip,
            timestamp: new Date().toISOString(),
          },
          "Security: Password change failed - invalid current password",
        );
        throw new BadRequestError("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(
        body.newPassword,
        config.bcrypt.saltRounds,
      );

      await prisma.user.update({
        where: { id: request.userId },
        data: { password: hashedPassword },
      });

      // Security: Log successful password change
      logger.info(
        {
          event: "password_change_success",
          userId: request.userId,
          ip: request.ip,
          timestamp: new Date().toISOString(),
        },
        "Security: Password changed successfully",
      );

      return reply.send({
        success: true,
        message: "Password changed successfully",
      });
    },
  );

  // Logout (client-side token removal, but can invalidate refresh tokens here)
  app.post(
    "/logout",
    { preHandler: [authGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // In a production app, you might want to:
      // 1. Add the token to a blacklist in Redis
      // 2. Delete refresh tokens from the database

      return reply.send({
        success: true,
        message: "Logged out successfully",
      });
    },
  );
}
