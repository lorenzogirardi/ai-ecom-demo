---
layout: post
title: "Working with Claude Code: A Practical Guide"
date: 2025-12-31
category: AI-Augmented
reading_time: 15
tags: [claude-code, ai, methodology, prompt-engineering, context]
excerpt: "Before starting the 10-day journey, understanding how to collaborate effectively with AI. Context files, prompt patterns, and why Claude makes certain decisions."
takeaway: "AI collaboration is a skill. The CLAUDE.md file is your project's memory. Specific prompts get specific results."
---

## Before Day 1: Understanding the Tool

This post explains **how** we worked with Claude Code throughout the 10-day project. Understanding these patterns will help you apply the same methodology to your projects.

## What is Claude Code?

Claude Code is Anthropic's CLI tool that brings Claude directly into your development environment. Unlike chat interfaces, it:

- **Reads your codebase** - Understands project structure, patterns, and conventions
- **Executes commands** - Runs tests, builds, deployments
- **Edits files** - Makes changes directly in your code
- **Maintains context** - Remembers decisions across the session

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Developer                Claude Code              Codebase     │
│       │                        │                        │        │
│       │  "Add auth module"     │                        │        │
│       │───────────────────────>│                        │        │
│       │                        │  Read CLAUDE.md        │        │
│       │                        │───────────────────────>│        │
│       │                        │  Read existing modules │        │
│       │                        │───────────────────────>│        │
│       │                        │                        │        │
│       │                        │  Create files          │        │
│       │                        │───────────────────────>│        │
│       │                        │  Run tests             │        │
│       │                        │───────────────────────>│        │
│       │   "Done. 15 tests      │                        │        │
│       │<───────────────────────│                        │        │
│       │    passing"            │                        │        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## The CLAUDE.md File: Project Memory

The most important file for AI collaboration is `CLAUDE.md`. This file is read at the start of every session, giving Claude full project context.

### What Goes in CLAUDE.md

```markdown
# CLAUDE.md - E-commerce Demo

## Project Overview
E-commerce monorepo for AWS EKS deployment with:
- Frontend: Next.js 16, TypeScript, Tailwind CSS
- Backend: Fastify, Prisma, PostgreSQL, Redis
- Infrastructure: Terraform, Helm, GitHub Actions

## Project Structure
ecommerce-demo/
├── apps/
│   ├── frontend/    # Next.js App Router
│   └── backend/     # Fastify API
├── infra/terraform/ # AWS infrastructure
└── helm/            # Kubernetes charts

## Conventions
- Use Zod for validation
- Redis for caching (5 min TTL)
- JWT for authentication
- All prices in cents (integer)

## Current State
- [x] Backend API complete
- [x] Frontend components
- [ ] AWS deployment  <- Currently working on
- [ ] Load testing
```

### Why This Matters

Without CLAUDE.md, every session starts from zero:

| Without CLAUDE.md | With CLAUDE.md |
|-------------------|----------------|
| "What framework are we using?" | Knows it's Fastify + Next.js |
| Creates inconsistent patterns | Follows established conventions |
| Asks about project structure | Navigates directly to files |
| Generic solutions | Context-aware decisions |

### Keeping It Updated

At the end of each session, we update CLAUDE.md:

```markdown
## Current State
- [x] Backend API complete
- [x] Frontend components
- [x] AWS deployment       <- Just completed
- [ ] Load testing         <- Next session
```

This creates continuity across days and sessions.

## Prompt Patterns That Work

### 1. Be Specific, Not Vague

```
❌ "Add authentication"

✅ "Add JWT authentication to the backend:
   - Use @fastify/jwt
   - Token expires in 7 days
   - Store user in request.user after verification
   - Follow existing patterns in src/modules/auth/"
```

### 2. Reference Existing Patterns

```
"Create the orders module:
- Follow the same structure as src/modules/catalog/
- Use Zod schemas like catalog.schema.ts
- Include the same caching pattern from catalog.service.ts"
```

Claude will read those files and replicate the patterns exactly.

### 3. Ask for Tests Together

