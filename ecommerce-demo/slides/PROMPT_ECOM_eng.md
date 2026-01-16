# E-commerce Demo - Complete Replication Prompt

Use this prompt to recreate the full e-commerce demo project with Claude Code.

**Prerequisites:**
- Copy `claude-toolkit/` folder to `.claude/` for active skills (optional but recommended)
- Create GitHub repository
- Have AWS account with credentials configured

---

## PROMPT START

```
Create a complete e-commerce monorepo for AWS EKS deployment.

================================================================================
TECH STACK (EXACT VERSIONS)
================================================================================

FRONTEND:
- Next.js 16 with App Router and Turbopack
- TypeScript 5.x (strict mode)
- Tailwind CSS 4.x
- React Query (@tanstack/react-query)
- Axios for HTTP client
- Lucide React for icons
- Vitest + Testing Library for tests

BACKEND:
- Fastify 5.x with TypeScript
- Prisma ORM with PostgreSQL
- Redis for caching (ioredis)
- Zod for validation
- @fastify/jwt for authentication
- @fastify/rate-limit for rate limiting
- @fastify/helmet for security headers
- @fastify/swagger + @fastify/swagger-ui for API docs
- Pino for logging
- Vitest + Supertest + Testcontainers for tests

INFRASTRUCTURE:
- Terraform (AWS provider) with S3 backend
- Helm charts for Kubernetes
- ArgoCD for GitOps
- GitHub Actions for CI/CD
- k6 for load testing

================================================================================
PROJECT STRUCTURE
================================================================================

ecommerce-demo/
├── apps/
│   ├── frontend/                 # Next.js App
│   │   ├── src/
│   │   │   ├── app/              # App Router pages
│   │   │   │   ├── page.tsx      # Homepage
│   │   │   │   ├── layout.tsx    # Root layout
│   │   │   │   ├── globals.css   # Tailwind + shadcn/ui style
│   │   │   │   ├── auth/         # /auth/login, /auth/register
│   │   │   │   ├── products/     # /products, /products/[slug]
│   │   │   │   ├── categories/   # /categories, /categories/[slug]
│   │   │   │   ├── cart/         # /cart
│   │   │   │   ├── checkout/     # /checkout, /checkout/confirmation
│   │   │   │   ├── account/      # /account (protected)
│   │   │   │   └── orders/       # /orders, /orders/[id] (protected)
│   │   │   ├── components/
│   │   │   │   ├── layout/       # Header, Footer
│   │   │   │   ├── ui/           # Button, Card, Input, SearchBar
│   │   │   │   ├── products/     # ProductCard, ProductGrid
│   │   │   │   ├── cart/         # CartItem, CartSummary
│   │   │   │   └── checkout/     # AddressForm
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useCategories.ts
│   │   │   │   ├── useCart.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useOrders.ts
│   │   │   │   └── useSearch.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts        # Axios client + React Query
│   │   │   │   └── auth-context.tsx
│   │   │   └── types/
│   │   │       └── models.ts
│   │   ├── tests/                # Frontend tests
│   │   └── Dockerfile            # Multi-stage, standalone output
│   │
│   └── backend/                  # Fastify API
│       ├── src/
│       │   ├── server.ts         # Entry point
│       │   ├── config/
│       │   │   └── index.ts      # Environment config
│       │   ├── middleware/
│       │   │   ├── auth-guard.ts
│       │   │   └── error-handler.ts
│       │   ├── modules/
│       │   │   ├── auth/         # register, login, me, refresh
│       │   │   ├── catalog/      # categories, products CRUD
│       │   │   ├── search/       # product search with Redis cache
│       │   │   └── orders/       # orders CRUD
│       │   └── utils/
│       │       ├── prisma.ts
│       │       ├── redis.ts
│       │       └── logger.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── tests/
│       │   ├── unit/             # Isolated tests
│       │   ├── integration/      # API tests
│       │   └── database/         # Testcontainers tests
│       └── Dockerfile            # Multi-stage, non-root user
│
├── infra/terraform/
│   ├── bootstrap/                # State backend, ECR, GitHub OIDC
│   │   ├── state-backend/        # S3 + DynamoDB for state
│   │   ├── ecr/                  # Container registries
│   │   └── github-oidc/          # GitHub Actions auth
│   ├── modules/
│   │   ├── network/              # VPC, subnets, NAT
│   │   ├── eks/                  # EKS cluster, node groups
│   │   ├── database/             # RDS PostgreSQL
│   │   ├── cache/                # ElastiCache Redis
│   │   └── cdn/                  # CloudFront
│   └── environments/demo/
│       ├── platform/             # Layer 1: Network + EKS + ECR
│       └── services/             # Layer 2: RDS + ElastiCache + CDN
│
├── helm/
│   ├── backend/                  # Backend chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── values-demo.yaml      # Environment-specific
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── ingress.yaml
│   │       ├── hpa.yaml
│   │       ├── serviceaccount.yaml
│   │       └── externalsecret.yaml
│   └── frontend/                 # Frontend chart (same structure)
│
├── argocd/
│   ├── install/values.yaml       # ArgoCD Helm values
│   ├── projects/ecommerce.yaml   # ArgoCD Project
│   └── applications/
│       ├── backend.yaml
│       └── frontend.yaml
│
├── k8s/
│   ├── namespaces/               # Namespace with PSS labels
│   ├── network-policies/         # Zero Trust policies
│   ├── cluster-autoscaler/       # Cluster Autoscaler manifest
│   └── xray-daemon/              # X-Ray DaemonSet
│
├── k6/
│   ├── lib/                      # Helpers (config, auth, http)
│   ├── scenarios/                # smoke, load, stress, spike
│   └── reports/                  # HTML/JSON reports
│
├── security/reports/             # Trivy JSON reports
│
├── .github/workflows/
│   ├── backend-ci-cd.yml         # Build, test, scan, push
│   ├── frontend-ci-cd.yml        # Build, test, scan, push
│   ├── infra-ci.yml              # TFLint, Checkov, Gitleaks
│   ├── deploy-argocd.yml         # ArgoCD installation
│   ├── load-test.yml             # k6 load tests
│   ├── zap-scan.yml              # OWASP ZAP security scan
│   └── ops-*.yml                 # 14 operational workflows
│
├── scripts/
│   ├── local-dev.sh
│   ├── setup-infra.sh
│   ├── deploy-all.sh
│   └── seed-data.sh
│
├── docs/
│   ├── README.md
│   ├── SETUP.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   └── API.md
│
├── docker-compose.yml            # PostgreSQL + Redis (dev)
├── docker-compose.full.yml       # Full stack local
├── package.json                  # Monorepo root (npm workspaces)
├── turbo.json                    # Turborepo config
└── CLAUDE.md                     # Project state for Claude

================================================================================
UI/UX DESIGN SYSTEM
================================================================================

FRAMEWORK: Tailwind CSS with shadcn/ui inspired patterns

GLOBALS.CSS:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 199 89% 48%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 199 89% 48%;
    --radius: 0.5rem;
  }
}

@layer components {
  .container-custom { @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8; }
  .btn { @apply inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2; }
  .btn-primary { @apply btn bg-primary text-white hover:bg-primary/90; }
  .btn-secondary { @apply btn bg-secondary text-secondary-foreground hover:bg-secondary/80; }
  .btn-outline { @apply btn border border-gray-300 bg-transparent hover:bg-gray-50; }
  .input { @apply flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20; }
  .card { @apply rounded-xl border border-gray-200 bg-white shadow-sm; }
}
```

