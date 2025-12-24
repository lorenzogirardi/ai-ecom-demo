import { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError, ForbiddenError } from "./error-handler.js";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    userRole?: "CUSTOMER" | "ADMIN";
  }
}

export async function authGuard(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedError("Missing authentication token");
    }

    const decoded = await request.jwtVerify<{
      sub: string;
      role: "CUSTOMER" | "ADMIN";
    }>();

    request.userId = decoded.sub;
    request.userRole = decoded.role;
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export async function adminGuard(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authGuard(request, reply);

  if (request.userRole !== "ADMIN") {
    throw new ForbiddenError("Admin access required");
  }
}

export async function optionalAuthGuard(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (token) {
      const decoded = await request.jwtVerify<{
        sub: string;
        role: "CUSTOMER" | "ADMIN";
      }>();

      request.userId = decoded.sub;
      request.userRole = decoded.role;
    }
  } catch {
    // Token is invalid but we don't throw - user continues as guest
  }
}
