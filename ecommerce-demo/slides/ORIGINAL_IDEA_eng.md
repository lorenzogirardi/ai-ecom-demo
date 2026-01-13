# Simplified E-commerce Demo - Achievable with Claude Max ($100/month)

> **This document is the original plan used for presentation.**
> **Living document: updated after each session with actual progress.**
> See final section for plan vs reality comparison.

## Realistic Goal
Create a **functional and complete e-commerce demo** that showcases all competencies (app, IaC, CI/CD) but with **reduced scope** to complete it in 1 month with a standard Max account.

---

## ⚠️ Max Standard Account Limits

**What to expect:**
- ~100-400 prompts with Claude Code every 5 hours
- Weekly limits: ~120-240 hours of Sonnet 4
- Limits shared between web chat and Claude Code
- **Realistically: 3-5 intensive hours per day before rate limit**

**Strategy: Maximize output per prompt**
- One prompt = one complete component (not multiple iterations)
- Use very detailed and precise prompts
- Work in "blocks" distributed throughout the week

---

## Simplified Architecture (but professional)

### FROM 5 MICROSERVICES → 1 MODULAR MONOLITH + 1 FRONTEND

```
┌─────────────────────────────────────────────────────┐
│                   CloudFront + ACM                   │
│              (CDN + SSL Certificate)                 │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│            EKS Cluster (Managed Node Group)          │
│  ┌──────────────────────────────────────────────┐   │
│  │          Frontend (Next.js SSR)              │   │
│  │    - Product catalog                         │   │
│  │    - Search                                  │   │
│  │    - Cart & Checkout                         │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │ REST API                           │
│  ┌──────────────▼───────────────────────────────┐   │
│  │       API Backend (Node.js Monolith)         │   │
│  │  Modules:                                    │   │
│  │    - /catalog (products, categories)         │   │
│  │    - /auth (JWT, bcrypt)                     │   │
│  │    - /search (in-memory or Redis)            │   │
│  │    - /orders (mock checkout)                 │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐   │
│  │        RDS Aurora Serverless v2              │   │
│  │         (PostgreSQL)                         │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │      ElastiCache Redis (optional)             │  │
│  │         (cache + sessions)                    │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

         S3 Bucket (product images)
```

### What we ELIMINATE from the original project:

❌ **5 separate microservices** → ✅ 1 well-structured modular monolith
❌ **Strapi CMS** → ✅ Simple Admin API in backend
❌ **Algolia** → ✅ In-memory or Redis search with basic filtering
❌ **Cognito** → ✅ Custom JWT auth (simpler to demonstrate)
❌ **Stripe** → ✅ Mock payment (fake checkout)
❌ **SQS** → ✅ Synchronous functionality
❌ **Multi-repo** → ✅ Simple monorepo

### What we KEEP (demo value):

✅ **EKS + managed services** (Aurora, Redis, S3, CloudFront)
✅ **Complete Terraform IaC** (VPC, EKS, RDS, ALB, CloudFront)
✅ **Helm charts** (professional deployment)
✅ **GitHub Actions CI/CD** (build, test, Docker, deploy)
✅ **Full-stack TypeScript** (frontend + backend)
✅ **Best practices** (error handling, logging, monitoring)

---

## Simplified Project Structure

### Single monorepo:

```
ecommerce-demo/
├── apps/
│   ├── frontend/              # Next.js 14 App Router
│   │   ├── src/
│   │   ├── public/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── backend/               # Node.js API (Express/Fastify)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── catalog/
│       │   │   ├── auth/
│       │   │   ├── search/
│       │   │   └── orders/
│       │   ├── database/
│       │   ├── middleware/
│       │   └── server.ts
│       ├── prisma/
│       ├── Dockerfile
│       └── package.json
│
├── infra/
│   └── terraform/
│       ├── modules/
│       │   ├── network/       # VPC, subnets, NAT
│       │   ├── eks/           # Cluster + node group
│       │   ├── database/      # Aurora Serverless v2
│       │   ├── cache/         # ElastiCache Redis
│       │   └── cdn/           # CloudFront + ACM
│       └── environments/
│           └── demo/
│               ├── main.tf
│               ├── variables.tf
│               └── terraform.tfvars
│
├── helm/
│   ├── frontend/              # Chart for Next.js
│   └── backend/               # Chart for API
│
├── .github/
│   └── workflows/
│       ├── frontend-ci-cd.yml
│       └── backend-ci-cd.yml
│
├── scripts/
│   ├── setup-infra.sh
│   └── deploy-all.sh
│
├── package.json               # Workspace root
└── README.md
```

