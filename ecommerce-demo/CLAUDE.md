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
│   └── environments/demo/
│       ├── platform/       # Layer 1: Network + EKS + ECR
│       └── services/       # Layer 2: RDS + ElastiCache + CDN
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

### Completed ✅ (Day 4)

**CI Security Scanning:**
- [x] `.checkov.yaml` - Checkov configuration with skip rules for demo
- [x] `.tflint.hcl` - TFLint AWS plugin configuration
- [x] `infra-ci.yml` - Infrastructure CI (TFLint, Checkov, Gitleaks, Helm lint)
- [x] Backend CI enhancement (Gitleaks + Trivy scan with JSON reports)
- [x] Frontend CI enhancement (Gitleaks + Trivy scan with JSON reports)
- [x] Trivy CVE Summary visible in GitHub Actions page
- [x] `security/reports/` - Trivy JSON reports saved to repo
- [x] Concurrency group for parallel workflow commits

**ArgoCD Preparation:**
- [x] `argocd/projects/ecommerce.yaml` - ArgoCD Project with RBAC
- [x] `argocd/applications/backend.yaml` - Backend Application (manual sync)
- [x] `argocd/applications/frontend.yaml` - Frontend Application (manual sync)
- [x] `argocd/install/values.yaml` - ArgoCD Helm values for EKS/ALB
- [x] `deploy-argocd.yml` - GitHub Actions workflow for ArgoCD deploy
- [x] `argocd/README.md` - Setup documentation

**Terraform Remote State (S3) - Tutte risorse gestite da Terraform:**
- [x] `bootstrap/state-backend` module - S3 bucket + DynamoDB table
- [x] S3 bucket `ecommerce-demo-terraform-state` with versioning + encryption + lifecycle
- [x] DynamoDB table `ecommerce-demo-terraform-locks` with point-in-time recovery
- [x] Bootstrap state on S3:
  - `bootstrap/state-backend/terraform.tfstate`
  - `bootstrap/github-oidc/terraform.tfstate`
  - `bootstrap/ecr/terraform.tfstate`
- [x] Layer 1 (Platform): `demo/platform.tfstate` (Day 5)
- [x] Layer 2 (Services): `demo/services.tfstate` (Day 5)

**⚠️ IMPORTANTE:** Nessuna risorsa creata da CLI. Tutto gestito da Terraform.

**AWS Resources Created (all via Terraform):**
- [x] ECR Repository `ecommerce-demo/backend`
- [x] ECR Repository `ecommerce-demo/frontend`

**CVE Analysis:**
- [x] Claude contextual CVE analysis methodology
- [x] `slides/CVE_ANALYSIS.md` - Report IT
- [x] `slides/CVE_ANALYSIS_eng.md` - Report EN
- [x] 36 CVEs analyzed → 1 action required (fast-jwt issuer validation)

**CI/CD Bug Fixes (10+):**
- [x] Gitleaks config and allowlist
- [x] ESLint configuration for both apps
- [x] npm workspace cache issues
- [x] Docker build context
- [x] Trivy SHA mismatch (short vs full)
- [x] Race condition on parallel commits
- [x] Husky in CI environment
- [x] Terraform fmt auto-fix with auto-commit in Infrastructure CI

### Completed ✅ (Day 5)

**AWS Deploy:**
- [x] Terraform apply Layer 1 (Platform: Network + EKS + ECR)
- [x] Terraform apply Layer 2 (Services: RDS + ElastiCache + CDN)
- [x] External Secrets Operator installation (v0.9.20)
- [x] ArgoCD installation and configuration
- [x] Backend + Frontend deployment via ArgoCD
- [x] Database migration and seeding
- [x] CloudFront HTTPS distribution for ALB
- [x] Security group fixes (node SG → RDS/Redis)
- [x] CORS configuration for CloudFront domain
- [x] Terraform documentation of all CLI changes
- [x] Shutdown/startup scripts for cost optimization

**Application URLs:**
- E-commerce: https://dls03qes9fc77.cloudfront.net
- API Health: https://dls03qes9fc77.cloudfront.net/api/health

