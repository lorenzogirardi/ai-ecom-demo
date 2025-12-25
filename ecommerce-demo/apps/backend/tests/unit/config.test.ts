import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Config Module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Set required environment variables
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getEnv", () => {
    it("should return environment variable value when set", async () => {
      process.env.TEST_VAR = "test-value";
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.databaseUrl).toBe("postgresql://test:test@localhost:5432/test_db");
    });

    it("should return default value when env var is not set", async () => {
      delete process.env.PORT;
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.port).toBe(4000);
    });

    it("should throw error when required env var is missing", async () => {
      delete process.env.DATABASE_URL;

      await expect(import("../../src/config/index.js")).rejects.toThrow(
        "Missing environment variable: DATABASE_URL"
      );
    });
  });

  describe("getEnvNumber", () => {
    it("should parse number correctly", async () => {
      process.env.PORT = "5000";
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.port).toBe(5000);
    });

    it("should use default when not set", async () => {
      delete process.env.BCRYPT_SALT_ROUNDS;
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.bcrypt.saltRounds).toBe(12);
    });
  });

  describe("getEnvBoolean", () => {
    it("should parse true correctly", async () => {
      process.env.ENABLE_RATE_LIMITING = "true";
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.rateLimit.enabled).toBe(true);
    });

    it("should parse false correctly", async () => {
      process.env.ENABLE_RATE_LIMITING = "false";
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.rateLimit.enabled).toBe(false);
    });

    it("should treat non-true values as false", async () => {
      process.env.ENABLE_SWAGGER = "FALSE";
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.swagger.enabled).toBe(false);
    });
  });

  describe("Environment detection", () => {
    it("should detect development environment", async () => {
      process.env.NODE_ENV = "development";
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.isDevelopment).toBe(true);
      expect(config.isProduction).toBe(false);
      expect(config.isTest).toBe(false);
    });

    it("should detect production environment", async () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.isDevelopment).toBe(false);
      expect(config.isProduction).toBe(true);
      expect(config.isTest).toBe(false);
    });

    it("should detect test environment", async () => {
      process.env.NODE_ENV = "test";
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");
      expect(config.isDevelopment).toBe(false);
      expect(config.isProduction).toBe(false);
      expect(config.isTest).toBe(true);
    });
  });

  describe("Default configuration values", () => {
    it("should have correct default values", async () => {
      process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

      const { config } = await import("../../src/config/index.js");

      expect(config.host).toBe("0.0.0.0");
      expect(config.redis.host).toBe("localhost");
      expect(config.redis.port).toBe(6379);
      expect(config.jwt.expiresIn).toBe("7d");
      expect(config.cors.credentials).toBe(true);
      expect(config.rateLimit.max).toBe(100);
    });
  });
});