---

## Work Plan with Max Standard (1 month)

### 🎯 STRATEGY: 1 complete component per session

Each Claude Code session = 1 component 100% finished

### Week 1: Foundation (6 sessions)

**Session 1** (Day 1 - morning):
```
"Generate complete monorepo structure with:
- package.json workspace root
- Empty apps/frontend and apps/backend directories with base package.json
- infra/terraform directory with module structure
- helm directory with base structure
- .gitignore, README.md, base scripts
- tsconfig.json for shared config"
```

**Session 2** (Day 1 - afternoon):
```
"Generate complete Terraform network module in infra/terraform/modules/network/:
- VPC 10.0.0.0/16
- 2 public subnets, 2 private subnets
- Internet Gateway, NAT Gateway (1 only for demo)
- Route tables
- Base security groups
- VPC Flow Logs
- Complete outputs
Include main.tf, variables.tf, outputs.tf with comments"
```

**Session 3** (Day 2 - morning):
```
"Generate complete Terraform EKS module in infra/terraform/modules/eks/:
- EKS Cluster 1.28+
- 1 managed node group (t3.medium, 2-4 nodes)
- Addon: vpc-cni, coredns, kube-proxy
- IAM roles + IRSA
- CloudWatch logging
- Security groups
Include main.tf, variables.tf, outputs.tf, data sources"
```

**Session 4** (Day 2 - afternoon):
```
"Generate complete Terraform database module in infra/terraform/modules/database/:
- Aurora Serverless v2 PostgreSQL
- Min 0.5 ACU, max 2 ACU
- Subnet group
- Security group (access only from EKS)
- Secrets Manager for credentials
- Parameter group
Include main.tf, variables.tf, outputs.tf"
```

**Session 5** (Day 3 - morning):
```
"Generate remaining Terraform modules:
1. modules/cache/: ElastiCache Redis (cache.t4g.micro)
2. modules/cdn/: CloudFront + ACM certificate
Include for each: main.tf, variables.tf, outputs.tf"
```

**Session 6** (Day 3 - afternoon):
```
"Generate Terraform demo environment in infra/terraform/environments/demo/:
- main.tf that uses all modules
- variables.tf
- terraform.tfvars with demo values
- backend.tf for S3 remote state
- providers.tf
Everything ready for terraform apply"
```

### Week 2: Backend API (7 sessions)

**Session 7** (Day 4):
```
"Generate complete backend API in apps/backend/:
Structure:
- src/server.ts (Fastify + configuration)
- src/config/ (database, redis, env)
- src/middleware/ (auth, error, logging)
- src/utils/ (logger with Pino, errors)
- prisma/schema.prisma (User, Category, Product, Order)
- package.json with dependencies (fastify, prisma, bcrypt, jsonwebtoken, pino)
- tsconfig.json
- .env.example
- Optimized multi-stage Dockerfile"
```

**Session 8** (Day 5):
```
"Generate complete catalog module in apps/backend/src/modules/catalog/:
- routes.ts (GET /categories, GET /products, GET /products/:id)
- controller.ts
- service.ts (business logic)
- validation.ts (Zod schemas)
Complete implementation with Prisma, error handling, pagination"
```

**Session 9** (Day 6):
```
"Generate complete auth module in apps/backend/src/modules/auth/:
- routes.ts (POST /register, POST /login, POST /logout, GET /me)
- controller.ts
- service.ts (bcrypt hash, JWT generation)
- middleware/auth.middleware.ts (JWT verification)
- validation.ts
Complete implementation with session management"
```

**Session 10** (Day 7):
```
"Generate complete search module in apps/backend/src/modules/search/:
- routes.ts (GET /search?q=&category=&minPrice=&maxPrice=)
- controller.ts
- service.ts (Prisma query with filters, uses Redis for result cache)
- validation.ts
Implementation with smart caching"
```