### Completed ✅ (Day 6)

**Load Testing Framework (k6):**
- [x] k6 configuration and helpers (config.js, http.js, auth.js, report.js)
- [x] Smoke test scenario (30s health check)
- [x] Load test scenario (3.5-9min standard load)
- [x] Stress test scenario (13min, up to 200 VUs)
- [x] Spike test scenario (traffic spike analysis)
- [x] HTML report generation for all scenarios
- [x] k6 v0.49.0 compatibility fixes (no optional chaining/spread)

**Rate Limit Bypass:**
- [x] Backend allowList configuration for load testing
- [x] X-Load-Test-Bypass header implementation
- [x] Secure token-based bypass mechanism

**GitHub Actions Pipeline:**
- [x] `load-test.yml` - Manual trigger load test workflow
- [x] Configurable test types (quick, load, stress, smoke)
- [x] HTML reports saved as artifacts (30 days)
- [x] VUs and target URL parameters

**Cluster Autoscaler:**
- [x] Deployment with IRSA (IAM Roles for Service Accounts)
- [x] Node group discovery tags configured
- [x] Scale range: 2-5 nodes (t3.medium)
- [x] Scale down threshold: 50% utilization, 10min idle
- [x] Documentation in slides/ (IT + EN)

**CloudWatch Metrics Analysis:**
- [x] Correlation k6 results with CloudWatch metrics
- [x] Bottleneck identification (backend pod at 97% CPU)
- [x] RDS analysis (18% CPU, 6 stable connections)
- [x] ElastiCache analysis (99.9% cache hit rate)
- [x] ALB analysis (328 RPS peak, 0 5xx errors)
- [x] Documentation in slides/ (IT + EN)

**Stress Test Results (Day 6):**
- Total Requests: 183,203
- Average RPS: 234.8
- p95 Latency: 380ms
- Error Rate: 5.33% (auth endpoint, not server errors)
- All thresholds PASSED

### Completed ✅ (Day 7 - Performance Fix)

**Pod Anti-Affinity:**
- [x] Backend pods distributed across different nodes
- [x] Frontend pods distributed across different nodes
- [x] `topologyKey: kubernetes.io/hostname` configuration
- [x] `preferredDuringSchedulingIgnoredDuringExecution` (soft rule)

**HPA Optimization:**
- [x] CPU threshold reduced from 70% to 45%
- [x] maxReplicas increased from 5 to 7
- [x] Faster, more reactive scaling under load
- [x] Metrics Server installed for EKS

**Stress Test Results (Day 7 - With Autoscaling):**
- Total Requests: 291,480 (+59% vs Day 6)
- Average RPS: 373.4 (+59% vs Day 6)
- p95 Latency: 206ms (-46% vs Day 6)
- Error Rate: 5.27%
- HPA scaled from 2 to 7 pods
- Cluster Autoscaler added 2 nodes (3→5)

**Bug Fixes:**
- [x] k6 stress test `/me` endpoint path fixed (`/auth/me` → `endpoints.me`)
- [x] All 15,356 `/me` errors resolved

**Documentation:**
- [x] SESSION_07_RECAP.md (IT)
- [x] SESSION_07_RECAP_eng.md (EN)

### Completed ✅ (Day 8 - Deep Observability)

**Container Insights (EKS Add-on):**
- [x] CloudWatch Observability add-on enabled via Terraform
- [x] IRSA role for CloudWatch Agent + X-Ray Daemon
- [x] Pod-level CPU, memory, network metrics in CloudWatch

**AWS X-Ray Distributed Tracing:**
- [x] X-Ray DaemonSet deployed (`k8s/xray-daemon/`)
- [x] Backend instrumentation (`aws-xray-sdk-core`)
- [x] Frontend instrumentation (Next.js `instrumentation.ts`)
- [x] Manual segment management (avoided CLS context issues)
- [x] 1700+ traces captured with annotations