```
"Create the search module with routes, service, and tests.
Include:
- Unit tests for the service
- Integration tests for the routes
- Edge cases: empty results, special characters, pagination"
```

This ensures tests are written alongside code, not as an afterthought.

### 4. Iterate, Don't Over-Specify

Instead of one massive prompt, iterate:

```
1. "Create basic CRUD routes for products"
2. [Review output]
3. "Add Redis caching with 5 minute TTL"
4. [Review output]
5. "Add pagination with cursor-based approach"
```

### 5. Provide Context for Decisions

```
"We need rate limiting for the auth endpoints.
Context:
- This is a public API
- We expect ~1000 users
- Login attempts should be limited to prevent brute force
- But we also have k6 load tests that need to bypass limits

What do you recommend?"
```

## How Claude Makes Decisions

### Pattern Recognition

When Claude sees existing code:

```typescript
// src/modules/catalog/catalog.routes.ts
fastify.get('/products', async (request) => {
  const products = await catalogService.getProducts();
  return { success: true, data: products };
});
```

It understands and replicates the pattern:

```typescript
// src/modules/orders/orders.routes.ts (generated)
fastify.get('/orders', async (request) => {
  const orders = await ordersService.getOrders(request.user.id);
  return { success: true, data: orders };
});
```

### Convention Over Configuration

Claude prefers explicit conventions. In our CLAUDE.md:

```markdown
## Conventions
- Response format: { success: true, data: ... }
- Errors: { success: false, error: { code, message } }
- Prices in cents (integer, not decimal)
```

These become rules Claude follows everywhere.

### Explaining Its Reasoning

Claude often explains why:

```
I chose Redis over in-memory caching because:
1. Your CLAUDE.md mentions EKS with multiple pods
2. In-memory cache wouldn't be shared across pods
3. You already have ElastiCache in your Terraform modules

I set TTL to 5 minutes because:
1. Product data changes infrequently
2. This matches the pattern in catalog.service.ts
3. It balances freshness vs. database load
```

## When Claude Excels

### Boilerplate Generation

```
"Create a new Terraform module for RDS with:
- PostgreSQL 15
- Multi-AZ disabled (demo)
- Security group for EKS access
- Outputs: endpoint, port, connection string"
```

Result: Complete module in 2 minutes vs. 30 minutes manually.

### Test Writing

```
"Add comprehensive tests for the auth service:
- Successful login
- Wrong password
- User not found
- Invalid email format
- Token expiration"
```

Result: 15+ test cases covering edge cases you might forget.

### Consistency Enforcement

Once patterns are established, Claude applies them everywhere:
- Error handling style
- Logging format
- Response structure
- Naming conventions

### CVE Analysis

```
"Analyze security/reports/trivy-backend.json
For each CVE:
1. Search the codebase for usage
2. Determine if the attack vector is exposed
3. Prioritize based on actual risk
4. Suggest remediation"
```

Result: 36 CVEs analyzed, 35 dismissed as not applicable, 1 actionable item identified.

## When Human Input is Essential

### Architecture Decisions

Claude proposes, humans decide:

```
Claude: "For caching, we could use:
1. Redis (external, shared across pods)
2. Node-cache (in-memory, per-pod)
3. No cache (simpler, slower)

Given your EKS deployment with multiple pods, I recommend Redis.
But this adds infrastructure complexity. Your choice."
```

### Security Decisions

Claude flags security concerns but waits for approval:

```
Claude: "I notice you're storing the JWT secret in plain text.
Options:
1. AWS Secrets Manager (recommended for production)
2. Kubernetes Secrets (simpler, less secure)
3. Environment variables (current, not recommended)

For a demo project, option 2 is sufficient.
For production, I'd recommend option 1."
```

### Trade-off Decisions

When trade-offs exist, Claude presents options:

```
Claude: "For pagination, we could use:
1. Offset-based: Simple, but slow for large offsets
2. Cursor-based: Faster, but more complex to implement
3. Keyset: Best performance, requires ordered unique column

Your products table has ~1000 items. Offset would work fine.
But if you expect growth, cursor-based is more future-proof."
```

## Debugging with AI