COMPONENT PATTERNS:
- Header: sticky top-0 z-50 border-b bg-white/95 backdrop-blur
- Footer: mt-auto multi-column grid
- Container: max-w-7xl mx-auto px-4
- Mobile menu: hamburger under md breakpoint
- Icons: Lucide React

RESPONSIVE:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

================================================================================
DATABASE SCHEMA (PRISMA)
================================================================================

MODELS:
- User (id, email, password, firstName, lastName, role, isActive)
- Session (id, userId, refreshToken, userAgent, ipAddress, expiresAt)
- Category (id, name, slug, description, imageUrl, parentId, isActive, sortOrder)
- Product (id, categoryId, sku, name, slug, description, price, compareAt, stock, imageUrl, images, status, isFeatured, metadata)
- Order (id, orderNumber, userId, status, subtotal, tax, shippingAmount, discountAmount, totalAmount, currency, notes, shippingAddress, billingAddress, paidAt, shippedAt, deliveredAt, cancelledAt)
- OrderItem (id, orderId, productId, sku, name, quantity, unitPrice, subtotal)

ENUMS:
- UserRole: CUSTOMER, ADMIN
- ProductStatus: DRAFT, ACTIVE, ARCHIVED
- OrderStatus: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED

SEED DATA:
- 3 users (admin@example.com, john@example.com, jane@example.com) password: password123
- 9 categories (electronics, clothing, home, etc.)
- 18 products (distributed across categories)
- 3 sample orders