**Session 11** (Day 8):
```
"Generate complete orders module in apps/backend/src/modules/orders/:
- routes.ts (POST /orders, GET /orders, GET /orders/:id)
- controller.ts
- service.ts (total calculation, mock payment, status management)
- validation.ts
Complete checkout implementation with mock Stripe"
```

**Session 12** (Day 9):
```
"Generate testing for backend:
- tests/ directory with Jest
- Unit tests for each service
- Integration tests for API routes
- Test setup with in-memory database
- package.json scripts for test
At least 60% coverage"
```

**Session 13** (Day 10):
```
"Generate complete backend Helm chart in helm/backend/:
- Chart.yaml
- values.yaml (with all configurations)
- values-demo.yaml
- Complete templates/:
  - deployment.yaml (with init container Prisma migrate)
  - service.yaml
  - ingress.yaml (ALB annotations)
  - configmap.yaml
  - secret.yaml (Secrets Manager CSI)
  - serviceaccount.yaml (IRSA)
  - hpa.yaml
Include probes, resources, security contexts"
```

### Week 3: Frontend (6 sessions)

**Session 14** (Day 11):
```
"Generate complete Next.js 14 frontend in apps/frontend/:
Base structure:
- src/app/ with App Router:
  - layout.tsx
  - page.tsx (homepage)
  - products/page.tsx (catalog)
  - products/[id]/page.tsx (detail)
  - cart/page.tsx
  - checkout/page.tsx
  - login/page.tsx
- next.config.js
- tailwind.config.js
- package.json
- tsconfig.json
- Multi-stage Dockerfile"
```

**Session 15** (Day 12):
```
"Generate React components in apps/frontend/src/components/:
- Header.tsx (nav + cart icon)
- Footer.tsx
- ProductCard.tsx
- ProductGrid.tsx
- CategoryNav.tsx
- SearchBar.tsx (with debounce)
- Cart/CartItem.tsx
- Cart/CartSummary.tsx
All with TypeScript, Tailwind CSS, responsive"
```

**Session 16** (Day 13):
```
"Generate API client and state management in apps/frontend/src/lib/:
- api-client.ts (fetch wrapper with auth headers)
- hooks/ directory:
  - useProducts.ts
  - useCart.ts (context + localStorage)
  - useAuth.ts
- types.ts (shared types with backend)
Use React Query for caching"
```

**Session 17** (Day 14):
```
"Implement complete pages in apps/frontend/src/app/:
1. products/page.tsx: list with filters, pagination, SSR
2. products/[id]/page.tsx: detail with SSG, add to cart
3. cart/page.tsx: cart management, update quantity
4. checkout/page.tsx: checkout form, submit order
With loading states, error handling, validation"
```

**Session 18** (Day 15):
```
"Implement frontend authentication:
- login/page.tsx: login/register form
- src/middleware.ts: protected routes
- src/lib/auth.ts: token management
- Integration with backend auth API
With redirect, session management, error handling"
```

**Session 19** (Day 16):
```
"Generate complete frontend Helm chart in helm/frontend/:
- Chart.yaml
- values.yaml
- values-demo.yaml
- Complete templates/ (deployment, service, ingress, configmap, hpa)
Include environment variables for API_URL, caching, probes"
```

### Week 4: CI/CD + Integration (6 sessions)

**Session 20** (Day 17):
```
"Generate complete GitHub Actions workflow for backend:
.github/workflows/backend-ci-cd.yml:
1. build-and-test job
2. docker-build-push job (ECR with OIDC)
3. deploy-to-eks job (Helm)
Include matrix for multi-environment, caching, notifications"
```

**Session 21** (Day 18):
```
"Generate complete GitHub Actions workflow for frontend:
.github/workflows/frontend-ci-cd.yml:
1. build-and-test job (Next.js build)
2. docker-build-push job (ECR)
3. deploy-to-eks job (Helm)
Include build optimization, cache layers"
```

**Session 22** (Day 19):
```
"Generate automation scripts in scripts/:
1. setup-infra.sh: terraform init/plan/apply for all modules
2. deploy-all.sh: deploy backend + frontend with Helm in order
3. seed-data.sh: DB population with demo data
4. local-dev.sh: local setup with Docker Compose
Include error handling, logging, rollback"
```

