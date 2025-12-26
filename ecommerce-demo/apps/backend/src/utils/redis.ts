import Redis, { RedisOptions } from "ioredis";
import { config } from "../config/index.js";
import { logger } from "./logger.js";

const redisOptions: RedisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  tls: config.redis.tlsEnabled ? {} : undefined,
  retryStrategy: (times: number) => {
    if (times > 3) {
      logger.error("Redis connection failed after 3 retries");
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  maxRetriesPerRequest: 3,
};

export const redis = new Redis(redisOptions);

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (error) => {
  logger.error({ error }, "Redis error");
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

// Cache helper functions
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  async ttl(key: string): Promise<number> {
    return redis.ttl(key);
  },

  async incr(key: string): Promise<number> {
    return redis.incr(key);
  },

  async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  },
};

// Cache key generators
export const cacheKeys = {
  product: (id: string) => `product:${id}`,
  productList: (page: number, limit: number) => `products:list:${page}:${limit}`,
  category: (id: string) => `category:${id}`,
  categoryList: () => `categories:list`,
  user: (id: string) => `user:${id}`,
  session: (token: string) => `session:${token}`,
  rateLimit: (ip: string, endpoint: string) => `ratelimit:${ip}:${endpoint}`,
};
