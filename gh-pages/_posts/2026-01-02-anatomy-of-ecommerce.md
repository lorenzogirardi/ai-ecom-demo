---
layout: post
title: "Anatomy of an E-commerce: Functional Architecture"
date: 2026-01-02
category: Architecture
reading_time: 8
tags: [architecture, design, ecommerce, api-design]
excerpt: "Before writing code, you need to understand the domain. Here's how a modern e-commerce system should be structured."
takeaway: "Define bounded contexts and data flows before writing code. AI can accelerate implementation, but humans must define the architecture."
---

## Thinking Before Coding

One of the biggest mistakes in software development is jumping straight to code. **AI amplifies this risk** — it's so easy to generate code that we might skip the thinking phase.

Before our 10-day sprint, we needed a clear architectural vision:
- What are the core domains?
- How do they interact?
- What are the data models?
- What are the API contracts?

## Core Domains

An e-commerce platform has several bounded contexts:

```
┌─────────────────────────────────────────────────────────┐
│                    E-COMMERCE PLATFORM                   │
├──────────────┬──────────────┬──────────────┬────────────┤
│     AUTH     │   CATALOG    │    CART      │   ORDERS   │
├──────────────┼──────────────┼──────────────┼────────────┤
│ - Users      │ - Products   │ - Cart Items │ - Orders   │
│ - Sessions   │ - Categories │ - Pricing    │ - Payments │
│ - JWT        │ - Search     │ - Discounts  │ - Shipping │
└──────────────┴──────────────┴──────────────┴────────────┘
```

### 1. Authentication Domain

**Responsibilities:**
- User registration and login
- Password hashing (bcrypt)
- JWT token management
- Session handling

**Key decisions:**
- Stateless JWT (no session store needed)
- 12-round bcrypt for password hashing
- Token expiry: 7 days

### 2. Catalog Domain

**Responsibilities:**
- Product management (CRUD)
- Category hierarchy
- Search and filtering
- Image handling

**Key decisions:**
- Cache-aside pattern with Redis
- Full-text search with PostgreSQL (later: OpenSearch)
- Hierarchical categories with parent_id

### 3. Cart Domain

**Responsibilities:**
- Cart item management
- Price calculation
- Stock validation
- Guest cart → user cart merge

**Key decisions:**
- Server-side cart (not localStorage)
- Real-time stock validation
- Cart expires after 7 days

### 4. Orders Domain

**Responsibilities:**
- Order creation from cart
- Payment processing
- Order status management
- Order history

**Key decisions:**
- Synchronous checkout (async in production)
- Order status: pending → paid → shipped → delivered
- Immutable order items (snapshot prices)

## Data Model

### Entity Relationship

```
User (1) ────────── (N) Order
  │                      │
  │                      │
  └── (1) ─── (N) ───────┤
      Cart              (N)
       │            OrderItem
       │                 │
       └── (N) ──────────┘
           CartItem      │
               │         │
               └── (N) ──┘
                  Product
                     │
                     │
                  (N)│(1)
                     │
                 Category
```

### Prisma Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(CUSTOMER)
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  imageUrl    String?
  category    Category @relation(fields: [categoryId])
  categoryId  String
  createdAt   DateTime @default(now())
}

model Category {
  id       String     @id @default(uuid())
  name     String
  slug     String     @unique
  products Product[]
  parent   Category?  @relation("CategoryHierarchy")
  parentId String?
  children Category[] @relation("CategoryHierarchy")
}

model Order {
  id         String      @id @default(uuid())
  user       User        @relation(fields: [userId])
  userId     String
  items      OrderItem[]
  total      Decimal     @db.Decimal(10, 2)
  status     OrderStatus @default(PENDING)
  createdAt  DateTime    @default(now())
}
```

## API Design

### RESTful Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/catalog/products` | List products |
| GET | `/api/catalog/products/:slug` | Get product |
| GET | `/api/catalog/categories` | List categories |
| GET | `/api/search?q=term` | Search products |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add to cart |
| DELETE | `/api/cart/items/:id` | Remove from cart |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List user orders |
| GET | `/api/orders/:id` | Get order detail |

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [...]
  }
}
```

## Caching Strategy

### Cache-Aside Pattern

```
┌──────────┐     ┌───────────┐     ┌──────────┐
│  Client  │────▶│  Backend  │────▶│  Redis   │
└──────────┘     └───────────┘     └──────────┘
                       │                 │
                       │    Cache Miss   │
                       ▼                 │
                 ┌───────────┐           │
                 │ PostgreSQL│◀──────────┘
                 └───────────┘    Set Cache
```

**What we cache:**
- Product listings (TTL: 5 minutes)
- Category tree (TTL: 10 minutes)
- Search results (TTL: 2 minutes)
- User sessions (TTL: 7 days)

**What we don't cache:**
- Cart (real-time accuracy)
- Orders (transactional)
- Stock counts (consistency)

## Technology Stack Decisions

### Why Fastify over Express?

| Aspect | Express | Fastify |
|--------|---------|---------|
| Performance | ~15k req/s | ~30k req/s |
| Schema validation | Manual | Built-in |
| TypeScript | Add-on | Native |
| Plugin system | Middleware | Encapsulated |

### Why Prisma over TypeORM?

| Aspect | TypeORM | Prisma |
|--------|---------|--------|
| Type safety | Partial | Full |
| Query API | Builder | Intuitive |
| Migrations | Complex | Simple |
| Schema file | Decorators | Dedicated |

### Why Next.js 16?

- **App Router**: Modern React patterns
- **Server Components**: Reduced client bundle
- **Turbopack**: Fast development builds
- **Built-in optimization**: Images, fonts, scripts

## The CLAUDE.md File

To maintain context across sessions, we created a `CLAUDE.md` file:

```markdown
# E-commerce Demo Project

## Structure
- apps/frontend: Next.js 16
- apps/backend: Fastify + Prisma
- infra/terraform: AWS infrastructure
- helm/: Kubernetes charts

## Conventions
- Use Zod for validation
- Redis for caching
- JWT for authentication
- All prices in cents (integer)

## Current State
- [x] Backend API complete
- [x] Frontend components
- [ ] AWS deployment
- [ ] Load testing
```

This file is read by Claude Code at the start of each session, providing full project context.

## Summary

Before writing a single line of code:

1. **Define domains** - Clear bounded contexts
2. **Design data model** - Entities and relationships
3. **Plan APIs** - RESTful contracts
4. **Choose stack** - Technology decisions with rationale
5. **Document context** - CLAUDE.md for AI continuity

With this foundation, we're ready to start building.

---

*Next: [Backend in 2 Days: Fastify + Prisma + Claude Code](/blog/backend-2-days/)*
