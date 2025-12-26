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
│   │   ├── src/
│   │   │   ├── app/        # Pages (auth, checkout, account, products, etc.)
│   │   │   ├── components/ # layout, ui, products, cart, checkout
│   │   │   ├── hooks/      # useProducts, useCart, useAuth, useOrders, useSearch
│   │   │   ├── lib/        # api.ts, auth-context.tsx
│   │   │   └── types/      # api.ts, auth.ts, models.ts
│   │   ├── tests/          # Frontend tests (29 tests)
│   │   │   ├── hooks/      # useAuth, useOrders, useSearch tests
│   │   │   └── components/ # AddressForm tests
│   │   └── Dockerfile      # Multi-stage build with standalone output
│   └── backend/            # Fastify API
│       ├── Dockerfile      # Multi-stage build with non-root user
│       ├── src/
│       │   ├── config/     # Configuration with CORS wildcard support
│       │   ├── middleware/ # auth-guard.ts, error-handler.ts
│       │   ├── modules/    # auth, catalog, search, orders
│       │   ├── utils/      # prisma.ts, redis.ts, logger.ts
│       │   └── server.ts   # Entry point
│       ├── prisma/         # schema.prisma, seed.ts
│       └── tests/          # Backend tests (177 tests)
├── infra/terraform/
│   ├── modules/            # network, eks, database, cache, cdn
│   └── environments/demo/  # main.tf, variables.tf, providers.tf, backend.tf
├── helm/
│   ├── frontend/           # Chart + templates (deployment, service, ingress, hpa, sa)
│   └── backend/            # Chart + templates + externalsecret
├── argocd/                 # (Day 4) ArgoCD configuration
│   ├── install/            # ArgoCD Helm values
│   ├── projects/           # ArgoCD Project definitions
│   └── applications/       # Backend + Frontend Applications
├── security/               # (Day 4) Security reports
│   └── reports/            # Trivy JSON reports for Claude analysis
├── slides/                 # Session recaps (IT + EN)
├── .github/workflows/      # CI/CD workflows (enhanced Day 4)
├── scripts/                # setup-infra.sh, deploy-all.sh, local-dev.sh, seed-data.sh
└── docs/                   # README, SETUP, DEVELOPMENT, DEPLOYMENT, API, EXECUTION_PLAN
```

## Development Commands

### Quick Start (Full Docker)

```bash
# Start complete environment (no local Node.js required)
docker-compose -f docker-compose.full.yml up --build

# URLs:
# - Frontend: http://localhost:3000
# - Backend:  http://localhost:4000
# - Adminer:  http://localhost:8080

# Demo users: admin@example.com / john@example.com / jane@example.com (password123)

# Stop all services
docker-compose -f docker-compose.full.yml down

# Reset everything (including data)
docker-compose -f docker-compose.full.yml down -v
```

### Development Mode (Hot Reload)

```bash
# Start local environment
docker-compose up -d              # PostgreSQL + Redis
npm install                       # Dependencies
npm run db:generate -w apps/backend   # Generate Prisma client
npm run db:push -w apps/backend       # Push schema to DB
npm run db:seed -w apps/backend       # Seed demo data
npm run dev                       # Frontend :3000 + Backend :4000

