import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  authGuard,
  adminGuard,
  optionalAuthGuard,
} from "../../src/middleware/auth-guard.js";
import { UnauthorizedError, ForbiddenError } from "../../src/middleware/error-handler.js";

describe("Auth Guard Middleware", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      jwtVerify: vi.fn(),
    };
    mockReply = {};
  });

  describe("authGuard", () => {
    it("should throw UnauthorizedError when no token provided", async () => {
      mockRequest.headers = {};

      await expect(
        authGuard(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        authGuard(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow("Invalid or expired token");
    });

    it("should throw UnauthorizedError when token is invalid", async () => {
      mockRequest.headers = { authorization: "Bearer invalid-token" };
      (mockRequest.jwtVerify as any).mockRejectedValue(new Error("Invalid token"));

      await expect(
        authGuard(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        authGuard(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow("Invalid or expired token");
    });

    it("should set userId and userRole on valid token", async () => {
      mockRequest.headers = { authorization: "Bearer valid-token" };
      (mockRequest.jwtVerify as any).mockResolvedValue({
        sub: "user-123",
        role: "CUSTOMER",
      });

      await authGuard(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.userId).toBe("user-123");
      expect(mockRequest.userRole).toBe("CUSTOMER");
    });

    it("should handle admin role", async () => {
      mockRequest.headers = { authorization: "Bearer admin-token" };
      (mockRequest.jwtVerify as any).mockResolvedValue({
        sub: "admin-123",
        role: "ADMIN",
      });

      await authGuard(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.userId).toBe("admin-123");
      expect(mockRequest.userRole).toBe("ADMIN");
    });

    it("should extract token without Bearer prefix", async () => {
      mockRequest.headers = { authorization: "Bearer my-token" };
      (mockRequest.jwtVerify as any).mockResolvedValue({
        sub: "user-123",
        role: "CUSTOMER",
      });

      await authGuard(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockRequest.jwtVerify).toHaveBeenCalled();
    });
  });

  describe("adminGuard", () => {
    it("should allow admin users", async () => {
      mockRequest.headers = { authorization: "Bearer admin-token" };
      (mockRequest.jwtVerify as any).mockResolvedValue({
        sub: "admin-123",
        role: "ADMIN",
      });

      await expect(
        adminGuard(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();

      expect(mockRequest.userId).toBe("admin-123");
      expect(mockRequest.userRole).toBe("ADMIN");
    });

    it("should throw ForbiddenError for non-admin users", async () => {
      mockRequest.headers = { authorization: "Bearer user-token" };
      (mockRequest.jwtVerify as any).mockResolvedValue({
        sub: "user-123",
        role: "CUSTOMER",
      });

      await expect(
        adminGuard(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(ForbiddenError);

      await expect(
        adminGuard(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow("Admin access required");
    });

    it("should throw UnauthorizedError when no token", async () => {
      mockRequest.headers = {};

      await expect(
        adminGuard(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("optionalAuthGuard", () => {
    it("should set userId and userRole when valid token provided", async () => {
      mockRequest.headers = { authorization: "Bearer valid-token" };
      (mockRequest.jwtVerify as any).mockResolvedValue({
        sub: "user-123",
        role: "CUSTOMER",
      });

      await optionalAuthGuard(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockRequest.userId).toBe("user-123");
      expect(mockRequest.userRole).toBe("CUSTOMER");
    });

    it("should not set userId when no token provided", async () => {
      mockRequest.headers = {};

      await optionalAuthGuard(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockRequest.userId).toBeUndefined();
      expect(mockRequest.userRole).toBeUndefined();
    });

    it("should not throw on invalid token", async () => {
      mockRequest.headers = { authorization: "Bearer invalid-token" };
      (mockRequest.jwtVerify as any).mockRejectedValue(new Error("Invalid"));

      await expect(
        optionalAuthGuard(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).resolves.not.toThrow();

      expect(mockRequest.userId).toBeUndefined();
    });

    it("should continue silently on expired token", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      (mockRequest.jwtVerify as any).mockRejectedValue(new Error("Token expired"));

      await expect(
        optionalAuthGuard(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).resolves.not.toThrow();
    });
  });
});