### The Diagnostic Approach

When something fails, provide context:

```
"The /api/products endpoint returns 500 in production.
- Works locally
- Started after the last deployment
- Logs show: 'ECONNREFUSED 127.0.0.1:6379'
- Redis is on ElastiCache, not localhost

What's wrong?"
```

Claude can correlate the error with configuration files and identify the issue.

### Stack Trace Analysis

```
"This test fails intermittently:

Error: Timeout - Async callback was not invoked within 5000ms
  at auth.service.test.ts:45

The test passes locally but fails in CI 30% of the time."
```

Claude will analyze race conditions, mock issues, and timing problems.

## Common Mistakes to Avoid

### 1. Too Vague

```
❌ "Make it better"
❌ "Fix the bug"
❌ "Add security"

✅ "Reduce response time for /api/products from 200ms to <50ms"
✅ "The cart total shows NaN when quantity is empty string"
✅ "Add rate limiting: 100 requests per minute per IP"
```

### 2. No Context

```
❌ "Why doesn't this work?" [no code shown]

✅ "This query returns empty:
   SELECT * FROM products WHERE category = 'shoes'
   But I can see products with category='shoes' in the database.
   Schema: category is VARCHAR(50)"
```

### 3. Assuming Claude Remembers

Sessions have limits. At the start of a new session:

```
✅ "Continuing from yesterday. We were implementing:
   - Cart persistence (done)
   - Checkout flow (in progress, stuck on payment integration)

   The issue: Stripe webhook isn't reaching our endpoint."
```

### 4. Not Reviewing Output

Claude can make mistakes. Always:
- Review generated code before committing
- Run tests after changes
- Check for security implications
- Verify business logic correctness

## Session Workflow

### Starting a Session

1. Claude reads CLAUDE.md automatically
2. State what you want to accomplish
3. Reference any relevant context from previous sessions

```
"Today we're implementing the checkout flow.
Yesterday we finished the cart module.
The order schema is already in prisma/schema.prisma.
Let's start with the checkout route."
```

### During the Session

- Review changes incrementally
- Run tests frequently
- Ask Claude to explain decisions you don't understand
- Update CLAUDE.md with new conventions

### Ending a Session

1. Run full test suite
2. Commit working code
3. Update CLAUDE.md with progress
4. Note any pending items for next session

```markdown
## Current State (updated)
- [x] Cart module with Redis persistence
- [x] Checkout flow with Stripe integration
- [ ] Order confirmation emails  <- Next session
- [ ] Admin order management
```

## Real Examples from This Project

### Day 2: Backend API

Prompt:
```
"Create the catalog module following the auth module structure.
Include:
- GET /products with pagination and filtering
- GET /products/:id with Redis caching
- Zod schemas for validation
- Unit and integration tests"
```

Result: Complete module in 20 minutes, 45 tests passing.

### Day 5: Infrastructure

Prompt:
```
"Create Terraform modules for:
- EKS cluster (1.31, managed node group, t3.medium)
- RDS PostgreSQL (single AZ for demo)
- ElastiCache Redis (single node)

Follow the VPC module patterns. Output all connection strings."
```

Result: Production-ready infrastructure in 2 hours.

### Day 9: Security Hardening

Prompt:
```
"Analyze our security posture:
1. Check Kubernetes security contexts
2. Review network policies
3. Audit auth implementation
4. Check for OWASP Top 10 vulnerabilities

Create a prioritized list of improvements."
```

Result: 12 security improvements identified and implemented.

## Summary

Working effectively with Claude Code requires:

| Principle | Practice |
|-----------|----------|
| **Context** | Maintain CLAUDE.md as project memory |
| **Specificity** | Detailed prompts get detailed results |
| **Patterns** | Reference existing code for consistency |
| **Iteration** | Small steps, frequent reviews |
| **Validation** | Always verify AI output |

The AI doesn't replace your expertise. It amplifies it. You still make the decisions, understand the trade-offs, and own the code. Claude just helps you move 10x faster.

---

*Next: [Day 1 - Foundation](/blog/foundation/) - Let's start building.*