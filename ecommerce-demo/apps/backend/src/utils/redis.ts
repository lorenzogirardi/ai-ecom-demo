import Redis, { RedisOptions } from "ioredis";
import { config } from "../config/index.js";
import { logger } from "./logger.js";

// Cache metrics for performance monitoring
export const cacheMetrics = {
  hits: 0,
  misses: 0,
  getHitRate: () => {
    const total = cacheMetrics.hits + cacheMetrics.misses;
    return total > 0 ? ((cacheMetrics.hits / total) * 100).toFixed(2) : "0.00";
  },
  reset: () => {
    cacheMetrics.hits = 0;
    cacheMetrics.misses = 0;
  },
};

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
    if (!data) {
      cacheMetrics.misses++;
      return null;
    }
    cacheMetrics.hits++;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  },

  // Batch get using pipeline for better performance
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];
    const pipeline = redis.pipeline();
    keys.forEach((key) => pipeline.get(key));
    const results = await pipeline.exec();
    return (results || []).map(([err, data]) => {
      if (err || !data) {
        cacheMetrics.misses++;
        return null;
      }
      cacheMetrics.hits++;
      try {
        return JSON.parse(data as string) as T;
      } catch {
        return data as unknown as T;
      }
    });
  },

  // Batch set using pipeline for better performance
  async mset(
    items: Array<{ key: string; value: unknown; ttl?: number }>,
  ): Promise<void> {
    if (items.length === 0) return;
    const pipeline = redis.pipeline();
    items.forEach(({ key, value, ttl }) => {
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);
      if (ttl) {
        pipeline.setex(key, ttl, serialized);
      } else {
        pipeline.set(key, serialized);
      }
    });
    await pipeline.exec();
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
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
  productList: (page: number, limit: number) =>
    `products:list:${page}:${limit}`,
  category: (id: string) => `category:${id}`,
  categoryList: () => `categories:list`,
  user: (id: string) => `user:${id}`,
  session: (token: string) => `session:${token}`,
  rateLimit: (ip: string, endpoint: string) => `ratelimit:${ip}:${endpoint}`,
};
