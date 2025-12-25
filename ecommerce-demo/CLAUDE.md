# CLAUDE.md - E-commerce Demo

## Project Overview

E-commerce monorepo for AWS EKS deployment with:
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, React Query
- **Backend**: Fastify, TypeScript, Prisma, PostgreSQL, Redis
- **Infrastructure**: Terraform (AWS), Helm (Kubernetes), GitHub Actions

## Project Structure

```
ecommerce-demo/
├── apps/
│   ├── frontend/           # Next.js 16 App Router
│   │   ├── src/app/        # layout.tsx, page.tsx, providers.tsx, globals.css
│   │   ├── src/components/ # layout, ui, products, cart components
│   │   └── Dockerfile      # Multi-stage build with standalone output
│   └── backend/            # Fastify API
│       └── Dockerfile      # Multi-stage build with non-root user
│       ├── src/
│       │   ├── config/     # Configuration (index.ts)
│       │   ├── middleware/ # auth-guard.ts, error-handler.ts
│       │   ├── modules/    # auth, catalog, search, orders (routes only)
│       │   ├── utils/      # prisma.ts, redis.ts, logger.ts
│       │   └── server.ts   # Entry point
│       └── prisma/         # schema.prisma (no seed.ts yet)
├── infra/terraform/
│   ├── modules/            # network, eks, database, cache, cdn
│   └── environments/demo/  # main.tf, variables.tf, providers.tf, backend.tf
├── helm/
│   ├── frontend/           # Chart + templates (deployment, service, ingress, hpa, sa)
│   └── backend/            # Chart + templates + externalsecret
├── .github/workflows/      # frontend-ci-cd.yml, backend-ci-cd.yml
├── scripts/                # setup-infra.sh, deploy-all.sh, local-dev.sh, seed-data.sh
└── docs/                   # README, SETUP, DEVELOPMENT, DEPLOYMENT, API, EXECUTION_PLAN
```

## Development Commands

```bash
# Start local environment
docker-compose up -d              # PostgreSQL + Redis
npm install                       # Dependencies
npm run dev                       # Frontend :3000 + Backend :4000

# Database
npm run db:generate -w apps/backend   # Generate Prisma client
npm run db:push -w apps/backend       # Push schema to DB
npm run db:migrate -w apps/backend    # Run migrations

# Build and test
npm run build                     # Build all
npm run test                      # Test all
npm run lint                      # Lint all
```

## Current State (Accurate)

### Completed ✅

**Backend:**
- Server entry point (server.ts)
- Configuration module
- Middleware (auth-guard, error-handler)
- 4 API modules with routes: auth, catalog, search, orders
- Utilities: Prisma client, Redis client, Pino logger
- Prisma schema (User, Category, Product, Order, OrderItem)
- Dockerfile (multi-stage, non-root user, health check)
- Complete test suite:
  - Unit tests: config, error-handler, auth-guard, redis-cache
  - Integration tests: auth, catalog, search, orders routes
  - Database tests with Testcontainers
  - E2E Docker tests

**Frontend:**
- Base layout with metadata
- Homepage with hero section and feature cards
- Providers (React Query, Toaster)
- Tailwind CSS with custom components (.btn, .card, .input)
- Next.js 16 config with Turbopack
- Dockerfile (multi-stage, standalone output)
- Components: Header, Footer, ProductCard, ProductGrid, SearchBar, CartItem, CartSummary

**Infrastructure:**
- Terraform modules: network, eks, database, cache, cdn
- Demo environment configuration
- Helm charts for frontend and backend
- GitHub Actions CI/CD workflows
- Docker Compose for local development
- Automation scripts

**Documentation:**
- README, SETUP, DEVELOPMENT, DEPLOYMENT, API docs
- Execution plan (IT + EN)
- Session recap (IT + EN)

### NOT Completed ❌

**Backend:**
- [x] prisma/seed.ts ✅ (aggiunto in Sessione 2)

**Frontend:**
- [x] Hooks (useProducts, useCategories, useCart) ✅ (aggiunto in Sessione 2)
- [x] API client (Axios + React Query) ✅ (aggiunto in Sessione 2)
- [x] Pages (products, categories, cart) ✅ (aggiunto in Sessione 2)
- [ ] Pages (checkout, auth/login, auth/register)
- [ ] Middleware for auth

## Technical Notes