**Backend X-Ray Integration:**
- [x] `apps/backend/src/utils/xray.ts` - X-Ray utility
- [x] Fastify hooks for request tracing
- [x] Annotations: http_method, http_url, http_status
- [x] Error/fault flags for 4xx/5xx responses

**Frontend X-Ray Integration:**
- [x] `apps/frontend/src/lib/xray.ts` - X-Ray utility
- [x] `apps/frontend/src/instrumentation.ts` - Server-side init
- [x] `captureHTTPsGlobal` for SSR→Backend tracing
- [x] Health endpoint with X-Ray status

**Terraform Updates:**
- [x] IAM trust policy updated for xray-daemon service account
- [x] StringLike condition for multiple service accounts
- [x] All CLI changes codified in Terraform

**Local Development:**
- [x] Docker networking fix (INTERNAL_API_URL)
- [x] Frontend Dockerfile build arg for container-to-container comm
- [x] docker-compose.full.yml updated

**Code Optimizations:**
- [x] Redis pipeline (mget/mset) for batch operations
- [x] User caching for /me endpoint
- [x] Cache metrics endpoint (/metrics/cache)
- [x] Cache hit rate tracking

**Stress Test Results (Day 8 - Post Code Optimizations):**
- Total Requests: 396,830 (+83% vs Day 7)
- Average RPS: 508.4 (+83% vs Day 7)
- p95 Latency: 263ms
- Error Rate: 0%
- Cache Hit Rate: 99.95% (33,845 hits, 18 misses)
- Backend Pods: 6/7 active
- Cluster Nodes: 8 (max reached)

**Total Improvements (Day 6 → Day 8):**
- Throughput: +116% (235 → 508 RPS)
- Latency: -31% (380ms → 263ms p95)
- Errors: -100% (5.33% → 0%)

**Documentation:**
- [x] SESSION_08_RECAP.md (IT)
- [x] SESSION_08_RECAP_eng.md (EN)
- [x] OBSERVABILITY_ANALYSIS.md
- [x] Presentation slides v0.2 (IT + EN)

### Completed ✅ (Day 9 - Security Hardening)

**Network Security (Zero Trust):**
- [x] Default deny network policy (all ingress/egress blocked)
- [x] Backend network policy (frontend → backend only)
- [x] Frontend network policy (ALB → frontend, frontend → backend)
- [x] VPC CIDR restrictions for ALB health checks

**Pod Security Standards (PSS):**
- [x] Namespace labels for audit/warn mode
- [x] Seccomp RuntimeDefault profile for all containers
- [x] Gradual rollout strategy (audit → warn → enforce)

**Application Security:**
- [x] Content Security Policy (CSP) enabled with strict directives
- [x] HSTS with 1-year max-age and preload
- [x] Auth rate limiting (5/15min login, 3/hour register)
- [x] Security event logging (login success/failure, password change)
- [x] Request body size limit (1MB DoS protection)

**OWASP ZAP Security Scan:**
- [x] GitHub Actions workflow for ZAP scans (baseline, api, full)
- [x] Baseline scan: 55 PASS, 12 WARN, 0 FAIL
- [x] API scan: 113 PASS, 6 WARN, 0 FAIL
- [x] All OWASP Top 10 categories covered

**Bug Fixes:**
- [x] Swagger UI routing (trailing slash redirect)
- [x] Frontend Link vs anchor for API URLs

**Documentation:**
- [x] SESSION_09_RECAP.md (IT)
- [x] SESSION_09_RECAP_eng.md (EN)
- [x] SECURITY_ARCHITECTURE.md (IT + EN)

### Completed ✅ (Day 10 - Operational Portal)

**L1 Support GitHub Actions (Non-Destructive Only):**

*Diagnostics (Read-Only):*
- [x] OPS: Pod Health Check - Pod status, resources, conditions
- [x] OPS: View Pod Logs - Tail logs from specific pods
- [x] OPS: Service Health Check - Endpoint health verification
- [x] OPS: Database Connection Test - RDS connectivity check
- [x] OPS: Redis Status - Cache connectivity and stats
- [x] OPS: Deployment Info - Current deployment status
- [x] OPS: Recent Errors - Aggregate error logs

