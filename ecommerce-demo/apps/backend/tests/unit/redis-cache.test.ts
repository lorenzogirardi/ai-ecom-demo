import { describe, it, expect, vi, beforeEach } from "vitest";

// Create mock before importing
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  exists: vi.fn(),
  ttl: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  ping: vi.fn(),
  on: vi.fn(),
};

vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => mockRedis),
}));

// Mock config
vi.mock("../../src/config/index.js", () => ({
  config: {
    redis: {
      host: "localhost",
      port: 6379,
      password: "",
      tlsEnabled: false,
    },
  },
}));

// Mock logger
vi.mock("../../src/utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("Redis Cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cache.get", () => {
    it("should return null when key does not exist", async () => {
      mockRedis.get.mockResolvedValue(null);

      const { cache } = await import("../../src/utils/redis.js");
      const result = await cache.get("nonexistent-key");

      expect(result).toBeNull();
      expect(mockRedis.get).toHaveBeenCalledWith("nonexistent-key");
    });

    it("should parse JSON data correctly", async () => {
      const testData = { name: "test", value: 123 };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const { cache } = await import("../../src/utils/redis.js");
      const result = await cache.get<typeof testData>("test-key");

      expect(result).toEqual(testData);
    });

    it("should return raw string if JSON parsing fails", async () => {
      mockRedis.get.mockResolvedValue("plain-string");

      const { cache } = await import("../../src/utils/redis.js");
      const result = await cache.get<string>("string-key");

      expect(result).toBe("plain-string");
    });
  });

  describe("cache.set", () => {
    it("should set value without TTL", async () => {
      mockRedis.set.mockResolvedValue("OK");

      const { cache } = await import("../../src/utils/redis.js");
      await cache.set("test-key", { data: "value" });

      expect(mockRedis.set).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify({ data: "value" })
      );
    });

    it("should set value with TTL", async () => {
      mockRedis.setex.mockResolvedValue("OK");

      const { cache } = await import("../../src/utils/redis.js");
      await cache.set("test-key", { data: "value" }, 300);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        "test-key",
        300,
        JSON.stringify({ data: "value" })
      );
    });

    it("should handle string values", async () => {
      mockRedis.set.mockResolvedValue("OK");

      const { cache } = await import("../../src/utils/redis.js");
      await cache.set("string-key", "plain-string");

      expect(mockRedis.set).toHaveBeenCalledWith("string-key", "plain-string");
    });
  });

  describe("cache.del", () => {
    it("should delete key", async () => {
      mockRedis.del.mockResolvedValue(1);

      const { cache } = await import("../../src/utils/redis.js");
      await cache.del("test-key");

      expect(mockRedis.del).toHaveBeenCalledWith("test-key");
    });
  });

  describe("cache.delPattern", () => {
    it("should delete keys matching pattern", async () => {
      mockRedis.keys.mockResolvedValue(["key1", "key2", "key3"]);
      mockRedis.del.mockResolvedValue(3);

      const { cache } = await import("../../src/utils/redis.js");
      await cache.delPattern("prefix:*");

      expect(mockRedis.keys).toHaveBeenCalledWith("prefix:*");
      expect(mockRedis.del).toHaveBeenCalledWith("key1", "key2", "key3");
    });

    it("should not call del when no keys match", async () => {
      mockRedis.keys.mockResolvedValue([]);

      const { cache } = await import("../../src/utils/redis.js");
      await cache.delPattern("nonexistent:*");

      expect(mockRedis.keys).toHaveBeenCalledWith("nonexistent:*");
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe("cache.exists", () => {
    it("should return true when key exists", async () => {
      mockRedis.exists.mockResolvedValue(1);

      const { cache } = await import("../../src/utils/redis.js");
      const result = await cache.exists("existing-key");

      expect(result).toBe(true);
    });

    it("should return false when key does not exist", async () => {
      mockRedis.exists.mockResolvedValue(0);

      const { cache } = await import("../../src/utils/redis.js");
      const result = await cache.exists("nonexistent-key");

      expect(result).toBe(false);
    });
  });

  describe("cache.ttl", () => {
    it("should return TTL in seconds", async () => {
      mockRedis.ttl.mockResolvedValue(300);

      const { cache } = await import("../../src/utils/redis.js");
      const result = await cache.ttl("test-key");

      expect(result).toBe(300);
    });

    it("should return -1 for key without TTL", async () => {
      mockRedis.ttl.mockResolvedValue(-1);

      const { cache } = await import("../../src/utils/redis.js");
      const result = await cache.ttl("persistent-key");

      expect(result).toBe(-1);
    });
  });

  describe("cache.incr", () => {
    it("should increment value", async () => {
      mockRedis.incr.mockResolvedValue(5);

      const { cache } = await import("../../src/utils/redis.js");
      const result = await cache.incr("counter");

      expect(result).toBe(5);
      expect(mockRedis.incr).toHaveBeenCalledWith("counter");
    });
  });

  describe("cache.expire", () => {
    it("should set expiry on key", async () => {
      mockRedis.expire.mockResolvedValue(1);

      const { cache } = await import("../../src/utils/redis.js");
      await cache.expire("test-key", 600);

      expect(mockRedis.expire).toHaveBeenCalledWith("test-key", 600);
    });
  });
});

describe("cacheKeys", () => {
  it("should generate correct cache keys", async () => {
    const { cacheKeys } = await import("../../src/utils/redis.js");

    expect(cacheKeys.product("123")).toBe("product:123");
    expect(cacheKeys.productList(1, 20)).toBe("products:list:1:20");
    expect(cacheKeys.category("456")).toBe("category:456");
    expect(cacheKeys.categoryList()).toBe("categories:list");
    expect(cacheKeys.user("789")).toBe("user:789");
    expect(cacheKeys.session("token-abc")).toBe("session:token-abc");
    expect(cacheKeys.rateLimit("1.2.3.4", "/api/login")).toBe(
      "ratelimit:1.2.3.4:/api/login"
    );
  });
});