================================================================================
BACKEND PATTERNS
================================================================================

MODULE STRUCTURE:
- Each module in src/modules/{name}/
- Routes file: {name}.routes.ts
- Zod schemas for validation
- Redis caching where appropriate

SECURITY:
- JWT authentication with refresh tokens
- Rate limiting (configurable, with bypass for load tests)
- Helmet security headers (CSP, HSTS)
- CORS with wildcard support (*.domain.com)
- Request body size limit (1MB)

API ENDPOINTS:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (protected)
- POST /api/auth/refresh
- GET /api/catalog/categories
- GET /api/catalog/categories/:slug
- GET /api/catalog/products
- GET /api/catalog/products/:slug
- GET /api/search?q=...
- GET /api/orders (protected)
- GET /api/orders/:id (protected)
- POST /api/orders (protected)
- DELETE /api/orders/:id (protected)

HEALTH CHECKS:
- GET /health (liveness)
- GET /ready (readiness - checks DB + Redis)
- GET /metrics/cache (cache hit rate)

================================================================================
TESTING REQUIREMENTS
================================================================================

BACKEND (177+ tests):
- Unit tests: config, middleware, utilities
- Integration tests: all API endpoints with mock DB
- Database tests: Testcontainers with real PostgreSQL
- E2E tests: Docker-based full stack

FRONTEND (29+ tests):
- Hook tests: useAuth, useOrders, useSearch
- Component tests: AddressForm, etc.

PATTERNS:
- TestFactory for data generation
- Setup/teardown for isolation
- Prefer real implementations over mocks
- Testcontainers for database tests

COVERAGE TARGET: >80%

TEST STACK:
- Vitest as test runner
- Supertest for HTTP assertions
- Testing Library for React
- Testcontainers for database
- ioredis-mock for Redis unit tests

================================================================================
INFRASTRUCTURE
================================================================================

TERRAFORM LAYERS:
1. Bootstrap: S3 state backend, DynamoDB locks, ECR repos, GitHub OIDC
2. Platform (Layer 1): VPC, EKS cluster, node groups
3. Services (Layer 2): RDS PostgreSQL, ElastiCache Redis, CloudFront CDN

HELM CHARTS:
- Deployment with HPA (minReplicas: 2, maxReplicas: 10)
- Service (ClusterIP)
- Ingress (ALB)
- ServiceAccount (for IRSA)
- ExternalSecret (AWS Secrets Manager)
- Pod Security: non-root, readOnlyRootFilesystem, seccomp RuntimeDefault

ARGOCD:
- Manual sync policy (require explicit sync)
- Project with RBAC
- Separate applications for backend/frontend

================================================================================
CI/CD PIPELINES
================================================================================

BACKEND/FRONTEND CI:
1. Gitleaks (secrets detection)
2. Lint (ESLint)
3. Test (Vitest)
4. Build (Docker)
5. Trivy scan (warn only, save reports)
6. Push to ECR

INFRASTRUCTURE CI:
1. TFLint
2. Checkov
3. Gitleaks
4. Helm lint
5. Auto-fix terraform fmt

