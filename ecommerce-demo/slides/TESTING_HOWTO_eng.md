# How To: Quality Testing with Claude Code

Guide to getting complete, high-quality tests in projects developed with Claude Code.

---

## Context: What Happened in Ecommerce-Demo

### Original Plan vs Reality

| Aspect | Original Plan | Reality |
|--------|---------------|---------|
| Test session | Session 12 | Session 2 |
| Explicit requirements | "unit tests" (generic) | No detailed requirements |
| Output | Not specified | 177 complete tests |

### Result Achieved (Without Specific Input)

```
┌─────────────────────────────────────────────────┐
│              GENERATED TEST SUITE                │
├─────────────────────────────────────────────────┤
│                                                  │
│  Unit Tests         ████████████  58 tests      │
│  Integration Tests  ████████████ 102 tests      │
│  Database Tests     ████████████  17 tests      │
│  ─────────────────────────────────────────────  │
│  TOTAL              ████████████ 177 tests      │
│                                                  │
│  Coverage: >80%                                  │
│  Patterns: TestFactory, Testcontainers          │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Why Were the Tests Good?

Claude applied **implicit best practices**:

| Pattern Applied | Description |
|-----------------|-------------|
| **Test Pyramid** | Unit → Integration → E2E (correct proportions) |
| **TestFactory** | Pattern for test data isolation and reusability |
| **Testcontainers** | Real database in Docker for realistic tests |
| **Strategic mocks** | Redis mocked for unit, real for integration |
| **Coverage target** | >80% threshold as enterprise standard |

### Generated Test Structure

```
tests/
├── setup.ts                    # Global setup
├── utils/
│   ├── factories.ts            # TestFactory pattern
│   └── test-server.ts          # Fastify server for tests
├── unit/                       # Isolated, fast tests
│   ├── config.test.ts
│   ├── error-handler.test.ts
│   ├── auth-guard.test.ts
│   └── redis-cache.test.ts
├── integration/                # API tests with mock DB
│   ├── auth.test.ts
│   ├── catalog.test.ts
│   ├── search.test.ts
│   └── orders.test.ts
└── database/                   # Tests with real DB
    └── testcontainers.test.ts
```

---

## How to Replicate in Future Projects

### Option 1: Explicit Prompt (One-Shot)

Use this prompt when requesting tests:

```
Generate complete tests for the backend:

REQUIREMENTS:
- Unit tests for every utility and middleware
- Integration tests for every API endpoint
- Database tests with Testcontainers (real PostgreSQL)
- E2E tests for critical flows

PATTERNS:
- TestFactory pattern for test data generation
- Setup/teardown for test isolation
- Mock only where necessary (prefer real implementations)

TARGET:
- Coverage: >80%
- All tests must pass in CI

STACK:
- Vitest (test runner)
- Supertest (HTTP assertions)
- Testcontainers (real database)
- ioredis-mock (for Redis unit tests)

OUTPUT:
- Configuration file (vitest.config.ts)
- Global setup (tests/setup.ts)
- Test data factory (tests/utils/factories.ts)
- Tests organized by type (unit/, integration/, database/)
```

---

### Option 2: Project CLAUDE.md

Add this section to the initial `CLAUDE.md`:

```markdown
## Testing Requirements

### Philosophy
- TDD when possible: write failing tests before code
- Prefer real implementations over mocks
- Every module must have corresponding tests

### Coverage Target
- Minimum: 80%
- Critical (auth, payments): 90%+

### Test Structure
tests/
├── unit/           # Isolated tests, no external dependencies
├── integration/    # API tests with mock database
├── database/       # Tests with Testcontainers
└── e2e/            # Full-stack tests (optional)

### Required Patterns
- TestFactory for consistent data generation
- Setup/teardown for isolation
- Naming: `{module}.test.ts`

### Stack
- Runner: Vitest
- HTTP: Supertest
- Database: Testcontainers
- Mocking: Only when necessary

### Conventions
- One test file per module/route
- Describe blocks to group related cases
- Test names that describe expected behavior
```

---

### Option 3: Dedicated Skill

Create a skill at `~/.claude/skills/testing/SKILL.md`:

```markdown
---
name: testing
description: >-
  Testing patterns for TypeScript/Node.js projects. Generates complete tests
  with Vitest, Testcontainers and TestFactory pattern. Triggers on "test",
  "coverage", "unit test", "integration test", "TDD", "vitest", "jest".
  PROACTIVE: Generate tests when new code is created.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Testing Skill

## Quick Reference

| Test Type | When | Tool |
|-----------|------|------|
| Unit | Utilities, helpers, pure functions | Vitest |
| Integration | API endpoints, middleware | Vitest + Supertest |
| Database | Queries, transactions, relations | Testcontainers |
| E2E | Critical user flows | Playwright/Cypress |

## Test Pyramid

       /\
      /E2E\        <- Few, slow, expensive
     /──────\
    /Integr. \     <- Moderate
   /──────────\
  /   Unit     \   <- Many, fast, cheap
 /──────────────\

## Required Patterns

### TestFactory
class TestFactory {
  static createUser(overrides?: Partial<User>): User
  static createProduct(overrides?: Partial<Product>): Product
  static createOrder(userId: string, items: OrderItem[]): Order
}

### Setup/Teardown
beforeAll: Setup database/mocks
afterEach: Clean test data
afterAll: Close connections

## Pre-Commit Checklist

- [ ] New tests for new code
- [ ] Existing tests still pass
- [ ] Coverage not decreased
- [ ] No skipped tests (.skip)
```

---

## Options Comparison

| Option | Pros | Cons | When to Use |
|--------|------|------|-------------|
| **Explicit prompt** | Total control | Must repeat each time | One-shot projects |
| **CLAUDE.md** | Automatic for project | Only for that project | Structured projects |
| **Skill** | Reusable everywhere | Initial setup | Multi-project |

---

## Example: Complete Prompt for New Project

```
Create a backend API with complete tests.

STACK:
- Fastify + TypeScript
- Prisma + PostgreSQL
- Redis for cache

MODULES:
- Auth (register, login, me)
- Products (CRUD)
- Orders (create, list, cancel)

TESTING (IMPORTANT):
- Vitest as test runner
- TestFactory pattern for data
- Testcontainers for database tests
- Coverage target: 80%+
- Structure: tests/unit, tests/integration, tests/database

Generate code AND tests together, not separately.
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| "Add tests later" | Superficial tests | Request tests with code |
| No requirements | Claude decides | Specify coverage and types |
| Unit tests only | False security | Request integration + database |
| Mock everything | Fragile tests | Use Testcontainers |

---

## Checklist for Future Projects

Before starting a new project with Claude Code:

- [ ] Define test requirements in CLAUDE.md
- [ ] Specify coverage target (e.g., 80%)
- [ ] Indicate preferred test stack (Vitest, Jest, etc.)
- [ ] Request specific patterns (TestFactory, etc.)
- [ ] Request tests TOGETHER with code, not after

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testcontainers](https://testcontainers.com/)
- [Testing Library](https://testing-library.com/)
- [Test Pyramid - Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html)

---

*Document based on ecommerce-demo experience: 177 tests generated without explicit requirements*
*Version: 1.0.0 - 2026-01-15*