*Remediation (Safe Actions):*
- [x] OPS: Pod Restart - Rolling restart (no downtime)
- [x] OPS: Scale Replicas - Adjust replica count (2-10)
- [x] OPS: Clear App Cache - Redis cache invalidation
- [x] OPS: ArgoCD Sync - Trigger GitOps sync
- [x] OPS: Invalidate CloudFront Cache - CDN cache purge

*Reports:*
- [x] OPS: Export Logs - Download logs for analysis
- [x] OPS: Performance Snapshot - Current metrics summary

**Security:**
- [x] GitHub Environment `production` with required reviewers
- [x] Only repo admins can trigger OPS workflows
- [x] All workflows require approval before execution

**Documentation:**
- [x] SESSION_10_RECAP.md (IT)
- [x] SESSION_10_RECAP_eng.md (EN)

### NOT Completed ❌ (Future Sessions)

**Day 11+:**
- [ ] TBD (proposals coming)

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

#### Current State (Layer Separation - Implemented Day 4)
Two separate state files for isolated blast radius:
- `demo/platform.tfstate` - Network, EKS, ECR (core infrastructure)
- `demo/services.tfstate` - RDS, ElastiCache, CDN (application services)

#### Layer Architecture
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
10. ~~**Day 4: CI + ArgoCD + Terraform Layers**~~ ✅
    - CI Security: Checkov, TFLint, Trivy (warn only), Gitleaks
    - Trivy reports in `security/reports/` for Claude CVE analysis
    - ArgoCD manifests (Project, Applications with manual sync)
    - `deploy-argocd.yml` workflow (manual trigger)
    - Terraform layer separation
11. ~~**Day 5: AWS Deploy**~~ ✅
    - Terraform apply Layer 1 + Layer 2
    - External Secrets Operator + ArgoCD
    - CloudFront HTTPS access
    - Shutdown/startup scripts
12. ~~**Day 6: Load Testing**~~ ✅
    - k6 test scripts (smoke, load, stress, spike)
    - Cluster Autoscaler deployment
    - CloudWatch metrics correlation
    - Bottleneck identified: single backend pod at 97% CPU
    - GitHub Actions load test pipeline
13. ~~**Day 7: Performance Fix**~~ ✅
    - Pod Anti-Affinity for backend + frontend
    - HPA optimization (45% CPU threshold, maxReplicas 7)
    - Metrics Server installation for EKS
    - k6 /me endpoint bug fix
    - +134% throughput, -42% p95 latency, 0% errors
14. ~~**Day 8: Deep Observability**~~ ✅
    - Container Insights (EKS add-on)
    - X-Ray distributed tracing (backend + frontend)
    - X-Ray DaemonSet deployment
    - Terraform codification of CLI changes
    - Docker networking fixes for local dev
15. ~~**Day 9: Security Hardening**~~ ✅
    - Network policies (Zero Trust)
    - Pod Security Standards (PSS)
    - CSP, HSTS, rate limiting
    - OWASP ZAP security scan (168 tests passed)
16. ~~**Day 10: Operational Portal**~~ ✅
    - 14 OPS GitHub Actions for L1 Support
    - Diagnostics (read-only) + Remediation (safe actions)
    - GitHub Environment protection with required reviewers
17. **Day 11+:** (Future)
    - TBD

## Completed Refactors

### Terraform Layer Separation ✅
**Status:** Completed (Day 4)

Terraform separated into two layers for better isolation:
- **Layer 1 (Platform):** Network + EKS + ECR → `demo/platform.tfstate`
- **Layer 2 (Services):** RDS + ElastiCache + CDN → `demo/services.tfstate`

Services layer uses `terraform_remote_state` to read platform outputs.

**Note:** ECR is in Layer 1 because CI needs it to push container images before services exist.

## Links

- Repository: https://github.com/lorenzogirardi/ai-ecom-demo
- Execution Plan: /docs/EXECUTION_PLAN.md
