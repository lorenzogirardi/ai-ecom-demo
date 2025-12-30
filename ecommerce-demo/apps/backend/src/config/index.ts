import "dotenv/config";

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for environment variable: ${key}`);
  }
  return parsed;
}

function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value.toLowerCase() === "true";
}

export const config = {
  // Application
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: getEnvNumber("PORT", 4000),
  host: getEnv("HOST", "0.0.0.0"),
  logLevel: getEnv("LOG_LEVEL", "info"),

  // Database
  databaseUrl: getEnv("DATABASE_URL"),

  // Redis
  redis: {
    host: getEnv("REDIS_HOST", "localhost"),
    port: getEnvNumber("REDIS_PORT", 6379),
    password: getEnv("REDIS_PASSWORD", ""),
    tlsEnabled: getEnvBoolean("REDIS_TLS_ENABLED", false),
  },

  // JWT
  jwt: {
    secret: getEnv("JWT_SECRET", "development-secret-change-me"),
    expiresIn: getEnv("JWT_EXPIRES_IN", "7d"),
    refreshExpiresIn: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
  },

  // Bcrypt
  bcrypt: {
    saltRounds: getEnvNumber("BCRYPT_SALT_ROUNDS", 12),
  },

  // CORS - supports multiple origins (comma-separated) and wildcards
  cors: {
    origins: getEnv("CORS_ORIGINS", "http://localhost:3000")
      .split(",")
      .map((o) => o.trim()),
    credentials: getEnvBoolean("CORS_CREDENTIALS", true),
  },

  // Rate Limiting
  rateLimit: {
    enabled: getEnvBoolean("ENABLE_RATE_LIMITING", true),
    max: getEnvNumber("RATE_LIMIT_MAX", 100),
    timeWindow: getEnvNumber("RATE_LIMIT_TIME_WINDOW", 60000),
    bypassToken: getEnv("RATE_LIMIT_BYPASS_TOKEN", "k6-load-test-bypass-token-2025"),
  },

  // Swagger
  swagger: {
    enabled: getEnvBoolean("ENABLE_SWAGGER", true),
  },

  // AWS
  aws: {
    region: getEnv("AWS_REGION", "us-east-1"),
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID", ""),
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
    s3Bucket: getEnv("AWS_S3_BUCKET", ""),
  },

  // Stripe
  stripe: {
    secretKey: getEnv("STRIPE_SECRET_KEY", ""),
    webhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
  },

  // Email
  smtp: {
    host: getEnv("SMTP_HOST", ""),
    port: getEnvNumber("SMTP_PORT", 587),
    user: getEnv("SMTP_USER", ""),
    password: getEnv("SMTP_PASSWORD", ""),
    from: getEnv("SMTP_FROM", ""),
  },

  // Sentry
  sentry: {
    dsn: getEnv("SENTRY_DSN", ""),
  },

  // Helpers
  isDevelopment: getEnv("NODE_ENV", "development") === "development",
  isProduction: getEnv("NODE_ENV", "development") === "production",
  isTest: getEnv("NODE_ENV", "development") === "test",
} as const;

export type Config = typeof config;
