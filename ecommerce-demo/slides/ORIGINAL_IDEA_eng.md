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
### Week 2: Backend API (7 sessions)
### Week 3: Frontend (6 sessions)
### Week 4: CI/CD + Integration (6 sessions)
### Days 24-30: Buffer & Polish

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
| **5** | *Not planned* | AWS Deploy: EKS + RDS + Redis + CloudFront + External Secrets + ArgoCD |
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