**Session 23** (Day 20):
```
"Generate Docker Compose for local development:
docker-compose.yml with:
- PostgreSQL
- Redis
- Backend API (hot reload)
- Frontend (hot reload)
- Adminer (DB UI)
Include volumes, networking, env variables"
```

**Session 24** (Day 21):
```
"Generate complete documentation:
1. README.md root: architecture diagram (Mermaid), quick start
2. docs/SETUP.md: step-by-step infra setup
3. docs/DEVELOPMENT.md: local dev, testing, debugging
4. docs/DEPLOYMENT.md: CI/CD, Helm, troubleshooting
5. docs/API.md: OpenAPI/Swagger spec
Include screenshots, examples, troubleshooting"
```

**Session 25** (Day 22-23):
```
"Review and optimize entire project:
1. Security hardening (Dockerfile, Helm security contexts)
2. Performance optimization (caching strategies, query optimization)
3. Cost optimization (rightsizing resources)
4. Monitoring setup (CloudWatch dashboards, alarms)
5. End-to-end testing
Generate complete checklist + critical fixes"
```

### Days 24-30: Buffer & Polish

- Complete manual testing
- Fix found bugs
- Documentation refinement
- Demo video / screenshots
- Code cleanup

---

## Realistic Estimate

### With Max Account ($100/month):

**Total time**: 25-30 working days
**Claude Code sessions**: ~25 intensive sessions
**Actual coding hours with Claude**: ~50-60 hours distributed
**Rate limit management**: Work 2-3 sessions per day with breaks

### What to expect:

✅ **Completely achievable** with discipline
✅ **Demonstrates all required skills**
✅ **Scalable**: can expand later (add microservices)
❌ **Requires discipline**: precise prompts, don't iterate too much
❌ **Some parts done manually**: small fixes, AWS configurations

---

## Tips for Maximizing Max Standard

### 1. Complete "One-Shot" Prompts
```
❌ BAD:
"Create the backend"
"Add auth"
"Add logging"
"Add tests"

✅ GOOD:
"Generate complete backend API with:
- Complete structure
- Auth module with JWT
- Logging with Pino
- Error handling
- Tests with Jest
- Dockerfile
Complete implementation, production-ready"
```

### 2. Batch Related Tasks
```
✅ "Generate Terraform modules cache + cdn together"
✅ "Generate all React components in one session"
```