ARGOCD DEPLOY:
1. Install ArgoCD via Helm
2. Apply Project + Applications
3. Manual sync via UI

================================================================================
SECURITY HARDENING
================================================================================

NETWORK POLICIES (Zero Trust):
- Default deny all ingress/egress
- Backend: allow only from frontend
- Frontend: allow from ALB, allow to backend

POD SECURITY:
- runAsNonRoot: true
- readOnlyRootFilesystem: true
- seccompProfile: RuntimeDefault
- Drop ALL capabilities

APPLICATION SECURITY:
- CSP with strict directives
- HSTS with 1-year max-age and preload
- Auth rate limiting (5/15min login, 3/hour register)
- Security event logging
- Request body size limit (1MB)

OWASP ZAP:
- Baseline scan
- API scan
- All OWASP Top 10 covered

================================================================================
LOAD TESTING (k6)
================================================================================

SCENARIOS:
- Smoke: 30s, 1 VU (health check)
- Load: 3.5-9min, up to 50 VUs
- Stress: 13min, up to 200 VUs
- Spike: Traffic spike analysis

ENDPOINTS TESTED:
- Health check
- Product listing
- Category listing
- Search
- User authentication flow
- Order creation

RATE LIMIT BYPASS:
- X-Load-Test-Bypass header with secret token

================================================================================
OBSERVABILITY
================================================================================

CONTAINER INSIGHTS:
- CloudWatch Observability EKS add-on
- Pod-level CPU, memory, network metrics

X-RAY TRACING:
- X-Ray DaemonSet
- Backend instrumentation (Fastify hooks)
- Frontend instrumentation (SSR)
- Annotations: http_method, http_url, http_status

LOGGING:
- Pino structured logging
- Log levels: trace, debug, info, warn, error
- JSON format for production

================================================================================
OPERATIONAL PORTAL
================================================================================

GITHUB ACTIONS (L1 Support):

Diagnostics (Read-Only):
- OPS: Pod Health Check
- OPS: View Pod Logs
- OPS: Service Health Check
- OPS: Database Connection Test
- OPS: Redis Status
- OPS: Deployment Info
- OPS: Recent Errors

Remediation (Safe Actions):
- OPS: Pod Restart (rolling)
- OPS: Scale Replicas (2-10)
- OPS: Clear App Cache
- OPS: ArgoCD Sync
- OPS: Invalidate CloudFront Cache

Reports:
- OPS: Export Logs
- OPS: Performance Snapshot

All require GitHub Environment approval.

================================================================================
EXECUTION ORDER
================================================================================

PHASE 1: Foundation
1. Initialize monorepo with npm workspaces
2. Setup Docker Compose for local dev
3. Create backend with Fastify + Prisma
4. Create Prisma schema and seed data
5. Implement backend modules (auth, catalog, search, orders)
6. Create backend tests (177+ tests)

PHASE 2: Frontend
7. Initialize Next.js 16 with App Router
8. Create globals.css with shadcn/ui style
9. Create layout components (Header, Footer)
10. Create UI components (Button, Card, Input, ProductCard, etc.)
11. Create hooks (useProducts, useCart, useAuth, useOrders, useSearch)
12. Create all pages (home, products, categories, cart, checkout, account, orders)
13. Create frontend tests (29+ tests)
14. Create Dockerfiles for both apps

PHASE 3: Infrastructure
15. Create Terraform modules (network, eks, database, cache, cdn)
16. Create bootstrap resources (state backend, ECR, GitHub OIDC)
17. Create environment configurations (platform, services layers)
18. Create Helm charts with all templates
19. Create ArgoCD manifests

PHASE 4: CI/CD
20. Create GitHub Actions workflows (backend-ci-cd, frontend-ci-cd, infra-ci)
21. Create deploy-argocd workflow
22. Create Trivy report storage in security/reports/

PHASE 5: Load Testing
23. Create k6 test framework (lib, scenarios)
24. Create load-test.yml workflow

