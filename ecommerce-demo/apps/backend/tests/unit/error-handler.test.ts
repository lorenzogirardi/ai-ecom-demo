import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError, z } from "zod";
import {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  errorHandler,
} from "../../src/middleware/error-handler.js";

// Mock logger
vi.mock("../../src/utils/logger.js", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Error Classes", () => {
  describe("HttpError", () => {
    it("should create error with default values", () => {
      const error = new HttpError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.name).toBe("HttpError");
    });

    it("should create error with custom values", () => {
      const error = new HttpError("Custom error", 418, "CUSTOM_CODE");
      expect(error.message).toBe("Custom error");
      expect(error.statusCode).toBe(418);
      expect(error.code).toBe("CUSTOM_CODE");
    });
  });

  describe("BadRequestError", () => {
    it("should have correct defaults", () => {
      const error = new BadRequestError();
      expect(error.message).toBe("Bad request");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.name).toBe("BadRequestError");
    });

    it("should accept custom message", () => {
      const error = new BadRequestError("Invalid input");
      expect(error.message).toBe("Invalid input");
    });
  });

  describe("UnauthorizedError", () => {
    it("should have correct defaults", () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe("Unauthorized");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.name).toBe("UnauthorizedError");
    });
  });

  describe("ForbiddenError", () => {
    it("should have correct defaults", () => {
      const error = new ForbiddenError();
      expect(error.message).toBe("Forbidden");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
      expect(error.name).toBe("ForbiddenError");
    });
  });

  describe("NotFoundError", () => {
    it("should have correct defaults", () => {
      const error = new NotFoundError();
      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.name).toBe("NotFoundError");
    });

    it("should accept custom message", () => {
      const error = new NotFoundError("User not found");
      expect(error.message).toBe("User not found");
    });
  });

  describe("ConflictError", () => {
    it("should have correct defaults", () => {
      const error = new ConflictError();
      expect(error.message).toBe("Resource conflict");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
      expect(error.name).toBe("ConflictError");
    });
  });

  describe("ValidationError", () => {
    it("should have correct defaults", () => {
      const error = new ValidationError();
      expect(error.message).toBe("Validation failed");
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.name).toBe("ValidationError");
      expect(error.errors).toEqual({});
    });

    it("should accept validation errors", () => {
      const errors = {
        email: ["Invalid email format"],
        password: ["Too short", "Must contain number"],
      };
      const error = new ValidationError("Validation failed", errors);
      expect(error.errors).toEqual(errors);
    });
  });
});

describe("errorHandler", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let statusMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    sendMock = vi.fn();

    mockRequest = {
      url: "/test",
      method: "GET",
      params: {},
      query: {},
    };

    mockReply = {
      status: statusMock,
      send: sendMock,
    };
  });

  it("should handle ZodError", () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    let zodError: ZodError;
    try {
      schema.parse({ email: "invalid", password: "short" });
    } catch (e) {
      zodError = e as ZodError;
    }

    errorHandler(
      zodError!,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(statusMock).toHaveBeenCalledWith(422);
    expect(sendMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors: expect.objectContaining({
          email: expect.arrayContaining([expect.any(String)]),
          password: expect.arrayContaining([expect.any(String)]),
        }),
      },
    });
  });

  it("should handle HttpError", () => {
    const error = new BadRequestError("Invalid data");

    errorHandler(
      error,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid data",
      },
    });
  });

  it("should handle NotFoundError", () => {
    const error = new NotFoundError("Product not found");

    errorHandler(
      error,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Product not found",
      },
    });
  });

  it("should handle UnauthorizedError", () => {
    const error = new UnauthorizedError("Invalid token");

    errorHandler(
      error,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid token",
      },
    });
  });

  it("should handle ValidationError with field errors", () => {
    const error = new ValidationError("Validation failed", {
      name: ["Required field"],
      price: ["Must be positive"],
    });

    errorHandler(
      error,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(statusMock).toHaveBeenCalledWith(422);
    expect(sendMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors: {
          name: ["Required field"],
          price: ["Must be positive"],
        },
      },
    });
  });

  it("should handle Fastify errors with statusCode", () => {
    const error = {
      statusCode: 429,
      code: "RATE_LIMIT",
      message: "Too many requests",
    };

    errorHandler(
      error as any,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(statusMock).toHaveBeenCalledWith(429);
    expect(sendMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "RATE_LIMIT",
        message: "Too many requests",
      },
    });
  });

  it("should handle unknown errors with 500", () => {
    const error = new Error("Something went wrong");

    errorHandler(
      error as any,
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    });
  });
});
