import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../../utils/prisma.js";
import { config } from "../../config/index.js";
import { authGuard } from "../../middleware/auth-guard.js";
import { cache, cacheKeys } from "../../utils/redis.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../middleware/error-handler.js";

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
  // Register
  app.post(
    "/register",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = registerSchema.parse(request.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
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

  // Login
  app.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is disabled");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(body.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

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
  });

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