### Next.js 16
- Uses Turbopack by default
- Requires `turbopack: {}` in next.config.js
- jsx compiler set to "react-jsx"

### Backend Environment
Required in `.env` (copy from `.env.example`):
```
DATABASE_URL="postgresql://ecommerce:ecommerce_secret@localhost:5432/ecommerce_db"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_secret
JWT_SECRET=your-secret-key
```

### Local Services (Docker Compose)
- PostgreSQL: localhost:5432 (user: ecommerce, pass: ecommerce_secret)
- Redis: localhost:6379 (pass: redis_secret)
- Adminer: localhost:8080

## Patterns and Conventions

### Backend (Fastify)
- Modules in `src/modules/{name}/{name}.routes.ts`
- Validation with Zod schemas
- Redis caching for catalog and search
- JWT authentication via @fastify/jwt
- Logging with Pino

### Frontend (Next.js)
- App Router in src/app/
- Components should go in src/components/{ui,layout,cart,features}
- Hooks should go in src/hooks/
- API client with Axios + React Query
- Styling: Tailwind + custom classes in globals.css

### Terraform
- Reusable modules in `infra/terraform/modules/`
- Environment configs in `infra/terraform/environments/{env}/`
- S3 + DynamoDB backend for state

#### Current State (Single State)
All resources in one state file: `demo/terraform.tfstate`
- Network, EKS, RDS, ElastiCache, CDN, ECR deployed together
- High blast radius, slow applies, coupled lifecycles

#### Planned Refactor: Layer Separation
```
Layer 1: PLATFORM (core)           → platform/terraform.tfstate
├── Network (VPC, Subnets, NAT)
└── EKS (Cluster, Node Groups, IAM)
    Frequency: Rare (months)
    Risk: High
    Team: Platform/SRE

Layer 2: APPLICATION (services)    → services/terraform.tfstate
├── Database (RDS PostgreSQL)
├── Cache (ElastiCache Redis)
├── CDN (CloudFront)
├── ECR Repositories
└── Secrets Manager
    Frequency: Often (weeks)
    Risk: Medium
    Team: DevOps/App
```

Benefits:
- Isolated blast radius per layer
- Faster applies (~2-5 min vs ~15-20 min)
- Parallel work by different teams
- Per-layer rollback capability
- Differentiated approval processes by risk level

Implementation:
1. Create `infra/terraform/environments/demo/platform/` with network + eks
2. Create `infra/terraform/environments/demo/services/` with database + cache + cdn + ecr
3. Use `terraform_remote_state` data source to share outputs between layers
4. Separate state files in S3: `demo/platform.tfstate`, `demo/services.tfstate`
5. Update CI/CD to deploy layers independently with dependencies

### Helm
- Environment values: `values-{env}.yaml`
- ExternalSecrets for AWS Secrets Manager integration

## Next Steps (Priority Order)

1. ~~**Dockerfiles** - Backend and frontend multi-stage builds~~ ✅
2. ~~**React Components** - Header, Footer, ProductCard, ProductGrid, SearchBar, CartItem, CartSummary~~ ✅
3. ~~**API Client + Hooks** - useProducts, useCart, useAuth with React Query~~ ✅
4. ~~**Frontend Pages** - /products, /products/[slug], /categories, /categories/[slug], /cart~~ ✅
5. ~~**Seed Data** - prisma/seed.ts with demo users, categories, products~~ ✅
6. ~~**Backend Tests** - Unit tests for auth, catalog, orders modules~~ ✅ (177 tests)
7. **Auth Pages** - /auth/login, /auth/register, /checkout
8. **Security** - Rate limiting review, CORS config
9. **AWS Deploy** - Terraform apply, Helm install, E2E testing

## Planned Refactors

### Terraform Layer Separation (Priority: Medium)
**Status:** Not started
**Effort:** ~2-3 hours

Separate Terraform into two layers for better isolation:
- **Layer 1 (Platform):** Network + EKS → `platform/terraform.tfstate`
- **Layer 2 (Services):** RDS + ElastiCache + CDN + ECR → `services/terraform.tfstate`

See "Terraform > Planned Refactor: Layer Separation" section for full details.

**When to implement:** Before production deployment or when team grows beyond 2-3 people.

## Links

- Repository: https://github.com/lorenzogirardi/ai-ecom-demo
- Execution Plan: /docs/EXECUTION_PLAN.md
