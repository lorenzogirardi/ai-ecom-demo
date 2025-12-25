import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { createTestServer, getAuthToken, TestContext } from "../utils/test-server.js";
import { testData } from "../utils/factories.js";

describe("Auth Routes Integration", () => {
  let ctx: TestContext;
  let app: FastifyInstance;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    ctx = await createTestServer(prisma);
    app = ctx.app;
  });

  afterAll(async () => {
    await ctx.factory.cleanupAll();
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await ctx.factory.cleanupUsers();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: testData.validUser,
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.user).toBeDefined();
      expect(body.data.user.email).toBe(testData.validUser.email);
      expect(body.data.user.firstName).toBe(testData.validUser.firstName);
      expect(body.data.user.lastName).toBe(testData.validUser.lastName);
      expect(body.data.user.role).toBe("CUSTOMER");
      expect(body.data.user.password).toBeUndefined(); // Password should not be returned
      expect(body.data.token).toBeDefined();
    });

    it("should return 409 when email already exists", async () => {
      // Create user first
      await ctx.factory.createUser({ email: testData.validUser.email });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: testData.validUser,
      });

      expect(response.statusCode).toBe(409);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("CONFLICT");
      expect(body.error.message).toContain("already exists");
    });

    it("should return 422 for invalid email format", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          ...testData.validUser,
          email: testData.invalidEmail,
        },
      });

      expect(response.statusCode).toBe(422);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.errors.email).toBeDefined();
    });

    it("should return 422 for short password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          ...testData.validUser,
          password: testData.shortPassword,
        },
      });

      expect(response.statusCode).toBe(422);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.errors.password).toBeDefined();
    });

    it("should allow registration with optional fields missing", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "minimal@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.data.user.firstName).toBeNull();
      expect(body.data.user.lastName).toBeNull();
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await ctx.factory.createUser({
        email: testData.validUser.email,
        password: testData.validUser.password,
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: testData.validUser.email,
          password: testData.validUser.password,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.user).toBeDefined();
      expect(body.data.user.email).toBe(testData.validUser.email);
      expect(body.data.token).toBeDefined();
      expect(body.data.user.password).toBeUndefined();
    });

    it("should return 401 for wrong password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: testData.validUser.email,
          password: "wrongpassword",
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
      expect(body.error.message).toContain("Invalid email or password");
    });

    it("should return 401 for non-existent user", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "nonexistent@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.error.message).toContain("Invalid email or password");
    });

    it("should return 401 for inactive user", async () => {
      await ctx.factory.cleanupUsers();
      await ctx.factory.createUser({
        email: testData.validUser.email,
        password: testData.validUser.password,
        isActive: false,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: testData.validUser.email,
          password: testData.validUser.password,
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.error.message).toContain("disabled");
    });

    it("should return 422 for missing fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: testData.validUser.email,
        },
      });

      expect(response.statusCode).toBe(422);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user profile", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(user.id);
      expect(body.data.email).toBe(user.email);
      expect(body.data.password).toBeUndefined();
    });

    it("should return 401 without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 401 with invalid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: { Authorization: "Bearer invalid-token" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /api/auth/me", () => {
    it("should update user profile", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      const response = await app.inject({
        method: "PATCH",
        url: "/api/auth/me",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          firstName: "Updated",
          lastName: "Name",
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.firstName).toBe("Updated");
      expect(body.data.lastName).toBe("Name");
    });

    it("should update email if unique", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      const response = await app.inject({
        method: "PATCH",
        url: "/api/auth/me",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          email: "newemail@example.com",
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.email).toBe("newemail@example.com");
    });

    it("should return 409 when email already exists", async () => {
      const user1 = await ctx.factory.createUser();
      const user2 = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user1.id, role: user1.role });

      const response = await app.inject({
        method: "PATCH",
        url: "/api/auth/me",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          email: user2.email,
        },
      });

      expect(response.statusCode).toBe(409);
    });

    it("should return 401 without authentication", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/api/auth/me",
        payload: { firstName: "Test" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/auth/change-password", () => {
    it("should change password successfully", async () => {
      const user = await ctx.factory.createUser({
        password: "oldpassword123",
      });
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/change-password",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          currentPassword: "oldpassword123",
          newPassword: "newpassword456",
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain("Password changed");

      // Verify new password works
      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: user.email,
          password: "newpassword456",
        },
      });

      expect(loginResponse.statusCode).toBe(200);
    });

    it("should return 400 for incorrect current password", async () => {
      const user = await ctx.factory.createUser({
        password: "correctpassword",
      });
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/change-password",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          currentPassword: "wrongpassword",
          newPassword: "newpassword456",
        },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error.message).toContain("incorrect");
    });

    it("should return 422 for short new password", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/change-password",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          currentPassword: "password123",
          newPassword: "short",
        },
      });

      expect(response.statusCode).toBe(422);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain("Logged out");
    });

    it("should return 401 without token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