### 3. Use Web Chat for Planning
- Discuss architecture in normal chat (doesn't consume Claude Code limits)
- Then use Claude Code only for code generation

### 4. Distribute Sessions
- 2-3 intensive sessions per day
- A few hours break between sessions
- Avoid exhausting everything in 2 days

---

## Final Deliverable

At the end you'll have:

📦 **Code**:
- 2 full-stack TypeScript applications
- 1 well-structured monorepo
- ~5000-7000 lines of application code
- ~2000 lines of Terraform IaC

🏗️ **Infrastructure**:
- EKS cluster on AWS
- Aurora Serverless v2
- ElastiCache Redis
- CloudFront + ACM
- Everything via IaC

🚀 **CI/CD**:
- 2 complete GitHub Actions pipelines
- Automated testing
- Docker build & push
- Helm deployments

📚 **Documentation**:
- Architecture diagrams
- Setup guides
- API documentation
- Troubleshooting

---

---

## Actual Progress vs Original Plan

> **Last update: January 7, 2026 (Day 10 completed)**

### Current Status

| Plan Week | Planned Sessions | Completed in | Status |
|-----------|------------------|--------------|--------|
| Week 1: Foundation | 6 sessions (Days 1-3) | **Day 1** | ✅ |
| Week 2: Backend API | 7 sessions (Days 4-10) | **Day 1** | ✅ |
| Week 3: Frontend | 6 sessions (Days 11-16) | **Days 2-3** | ✅ |
| Week 4: CI/CD + Integration | 6 sessions (Days 17-23) | **Days 1, 4** | ✅ |
| Days 24-30: Buffer & Polish | 7 days | **Day 4** | ✅ |
| AWS Deploy (planned) | Sessions 22-23 | **Day 5** | ✅ |
| **Extra: Load Testing** | Not planned | **Day 6** | ✅ |
| **Extra: Performance Tuning** | Not planned | **Day 7** | ✅ |
| **Extra: Deep Observability** | Not planned | **Day 8** | ✅ |
| **Extra: Security Hardening** | Not planned | **Day 9** | ✅ |
| **Extra: Operational Portal** | Not planned | **Day 10** | ✅ |

### What was done (Days 1-10)

| Day | Original Plan | Reality |
|-----|---------------|---------|
| **1** | Sessions 1-2 (Structure + Network) | Sessions 1-14 complete (Foundation + Backend + Helm + CI/CD base + Docs) |
| **2** | Sessions 3-4 (EKS + Database) | Dockerfiles + React Components + 177 Backend Tests + Seed Data |
| **3** | Session 5 (Cache + CDN) | Auth + Checkout + Account + Search + Security + 29 Frontend Tests |
| **4** | Session 6 (Environment demo) | CI Security + ArgoCD + Terraform Remote State + CVE Analysis + 10+ Bug Fixes |
| **5** | Sessions 22-23 (Deploy) | AWS Deploy: EKS + RDS + Redis + CloudFront + External Secrets + ArgoCD |
| **6** | *Not planned* | Load Testing: k6 scenarios + Cluster Autoscaler + CloudWatch metrics |
| **7** | *Not planned* | Performance: Pod Anti-Affinity + HPA tuning (+134% throughput, -42% latency) |
| **8** | *Not planned* | Observability: Container Insights + X-Ray tracing + Cache optimization (508 RPS) |
| **9** | *Not planned* | Security: Network Policies (Zero Trust) + PSS + CSP/HSTS + OWASP ZAP scan |
| **10** | *Not planned* | Operations: 14 GitHub Actions OPS workflows + Environment protection |

### Why are we faster than planned?

| Factor | Original Plan | Reality |
|--------|---------------|---------|
| **Model** | Sonnet 4 (assumed) | **Opus 4.5** (more powerful, fewer iterations) |
| **Prompt Strategy** | 1 component per session | **Multi-component per session** |
| **Context Window** | Limited, frequent resets | **Unlimited** (auto-summarization) |
| **Parallelism** | Sequential | **Parallel tasks** with agent |
| **Output Quality** | Multiple iterations | **Correct on first attempt** |
| **Rate Limits** | 3-5 hours/day max | **Intensive sessions without limits** |

### Final Metrics (Day 10)

```
┌─────────────────────────────────────────────────────────┐
│              PROGRESS vs PLAN                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Planned days:           30                             │
│  Actual days:            10                             │
│  Speedup:                ~3x (with extended scope)      │
│                                                          │
│  Planned sessions:       25                             │
│  Actual sessions:        10                             │
│  Efficiency:             ~2.5x                          │
│                                                          │
│  Files created:          ~200+                          │
│  Lines of code:          ~25,000+                       │
│  Tests:                  206 (177 backend + 29 frontend)│
│  Documents:              31 × 2 languages = 62 files    │
│  Mermaid diagrams:       ~66                            │
│                                                          │
│  Performance achieved:   508 RPS, p95 263ms, 0% errors  │
│  Security score:         0 High, 4 Medium (ZAP scan)    │
│  Cache hit rate:         99.95%                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Additional Scope (Not Planned)

The project **exceeded the original plan** by including:

| Area | Planned | Achieved |
|------|---------|----------|
| **Infrastructure** | Basic Terraform | + Cluster Autoscaler, Container Insights, X-Ray |
| **Testing** | Unit/Integration | + k6 load testing, OWASP ZAP security scan |
| **Performance** | Basic | + HPA tuning, Anti-Affinity, Cache optimization |
| **Security** | JWT auth | + Network Policies, PSS, CSP, HSTS, Rate limiting |
| **Operations** | CI/CD | + 14 OPS workflows for L1 Support |
| **Documentation** | Basic README | + 31 documents IT/EN with 66 diagrams |

### Key Results

| Metric | Value |
|--------|-------|
| Max throughput | **508 RPS** |
| p95 latency | **263ms** |
| Error rate | **0%** |
| Cache hit rate | **99.95%** |
| Autoscaling | 2→8 nodes, 2→7 pods |
| Security alerts | 0 High, 4 Medium |
| Test coverage | 206 tests |

---

*Living document - Updated after each session*
*Last update: January 7, 2026*