PHASE 6: Security
25. Create network policies (Zero Trust)
26. Create namespace with PSS labels
27. Add CSP and HSTS to backend
28. Create zap-scan.yml workflow

PHASE 7: Observability
29. Add Container Insights to EKS
30. Deploy X-Ray DaemonSet
31. Instrument backend and frontend for X-Ray

PHASE 8: Operations
32. Create 14 OPS GitHub Actions workflows
33. Configure GitHub Environment protection

================================================================================
DO NOT
================================================================================

- Do NOT use Bootstrap, Material UI, Chakra, or styled-components
- Do NOT use CSS modules
- Do NOT use inline styles
- Do NOT use Jest (use Vitest)
- Do NOT create empty placeholder files
- Do NOT skip tests
- Do NOT hardcode secrets (use environment variables)
- Do NOT create resources manually in AWS (use Terraform)
- Do NOT use imperative kubectl commands (use declarative manifests)

================================================================================
QUALITY GATES
================================================================================

- All tests passing (npm run test)
- TypeScript strict mode no errors (npm run typecheck)
- ESLint no errors (npm run lint)
- Docker builds successful
- Trivy scan (no CRITICAL unfixed)
- Checkov passing (with documented skips)
- OWASP ZAP baseline passing
```

---

## OPTIONAL: ACTIVATE SKILLS

To enable Claude Code skills for this project, copy the toolkit:

```bash
cp -r claude-toolkit/ .claude/
```

Available skills:
- `typescript` - TypeScript patterns, Zod, Prisma, React Query
- `scm` - Git workflow, Conventional Commits
- `trivy` - Security scanning pre-commit
- `spec-driven-dev` - Feature specs lifecycle
- `design-patterns` - Architecture patterns

---

## REFERENCES

All documentation is in `slides/` folder (IT + EN versions):

**How-To Guides:**
- `UI_UX_HOWTO_eng.md` - UI/UX patterns for professional interfaces
- `TESTING_HOWTO_eng.md` - Testing patterns and TestFactory

**Architecture:**
- `AWS_ARCHITECTURE_eng.md` - AWS infrastructure design
- `ENTERPRISE_ARCHITECTURE_eng.md` - Enterprise patterns
- `SECURITY_ARCHITECTURE_eng.md` - Security hardening
- `OBSERVABILITY_ARCHITECTURE_eng.md` - Monitoring and tracing

**Session Recaps (Day 1-10):**
- `SESSION_01_RECAP_eng.md` to `SESSION_10_RECAP_eng.md`

**Technical Deep-Dives:**
- `GITHUB_PIPELINES_eng.md` - CI/CD pipeline details
- `CLUSTER_AUTOSCALER_eng.md` - Autoscaling configuration
- `CVE_ANALYSIS_eng.md` - Security vulnerability analysis
- `K6_STRESS_TEST_REPORT_eng.md` - Load testing results
- `CLOUDWATCH_STRESS_ANALYSIS_eng.md` - Metrics correlation
- `OBSERVABILITY_ANALYSIS_eng.md` - X-Ray and Container Insights
- `OPERATIONAL_PORTAL_ARCHITECTURE_eng.md` - OPS workflows

**Claude Code Patterns:**
- `CLAUDE_MD_PATTERNS.md` - CLAUDE.md best practices
- `MULTI_TEAM_GUARDRAILS_eng.md` - Team governance
- `CLAUDE_CODE_GOVERNANCE_FRAMEWORK_eng.md` - Enterprise governance

**Original Planning:**
- `FIRST_PROMPT_eng.md` - Original project prompt
- `REASONING_PROMPT_UI_eng.md` - UI/UX planning session
- `ORIGINAL_IDEA_eng.md` - Project vision and goals

**Skills & Templates:**
- `claude-toolkit/` - Claude Code skills (typescript, scm, trivy, spec-driven-dev, design-patterns)
- `claude-toolkit/templates/` - Spec and task templates

---

*Document based on ecommerce-demo project: complete production-ready e-commerce in 10 sessions*
*Version: 1.0.0 - 2026-01-16*
