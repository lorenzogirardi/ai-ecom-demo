---
layout: post
title: "Backend in 2 Days: Fastify + Prisma + Claude Code"
date: 2026-01-03
category: AI-Augmented
reading_time: 10
tags: [fastify, prisma, typescript, ai-development, testing]
excerpt: "How Claude Code helped build a complete backend API with 177 tests in just 2 days. Practical prompts and patterns."
takeaway: "The real value of AI is maintaining consistency and generating tests alongside code. The developer guides, AI executes."
---

## Day 1-2: The Backend Sprint

With our architecture defined, it was time to build. The goal: **complete backend API with tests** in 2 days.

### What We Built

- 4 API modules (auth, catalog, search, orders)
- Prisma schema with migrations
- Redis caching layer
- JWT authentication
- 177 automated tests
- Docker containerization

## Setting Up the Project

### Initial Structure

```bash
apps/backend/
├── src/
│   ├── config/          # Environment configuration
│   ├── middleware/      # Auth guards, error handlers
│   ├── modules/         # Feature modules
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── search/
│   │   └── orders/
│   ├── utils/           # Prisma, Redis, Logger
│   └── server.ts        # Entry point
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
└── Dockerfile
```

### The Prompt Pattern

For each module, I used a consistent prompt structure:

```
Create the [module] module for our e-commerce backend:

Requirements:
- [List specific features]
- Use Zod for validation
- Follow existing patterns in src/modules/auth

Files needed:
- [module].routes.ts (Fastify routes)
- [module].service.ts (Business logic)
- [module].schema.ts (Zod schemas)

Include tests in tests/[module]/
```

## Auth Module

### Routes

```typescript
// src/modules/auth/auth.routes.ts
import { FastifyPluginAsync } from 'fastify';
import { authService } from './auth.service';
import { RegisterSchema, LoginSchema } from './auth.schema';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register
  fastify.post('/register', {
    schema: { body: RegisterSchema }
  }, async (request, reply) => {
    const user = await authService.register(request.body);
    return reply.status(201).send({ success: true, data: user });
  });

  // Login
  fastify.post('/login', {
    schema: { body: LoginSchema }
  }, async (request, reply) => {
    const { user, token } = await authService.login(request.body);
    return { success: true, data: { user, token } };
  });

  // Get current user
  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, async (request) => {
    return { success: true, data: request.user };
  });
};
```

### Validation with Zod

```typescript
// src/modules/auth/auth.schema.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
```

### Security: bcrypt + JWT

```typescript
// src/modules/auth/auth.service.ts
import bcrypt from 'bcrypt';
import { prisma } from '../../utils/prisma';
import { fastify } from '../../server';

const SALT_ROUNDS = 12;

export const authService = {
  async register(input: RegisterInput) {
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name
      },
      select: { id: true, email: true, name: true }
    });

    return user;
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user || !await bcrypt.compare(input.password, user.password)) {
      throw new Error('Invalid credentials');
    }

    const token = fastify.jwt.sign({ userId: user.id });

    return { user, token };
  }
};
```

## Catalog Module with Caching

### Cache-Aside Implementation

```typescript
// src/modules/catalog/catalog.service.ts
import { redis } from '../../utils/redis';
import { prisma } from '../../utils/prisma';

const CACHE_TTL = 300; // 5 minutes

export const catalogService = {
  async getProducts(options: { page: number; limit: number }) {
    const cacheKey = `products:${options.page}:${options.limit}`;

    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query database
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        include: { category: true }
      }),
      prisma.product.count()
    ]);

    const result = { products, total, page: options.page };

    // Set cache
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
  },

  async getProductBySlug(slug: string) {
    const cacheKey = `product:${slug}`;

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true }
    });

    if (product) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(product));
    }

    return product;
  }
};
```

## Testing Strategy

### Test Structure

```
tests/
├── unit/
│   ├── config.test.ts
│   ├── error-handler.test.ts
│   ├── auth-guard.test.ts
│   └── redis-cache.test.ts
├── integration/
│   ├── auth.routes.test.ts
│   ├── catalog.routes.test.ts
│   ├── search.routes.test.ts
│   └── orders.routes.test.ts
├── database/
│   └── prisma.test.ts (Testcontainers)
└── e2e/
    └── docker.test.ts
```

### Integration Tests with Vitest

```typescript
// tests/integration/auth.routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../../src/server';

describe('Auth Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.email).toBe('test@example.com');
    });

    it('should reject duplicate email', async () => {
      // First registration
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email: 'dup@test.com', password: 'password123' }
      });

      // Duplicate attempt
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email: 'dup@test.com', password: 'password123' }
      });

      expect(response.statusCode).toBe(409);
    });
  });
});
```

### Database Tests with Testcontainers

```typescript
// tests/database/prisma.test.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';

describe('Database Integration', () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .start();

    process.env.DATABASE_URL = container.getConnectionUri();

    // Run migrations
    execSync('npx prisma migrate deploy');

    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await container.stop();
  });

  it('should create and retrieve user', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@db.com',
        password: 'hashed',
        name: 'DB Test'
      }
    });

    const found = await prisma.user.findUnique({
      where: { id: user.id }
    });

    expect(found?.email).toBe('test@db.com');
  });
});
```

## AI-Assisted Test Generation

One of Claude Code's strongest capabilities is **generating tests alongside code**.

### The Prompt

```
Add comprehensive tests for the catalog service:
- Unit tests for caching logic
- Integration tests for all endpoints
- Edge cases: empty results, invalid slugs, pagination bounds
- Follow existing test patterns in tests/integration/auth.routes.test.ts
```

### Result: 177 Tests

| Module | Unit | Integration | E2E | Total |
|--------|------|-------------|-----|-------|
| Config | 8 | - | - | 8 |
| Auth | 12 | 24 | 4 | 40 |
| Catalog | 15 | 28 | 6 | 49 |
| Search | 10 | 18 | 4 | 32 |
| Orders | 14 | 26 | 8 | 48 |
| **Total** | **59** | **96** | **22** | **177** |

## Docker Configuration

```dockerfile
# apps/backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine AS runner

WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fastify -u 1001

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

USER fastify
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:4000/health || exit 1

CMD ["node", "dist/server.js"]
```

## Key Learnings

### What AI Did Well

1. **Boilerplate generation** - Routes, schemas, services followed patterns perfectly
2. **Test coverage** - Generated edge cases I might have missed
3. **Consistency** - Same patterns across all modules
4. **Documentation** - JSDoc comments on all functions

### What Required Human Input

1. **Architecture decisions** - AI proposed, human decided
2. **Security considerations** - bcrypt rounds, JWT expiry
3. **Business logic edge cases** - Cart merging, stock validation
4. **Performance tuning** - Cache TTLs, query optimization

## Results

After 2 days:

| Metric | Value |
|--------|-------|
| API Endpoints | 15 |
| Test Count | 177 |
| Test Coverage | >80% |
| Lines of Code | ~3,500 |
| Time Spent | ~16 hours |

Traditional estimate for same scope: **2-3 weeks** with a 3-person team.

---

*Next: [Frontend in 1 Day: Next.js 16 + React + AI](/blog/frontend-1-day/)*