# Build and test
npm run build                     # Build all
npm run test                      # Test all
npm run lint                      # Lint all
```

## Current State (Accurate)

### Completed ✅ (Sessions 1-3)

**Backend:**
- Server entry point (server.ts)
- Configuration module with CORS wildcard support
- Middleware (auth-guard, error-handler)
- 4 API modules with routes: auth, catalog, search, orders
- Utilities: Prisma client, Redis client, Pino logger
- Prisma schema (User, Category, Product, Order, OrderItem)
- Dockerfile (multi-stage, non-root user, health check)
- Seed data (3 users, 9 categories, 18 products, 3 orders)
- Complete test suite (177 tests):
  - Unit tests: config, error-handler, auth-guard, redis-cache
  - Integration tests: auth, catalog, search, orders routes
  - Database tests with Testcontainers
  - E2E Docker tests

**Frontend:**
- Base layout with metadata
- Homepage with hero section and feature cards
- Providers (React Query, Toaster, AuthProvider)
- Tailwind CSS with custom components (.btn, .card, .input)
- Next.js 16 config with Turbopack
- Dockerfile (multi-stage, standalone output)
- Components: Header, Footer, ProductCard, ProductGrid, SearchBar, CartItem, CartSummary, AddressForm
- Auth system: AuthContext, useAuth hook, login/register pages
- Checkout flow: checkout page, order confirmation
- User account: profile, orders history, order detail
- Route protection middleware
- Hooks: useProducts, useCategories, useCart, useAuth, useOrders, useSearch
- API client (Axios + React Query)
- Complete pages: /products, /categories, /cart, /auth/login, /auth/register, /checkout, /account, /orders
- Frontend test suite (29 tests):
  - useAuth.test.tsx, useOrders.test.tsx, useSearch.test.tsx
  - AddressForm.test.tsx

**Infrastructure:**
- Terraform modules: network, eks, database, cache, cdn
- Demo environment configuration
- Helm charts for frontend and backend
- GitHub Actions CI/CD workflows (base)
- Docker Compose for local development
- Automation scripts

**Documentation:**
- README, SETUP, DEVELOPMENT, DEPLOYMENT, API docs
- Execution plan (IT + EN)
- Session recaps 1-3 (IT + EN)

### NOT Completed ❌

**CI Security Scanning (Day 4):**
- [ ] `.checkov.yaml` - Checkov configuration
- [ ] `.tflint.hcl` - TFLint AWS plugin configuration
- [ ] `infra-ci.yml` - Infrastructure CI (TFLint, Checkov, Gitleaks)
- [ ] Backend CI enhancement (Gitleaks + Trivy scan)
- [ ] Frontend CI enhancement (Gitleaks + Trivy scan)
- [ ] `security/reports/` - Trivy JSON reports for Claude analysis

**ArgoCD Preparation (Day 4):**
- [ ] `argocd/projects/ecommerce.yaml` - ArgoCD Project
- [ ] `argocd/applications/backend.yaml` - Backend Application (manual sync)
- [ ] `argocd/applications/frontend.yaml` - Frontend Application (manual sync)
- [ ] `argocd/install/values.yaml` - ArgoCD Helm values
- [ ] `deploy-argocd.yml` - GitHub Actions workflow for ArgoCD deploy

**Terraform Layer Separation (Day 4):**
- [ ] Create Layer 1 (Platform): `infra/terraform/environments/demo/platform/`
  - Network (VPC, Subnets, NAT)
  - EKS (Cluster, Node Groups, IAM)
  - ECR Repositories (needed for CI image push)
- [ ] Create Layer 2 (Services): `infra/terraform/environments/demo/services/`
  - RDS PostgreSQL
  - ElastiCache Redis
  - CDN (CloudFront)
  - Secrets Manager
- [ ] Update CI/CD to use `terraform_remote_state` between layers

**AWS Deploy (Day 5):**
- [ ] Terraform apply Layer 1 (Platform: Network + EKS + ECR)
- [ ] Terraform apply Layer 2 (Services: RDS + ElastiCache + CDN)
- [ ] Run `deploy-argocd.yml` workflow (installs ArgoCD + Applications)
- [ ] Manual sync via ArgoCD UI
- [ ] E2E production tests

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
├── EKS (Cluster, Node Groups, IAM)
└── ECR Repositories              ← Moved here (CI needs it early)
    Frequency: Rare (months)
    Risk: High
    Team: Platform/SRE

Layer 2: SERVICES (application)    → services/terraform.tfstate
├── Database (RDS PostgreSQL)
├── Cache (ElastiCache Redis)
├── CDN (CloudFront)
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

### CI/CD Architecture (Planned)

```
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE CI                             │
│  Trigger: infra/terraform/** changes                            │
├─────────────────────────────────────────────────────────────────┤
│  TFLint → Checkov → Gitleaks  (parallel)                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    APP CI/CD (Backend/Frontend)                  │
├─────────────────────────────────────────────────────────────────┤
│  Gitleaks → Lint & Test → Build → Trivy (warn) → Push ECR      │
│                                      ↓                           │
│                          security/reports/trivy-*.json           │
│                          (for Claude CVE analysis)               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ARGOCD (GitOps CD)                            │
├─────────────────────────────────────────────────────────────────┤
│  deploy-argocd.yml (manual trigger)                             │
│  ├── Install ArgoCD via Helm                                    │
│  ├── Apply Project + Applications                               │
│  └── Manual sync via ArgoCD UI                                  │
└─────────────────────────────────────────────────────────────────┘
```

### ArgoCD Configuration (Planned)
```
argocd/
├── install/values.yaml           # ArgoCD Helm values
├── projects/ecommerce.yaml       # ArgoCD Project
└── applications/
    ├── backend.yaml              # Backend App (manual sync)
    └── frontend.yaml             # Frontend App (manual sync)
```

**Sync Policy:** Manual (require explicit sync trigger via UI/CLI)

### Claude Code CVE Analysis
After CI runs, Trivy reports are saved to `security/reports/`.
Use Claude Code to analyze CVEs in application context:
```
Analizza security/reports/trivy-backend-latest.json
Per ogni CVE:
1. Cerca nel codice se la libreria è usata
2. Valuta se il vettore di attacco è esposto
3. Dai priorità contestualizzata
4. Suggerisci remediation
```

## Next Steps (Priority Order)

1. ~~**Dockerfiles** - Backend and frontend multi-stage builds~~ ✅
2. ~~**React Components** - Header, Footer, ProductCard, ProductGrid, SearchBar, CartItem, CartSummary~~ ✅
3. ~~**API Client + Hooks** - useProducts, useCart, useAuth with React Query~~ ✅
4. ~~**Frontend Pages** - /products, /products/[slug], /categories, /categories/[slug], /cart~~ ✅
5. ~~**Seed Data** - prisma/seed.ts with demo users, categories, products~~ ✅
6. ~~**Backend Tests** - Unit tests for auth, catalog, orders modules~~ ✅ (177 tests)
7. ~~**Auth Pages** - /auth/login, /auth/register, /checkout~~ ✅
8. ~~**Security** - Rate limiting review, CORS config (wildcards)~~ ✅
9. ~~**Frontend Tests** - useAuth, useOrders, useSearch, AddressForm~~ ✅ (29 tests)
10. **Day 4: CI + ArgoCD + Terraform Layers**
    - CI Security: Checkov, TFLint, Trivy (warn only), Gitleaks
    - Trivy reports in `security/reports/` for Claude CVE analysis
    - ArgoCD manifests (Project, Applications with manual sync)
    - `deploy-argocd.yml` workflow (manual trigger)
    - Terraform layer separation:
      - Layer 1 (Platform): Network + EKS + ECR
      - Layer 2 (Services): RDS + ElastiCache + CDN
11. **Day 5: AWS Deploy**
    - Terraform apply Layer 1 (Network + EKS + ECR)
    - Terraform apply Layer 2 (RDS + ElastiCache + CDN)
    - Run deploy-argocd.yml → ArgoCD + Applications
    - Manual sync via ArgoCD UI
    - E2E testing

## Planned Refactors

### Terraform Layer Separation (Priority: High)
**Status:** Scheduled for Day 4
**Effort:** ~2-3 hours

Separate Terraform into two layers for better isolation:
- **Layer 1 (Platform):** Network + EKS + ECR → `platform/terraform.tfstate`
- **Layer 2 (Services):** RDS + ElastiCache + CDN → `services/terraform.tfstate`

See "Terraform > Planned Refactor: Layer Separation" section for full details.

**Note:** ECR moved to Layer 1 because CI needs it to push container images before EKS is ready.

## Links

- Repository: https://github.com/lorenzogirardi/ai-ecom-demo
- Execution Plan: /docs/EXECUTION_PLAN.md
