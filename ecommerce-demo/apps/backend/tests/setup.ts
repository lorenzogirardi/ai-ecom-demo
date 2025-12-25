import { beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";

// Set test environment - use actual database from .env for integration tests
process.env.NODE_ENV = "test";
// Don't override DATABASE_URL - let it use .env file
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://ecommerce:ecommerce_secret@localhost:5432/ecommerce_db";
}
process.env.JWT_SECRET = "test-secret-key-for-testing-purposes-only";
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";
process.env.REDIS_PASSWORD = "redis_secret";
process.env.ENABLE_RATE_LIMITING = "false";
process.env.ENABLE_SWAGGER = "false";
process.env.LOG_LEVEL = "silent";

// Mock Redis for unit tests
vi.mock("ioredis", () => {
  const RedisMock = vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    setex: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue([]),
    exists: vi.fn().mockResolvedValue(0),
    ttl: vi.fn().mockResolvedValue(-1),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue("PONG"),
    quit: vi.fn().mockResolvedValue("OK"),
    on: vi.fn(),
  }));
  return { default: RedisMock };
});

// Global test hooks
beforeAll(async () => {
  // Global setup if needed
});

afterAll(async () => {
  // Global cleanup
});

beforeEach(async () => {
  // Clear mocks before each test
  vi.clearAllMocks();
});

afterEach(async () => {
  // Cleanup after each test
});
