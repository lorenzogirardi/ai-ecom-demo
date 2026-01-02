# Piano di Esecuzione - E-commerce Demo

## Stato Progetto

**Inizio**: 24 Dicembre 2024
**Durata stimata**: 30 giorni
**Account**: Claude Max ($100/mese)

---

## Legenda

- ✅ Completato
- 🔄 In corso
- ⏳ Da fare
- ⚠️ Bloccato

---

## Calendario Effettivo

| Giorno | Data | Focus | Stato |
|--------|------|-------|-------|
| 1 | 24 Dic | Foundation + Backend + Helm + CI/CD + Docs | ✅ |
| 2 | 25 Dic | Dockerfiles + React Components + Test Suite + API Client + Pages + Seed | ✅ |
| 3 | 26 Dic | Auth Pages + Checkout + Account + Search + Security | ✅ |
| 4 | 27 Dic | CI Security + ArgoCD + Terraform Remote State + CVE Analysis | ✅ |
| 5 | 29 Dic | Deploy AWS + ArgoCD + External Secrets + CloudFront | ✅ |
| 6 | 30 Dic | k6 Load Testing + Cluster Autoscaler + CloudWatch Analysis | ✅ |
| 7 | 30 Dic | Performance Fix: Pod Anti-Affinity + HPA + k6 Bug Fix | ✅ |
| 8 | 2 Gen | Deep Observability: Container Insights + X-Ray APM | ✅ |
| 9 | TBD | Security Hardening: OWASP + Network Policies | ⏳ |

---

## Dettaglio Giorno 1 - 24 Dicembre ✅

Completato in una sessione intensiva (Sessions 1-11, 13-14, 19-24 del piano originale).

---

## Dettaglio Giorno 2 - 25 Dicembre ✅

### Dockerfiles

| Task | File | Stato |
|------|------|-------|
| Dockerfile backend | `apps/backend/Dockerfile` | ✅ |
| Dockerfile frontend | `apps/frontend/Dockerfile` | ✅ |

### React Components

| Task | File | Stato |
|------|------|-------|
| Header component | `src/components/layout/Header.tsx` | ✅ |
| Footer component | `src/components/layout/Footer.tsx` | ✅ |
| ClientLayout | `src/components/layout/ClientLayout.tsx` | ✅ |
| ProductCard | `src/components/products/ProductCard.tsx` | ✅ |
| ProductGrid | `src/components/products/ProductGrid.tsx` | ✅ |
| SearchBar | `src/components/ui/SearchBar.tsx` | ✅ |
| CartItem | `src/components/cart/CartItem.tsx` | ✅ |
| CartSummary | `src/components/cart/CartSummary.tsx` | ✅ |

### API Client + Hooks

| Task | File | Stato |
|------|------|-------|
| API client | `src/lib/api.ts` | ✅ |
| useProducts hook | `src/hooks/useProducts.ts` | ✅ |
| useCategories hook | `src/hooks/useCategories.ts` | ✅ |
| useCart hook (Zustand) | `src/hooks/useCart.ts` | ✅ |

### Frontend Pages

| Task | File | Stato |
|------|------|-------|
| Products page | `src/app/products/page.tsx` | ✅ |
| Product detail | `src/app/products/[slug]/page.tsx` | ✅ |
| Categories page | `src/app/categories/page.tsx` | ✅ |
| Category detail | `src/app/categories/[slug]/page.tsx` | ✅ |
| Cart page | `src/app/cart/page.tsx` | ✅ |

### Seed Data

| Task | File | Stato |
|------|------|-------|
| Seed script | `apps/backend/prisma/seed.ts` | ✅ |
| Demo users (3) | (in seed.ts) | ✅ |
| Demo categories (9) | (in seed.ts) | ✅ |
| Demo products (18) | (in seed.ts) | ✅ |
| Demo orders (3) | (in seed.ts) | ✅ |

### Test Suite (177 tests)

| Task | File | Tests |
|------|------|-------|
| Unit: config | `tests/unit/config.test.ts` | 12 |
| Unit: error-handler | `tests/unit/error-handler.test.ts` | 18 |
| Unit: auth-guard | `tests/unit/auth-guard.test.ts` | 12 |
| Unit: redis-cache | `tests/unit/redis-cache.test.ts` | 16 |
| Integration: auth | `tests/integration/auth.test.ts` | 22 |
| Integration: catalog | `tests/integration/catalog.test.ts` | 32 |
| Integration: search | `tests/integration/search.test.ts` | 18 |
| Integration: orders | `tests/integration/orders.test.ts` | 30 |
| Database: testcontainers | `tests/database/testcontainers.test.ts` | 17 |

---

## Dettaglio Giorno 3 - 26 Dicembre ✅

### Ultimo giorno di sviluppo codice - App completamente funzionante in locale

---

### 1. Auth System

| Task | File | Stato |
|------|------|-------|
| useAuth hook | `src/hooks/useAuth.ts` | ✅ |
| Auth context/provider | `src/lib/auth-context.tsx` | ✅ |
| Login page | `src/app/auth/login/page.tsx` | ✅ |
| Register page | `src/app/auth/register/page.tsx` | ✅ |
| Auth middleware | `src/middleware.ts` | ✅ |

---

### 2. Checkout Flow

| Task | File | Stato |
|------|------|-------|
| Checkout page | `src/app/checkout/page.tsx` | ✅ |
| Address form component | `src/components/checkout/AddressForm.tsx` | ✅ |
| Order confirmation | `src/app/orders/[id]/page.tsx` | ✅ |
| useOrders hook | `src/hooks/useOrders.ts` | ✅ |

---

### 3. User Account

| Task | File | Stato |
|------|------|-------|
| Account layout | `src/app/account/layout.tsx` | ✅ |
| Account profile | `src/app/account/page.tsx` | ✅ |
| Order history | `src/app/account/orders/page.tsx` | ✅ |
| Order detail | `src/app/account/orders/[id]/page.tsx` | ✅ |

---

### 4. Search Enhancement

| Task | File | Stato |
|------|------|-------|
| Search query params support | `src/app/products/page.tsx` (update) | ✅ |
| Search results integration | `src/components/ui/SearchBar.tsx` (update) | ✅ |
| useSearch hook | `src/hooks/useSearch.ts` | ✅ |

---

### 5. Shared Types

| Task | File | Stato |
|------|------|-------|
| API response types | `src/types/api.ts` | ✅ |
| User/Auth types | `src/types/auth.ts` | ✅ |
| Product/Order types | `src/types/models.ts` | ✅ |
| Types index | `src/types/index.ts` | ✅ |

---

### 6. Security Review

| Task | Stato |
|------|-------|
| Rate limiting config | ✅ |
| CORS config (multi-origin + wildcards) | ✅ |
| Environment variables review | ✅ |

---

### Flusso Utente Completo (dopo Day 3)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER FLOW - E-COMMERCE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │ Homepage │ → │ Products │ → │  Detail  │ → │   Cart   │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
│                       ↓                             ↓           │
│                 ┌──────────┐                  ┌──────────┐     │
│                 │  Search  │                  │ Checkout │     │
│                 └──────────┘                  └──────────┘     │
│                                                    ↓           │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │ Register │ → │  Login   │ → │ Account  │ ← │  Order   │    │
│  └──────────┘   └──────────┘   └──────────┘   │ Confirm  │    │
│                       ↓                        └──────────┘    │
│                 ┌──────────┐                                    │
│                 │  Orders  │                                    │
│                 │ History  │                                    │
│                 └──────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Checklist Finale Day 3

- [x] Utente può registrarsi
- [x] Utente può fare login/logout
- [x] Utente può cercare prodotti
- [x] Utente può aggiungere al carrello
- [x] Utente può completare checkout
- [x] Utente vede conferma ordine
- [x] Utente può vedere storico ordini
- [x] Route protette funzionano
- [x] Frontend test suite (29 tests)
- [x] Backend tests tutti passano (177 tests)

---

## Refactoring Pianificato: Terraform Layer Separation

**Priorità:** Media | **Effort:** ~2-3 ore | **Quando:** Prima della produzione o quando team > 2-3 persone

### Stato Attuale (Single State)

```
demo/terraform.tfstate
├── Network (VPC, Subnets, NAT)
├── EKS (Cluster, Node Groups)
├── Database (RDS PostgreSQL)
├── Cache (ElastiCache Redis)
├── CDN (CloudFront)
└── ECR Repositories
```

**Problemi:**
- Blast radius elevato
- Apply lenti (~15-20 min)
- Lifecycle accoppiati
- Rischio modifiche accidentali al cluster

### Strategia Proposta (Two Layers)

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER SEPARATION                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: PLATFORM (core)        → platform/terraform.tfstate│
│  ├── Network (VPC, Subnets, NAT)                            │
│  └── EKS (Cluster, Node Groups, IAM)                        │
│      Frequenza: Raro (mesi)                                 │
│      Rischio: Alto                                          │
│      Team: Platform/SRE                                     │
│                                                              │
│  Layer 2: APPLICATION (services) → services/terraform.tfstate│
│  ├── Database (RDS PostgreSQL)                              │
│  ├── Cache (ElastiCache Redis)                              │
│  ├── CDN (CloudFront)                                       │
│  ├── ECR Repositories                                       │
│  └── Secrets Manager                                        │
│      Frequenza: Spesso (settimane)                          │
│      Rischio: Medio                                         │
│      Team: DevOps/App                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Vantaggi

| Aspetto | Prima | Dopo |
|---------|-------|------|
| Blast Radius | Tutto | Isolato per layer |
| Tempo Apply | ~15-20 min | ~2-5 min per layer |
| Parallelismo | No | Team diversi in parallelo |
| Rollback | Complesso | Per layer |
| Approvazioni | Unica | Differenziate per rischio |

### Implementazione

```
1. Creare infra/terraform/environments/demo/platform/
   └── main.tf (network + eks modules)
   └── backend.tf (key = "demo/platform.tfstate")

2. Creare infra/terraform/environments/demo/services/
   └── main.tf (database + cache + cdn + ecr)
   └── backend.tf (key = "demo/services.tfstate")
   └── data.tf (terraform_remote_state per platform outputs)

3. Aggiornare CI/CD
   └── Deploy platform prima di services
   └── Approval gates separati
```

---

## Dettaglio Giorno 4 - 27 Dicembre ✅

### CI Security + ArgoCD + Terraform Remote State + CVE Analysis

---

### 1. CI Security Scanning ✅

**Architettura Pipeline:**

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
│                          + CVE Summary in GitHub Actions page    │
└─────────────────────────────────────────────────────────────────┘
```

| File | Contenuto | Stato |
|------|-----------|-------|
| `.github/workflows/infra-ci.yml` | TFLint + Checkov + Gitleaks | ✅ |
| `.github/workflows/backend-ci-cd.yml` | Enhanced with Gitleaks + Trivy + CVE Summary | ✅ |
| `.github/workflows/frontend-ci-cd.yml` | Enhanced with Gitleaks + Trivy + CVE Summary | ✅ |
| `.checkov.yaml` | Checkov skip rules per demo | ✅ |
| `.tflint.hcl` | TFLint AWS plugin config | ✅ |
| `.gitleaks.toml` | Gitleaks configuration + allowlist | ✅ |

**CVE Summary in GitHub Actions:**
- Vulnerability counts by severity (Critical, High, Medium, Low)
- Top CVEs table with package, version, and fix available
- Visible directly in GitHub Actions page via `$GITHUB_STEP_SUMMARY`

---

### 2. Terraform Remote State (S3) ✅

**⚠️ IMPORTANTE: MAI usare tfstate locali - SEMPRE remote backend su S3**

**Modulo `bootstrap/state-backend`:**

```
infra/terraform/bootstrap/state-backend/
├── main.tf          # S3 bucket + DynamoDB table
├── variables.tf     # Configuration variables
├── outputs.tf       # Backend config output
├── providers.tf     # AWS provider
├── backend.tf       # Remote state (self-referencing)
└── README.md        # Bootstrap documentation
```

**Risorse AWS - Tutte Gestite da Terraform:**

| Risorsa | Nome | Modulo Terraform |
|---------|------|------------------|
| S3 Bucket | `ecommerce-demo-terraform-state` | `bootstrap/state-backend` |
| DynamoDB Table | `ecommerce-demo-terraform-locks` | `bootstrap/state-backend` |
| ECR Repository | `ecommerce-demo/backend` | `bootstrap/ecr` |
| ECR Repository | `ecommerce-demo/frontend` | `bootstrap/ecr` |

**Nessuna risorsa creata da CLI. Tutto gestito da Terraform.**

**State Files su S3:**

| Layer | State Key | Contenuto |
|-------|-----------|-----------|
| State Backend | `bootstrap/state-backend/terraform.tfstate` | S3 + DynamoDB |
| Bootstrap OIDC | `bootstrap/github-oidc/terraform.tfstate` | GitHub OIDC provider |
| Bootstrap ECR | `bootstrap/ecr/terraform.tfstate` | ECR repositories |
| Platform (Day 5) | `demo/platform.tfstate` | Network + EKS + ECR |
| Services (Day 5) | `demo/services.tfstate` | RDS + ElastiCache + CDN |

**Layer Separation:**

```
Layer 1: PLATFORM (core)           → demo/platform.tfstate
├── Network (VPC, Subnets, NAT)
├── EKS (Cluster, Node Groups, IAM)
└── ECR Repositories
    Frequenza: Raro (mesi)
    Rischio: Alto

Layer 2: SERVICES (application)    → demo/services.tfstate
├── Database (RDS PostgreSQL)
├── Cache (ElastiCache Redis)
├── CDN (CloudFront)
└── Secrets Manager
    Frequenza: Spesso (settimane)
    Rischio: Medio
```

---

### 3. ArgoCD Preparation ✅

**Struttura Directory:**

```
argocd/
├── README.md                      # Setup documentation
├── install/
│   └── values.yaml                # ArgoCD Helm values for EKS/ALB
├── projects/
│   └── ecommerce.yaml             # ArgoCD Project with RBAC
└── applications/
    ├── backend.yaml               # Backend Application (manual sync)
    └── frontend.yaml              # Frontend Application (manual sync)
```

| File | Contenuto | Stato |
|------|-----------|-------|
| `argocd/projects/ecommerce.yaml` | ArgoCD Project con RBAC | ✅ |
| `argocd/applications/backend.yaml` | Backend App (manual sync) | ✅ |
| `argocd/applications/frontend.yaml` | Frontend App (manual sync) | ✅ |
| `argocd/install/values.yaml` | ArgoCD Helm values per EKS/ALB | ✅ |
| `.github/workflows/deploy-argocd.yml` | Workflow manuale per deploy ArgoCD | ✅ |
| `argocd/README.md` | Documentazione setup | ✅ |

**Sync Policy:** Manual (require explicit sync trigger via UI/CLI)

---

### 4. AWS Resources Created ✅

| Risorsa | Nome |
|---------|------|
| ECR Repository | `ecommerce-demo/backend` |
| ECR Repository | `ecommerce-demo/frontend` |

---

### 5. CVE Analysis ✅

**Metodologia Claude Code:**

1. Lettura report Trivy JSON (`security/reports/trivy-*.json`)
2. Per ogni CVE: ricerca nel codice se la libreria è usata
3. Valutazione se il vettore di attacco è esposto nel contesto applicativo
4. Priorità contestualizzata (non solo CVSS)
5. Suggerimenti remediation

**Risultati Analisi:**

| Severity | Totale | Action Required | Ignorabili |
|----------|--------|-----------------|------------|
| 🔴 Critical | 1 | 0 | 1 |
| 🟠 High | 7 | 0 | 7 |
| 🟡 Medium | 28 | 1 | 27 |

**Rischio Complessivo:** BASSO
**Azione Immediata:** 1 (JWT issuer validation in fast-jwt)

**Report Generati:**
- `slides/CVE_ANALYSIS.md` (IT)
- `slides/CVE_ANALYSIS_eng.md` (EN)

---

### 6. CI/CD Bug Fixes (10+) ✅

| Bug | Fix |
|-----|-----|
| Gitleaks config e allowlist | Creato `.gitleaks.toml` con path esclusioni |
| ESLint configuration | Configurazione per entrambe le app |
| npm workspace cache issues | Fix cache key strategy |
| Docker build context | Corretto path context |
| Trivy SHA mismatch | Short SHA (7 chars) vs full SHA (40 chars) |
| Race condition parallel commits | Concurrency group `trivy-report-commit` |
| Git pull with unstaged changes | Moved pull before saving report |
| Husky in CI environment | Skip hooks in CI |
| Terraform fmt check fails | Auto-fix con `terraform fmt` + auto-commit |

---

### Checklist Finale Day 4

- [x] CI Security: Gitleaks secret scanning
- [x] CI Security: Trivy vulnerability scan (warn only)
- [x] CI Security: CVE Summary in GitHub Actions page
- [x] CI Security: Checkov + TFLint per Terraform
- [x] ArgoCD: Project + Applications manifests
- [x] ArgoCD: deploy-argocd.yml workflow
- [x] Terraform: Remote state S3 + DynamoDB locking
- [x] Terraform: State migration da local a S3
- [x] Terraform: Layer separation (platform/services)
- [x] AWS: ECR repositories creati
- [x] CVE Analysis: Report contestualizzato (36→1)
- [x] Docs: SESSION_04_RECAP (IT + EN)
- [x] Docs: CVE_ANALYSIS (IT + EN)
- [x] 10+ bug fixes risolti

---

## Dettaglio Giorno 5 - 29 Dicembre ✅

### Deploy AWS Completo

| Task | Stato |
|------|-------|
| Terraform apply Layer 1 (Platform) | ✅ |
| Terraform apply Layer 2 (Services) | ✅ |
| External Secrets Operator Installation | ✅ |
| ArgoCD Installation & Configuration | ✅ |
| Backend + Frontend Deployment | ✅ |
| Database Migration & Seeding | ✅ |
| CloudFront HTTPS Access | ✅ |
| Security Group Fixes | ✅ |
| CORS Configuration | ✅ |
| Terraform Documentation CLI Changes | ✅ |
| Shutdown/Startup Scripts | ✅ |
| C-Level Presentation (IT + EN) | ✅ |
| Presentation PDF Export | ✅ |
| Demo Video Upload (GitHub Releases) | ✅ |
| SESSION_05_RECAP (IT + EN) | ✅ |

### Presentazione C-Level

| Asset | Location |
|-------|----------|
| Presentazione IT (HTML) | `docs/presentation/index-it.html` |
| Presentazione EN (HTML) | `docs/presentation/index-en.html` |
| PDF IT (20 slide) | `docs/presentation/presentation-it.pdf` |
| PDF EN (20 slide) | `docs/presentation/presentation-en.pdf` |
| Demo Video (223MB) | [GitHub Release v1.0.0-presentation](https://github.com/lorenzogirardi/ai-ecom-demo/releases/tag/v1.0.0-presentation) |

**Contenuti Presentazione:**
- Executive Summary (sfida, opportunità)
- PoC Details (architettura, timeline, qualità)
- Economics (costi, licensing, ROI 8-12x)
- Distribuzione codice (~19.5K linee) con pie chart
- 89 risorse AWS / 13 servizi
- Adoption Strategy e Roadmap

### Risorse AWS Deployate

```
LAYER 1: PLATFORM
├── VPC + 4 Subnets (2 public, 2 private)
├── NAT Gateway + Internet Gateway
├── EKS Cluster (ecommerce-demo-demo-eks)
├── EKS Node Group (2x t3.small)
└── ECR Repositories (backend, frontend)

LAYER 2: SERVICES
├── RDS PostgreSQL (db.t3.micro)
├── ElastiCache Redis (cache.t3.micro)
├── CloudFront Distribution (ALB HTTPS)
├── Secrets Manager (RDS, Redis, JWT)
└── IAM Role (External Secrets IRSA)

KUBERNETES
├── ArgoCD (argocd namespace)
├── External Secrets Operator (external-secrets namespace)
├── AWS Load Balancer Controller (kube-system)
├── Backend Deployment (ecommerce namespace)
└── Frontend Deployment (ecommerce namespace)
```

### URLs Applicazione

| Servizio | URL |
|----------|-----|
| E-commerce Frontend | https://dls03qes9fc77.cloudfront.net |
| API Health | https://dls03qes9fc77.cloudfront.net/api/health |

---

## Dettaglio Giorno 6 - 30 Dicembre ✅

### k6 Load Testing Framework

| Task | Stato |
|------|-------|
| Framework k6 (config.js, helpers) | ✅ |
| Smoke test scenario (30s health check) | ✅ |
| Load test scenario (3.5-9min standard) | ✅ |
| Stress test scenario (13min, up to 200 VUs) | ✅ |
| Spike test scenario (traffic spike analysis) | ✅ |
| HTML report generation | ✅ |
| k6 v0.49.0 compatibility fixes | ✅ |

**Struttura Framework:**

```
k6/
├── config.js                 # Configurazione centralizzata
├── helpers/
│   ├── http.js              # Helper HTTP con rate limit bypass
│   ├── auth.js              # Helper autenticazione
│   └── report.js            # Generatore report HTML
└── scenarios/
    ├── smoke.js             # 30s - Health check rapido
    ├── load.js              # 3.5-9min - Test di carico standard
    ├── stress.js            # 13min - Test di stress
    └── spike.js             # Test spike con recovery analysis
```

### Rate Limit Bypass

| Task | Stato |
|------|-------|
| Backend allowList configuration | ✅ |
| X-Load-Test-Bypass header | ✅ |
| Secure token-based bypass | ✅ |

### GitHub Actions Pipeline

| Task | Stato |
|------|-------|
| `load-test.yml` workflow | ✅ |
| Configurable test types (quick, load, stress, smoke) | ✅ |
| HTML reports as artifacts (30 days) | ✅ |
| VUs and target URL parameters | ✅ |

### Cluster Autoscaler

| Task | Stato |
|------|-------|
| Deployment con IRSA | ✅ |
| Node group discovery tags | ✅ |
| Scale range: 2-5 nodes (t3.medium) | ✅ |
| Scale down threshold: 50%, 10min idle | ✅ |
| Documentazione (IT + EN) | ✅ |

### CloudWatch Metrics Analysis

| Task | Stato |
|------|-------|
| Correlazione k6 con CloudWatch | ✅ |
| Bottleneck identification (backend pod 97% CPU) | ✅ |
| RDS analysis (18% CPU, 6 connections) | ✅ |
| ElastiCache analysis (99.9% cache hit rate) | ✅ |
| ALB analysis (328 RPS peak, 0 5xx errors) | ✅ |
| Documentazione (IT + EN) | ✅ |

### Stress Test Results

```
┌──────────────────────────────────────────────────┐
│              STRESS TEST RESULTS                  │
├──────────────────────────────────────────────────┤
│  Total Requests:     183,203                     │
│  Average RPS:        234.8 req/s                 │
│  Test Duration:      13 minuti                   │
├──────────────────────────────────────────────────┤
│  RESPONSE TIMES                                   │
│  p50:                89ms                        │
│  p95:                380ms                       │
│  p99:                892ms                       │
├──────────────────────────────────────────────────┤
│  ERROR RATE                                       │
│  Failed Requests:    5.33%                       │
│  Requests <500ms:    99.3%                       │
│  Requests <1s:       100%                        │
├──────────────────────────────────────────────────┤
│  THRESHOLDS          ALL PASSED ✅               │
└──────────────────────────────────────────────────┘
```

### Bottleneck Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                    BOTTLENECK IDENTIFICATION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️  EC2 Node 1 (Backend Pod): 97% CPU                          │
│      └── Single pod handling all API requests                   │
│      └── Recommendation: Scale to 2-3 replicas with HPA        │
│                                                                  │
│  ✅ RDS PostgreSQL: 18% CPU                                     │
│      └── Connection pooling effective (6 connections)           │
│                                                                  │
│  ✅ ElastiCache Redis: 4% CPU                                   │
│      └── 99.9% cache hit rate (76,865 hits, 63 misses)         │
│                                                                  │
│  ✅ ALB: No 5xx errors                                          │
│      └── Peak: 328 RPS, max latency 1.9s                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Checklist Finale Day 6

- [x] k6 framework con 4 scenari (smoke, load, stress, spike)
- [x] Rate limit bypass per load testing
- [x] GitHub Actions load-test pipeline
- [x] Cluster Autoscaler deployment + IRSA
- [x] CloudWatch metrics correlation
- [x] Bottleneck identification + recommendations
- [x] HTML report generation
- [x] k6 v0.49.0 compatibility (no optional chaining/spread)
- [x] Documentation (IT + EN): SESSION_06_RECAP, CLOUDWATCH_STRESS_ANALYSIS, CLUSTER_AUTOSCALER

---

## Dettaglio Giorno 7 - 30 Dicembre (Performance Fix) ✅

### Pod Anti-Affinity

| Task | File | Stato |
|------|------|-------|
| Backend Pod Anti-Affinity | `helm/backend/values-demo.yaml` | ✅ |
| Frontend Pod Anti-Affinity | `helm/frontend/values-demo.yaml` | ✅ |
| Pods distribuiti su nodi diversi | (cluster config) | ✅ |

### HPA Optimization

| Task | Stato |
|------|-------|
| CPU threshold ridotto (70% → 45%) | ✅ |
| maxReplicas aumentato (5 → 7) | ✅ |
| Metrics Server installato per EKS | ✅ |
| Patch `--kubelet-insecure-tls` | ✅ |

### Risultati Stress Test (con Autoscaling)

| Metrica | Day 6 | Day 7 | Variazione |
|---------|-------|-------|------------|
| Total Requests | 183,203 | 291,480 | +59% |
| Average RPS | 234.8 | 373.4 | +59% |
| p95 Latency | 380ms | 206ms | -46% |
| Error Rate | 5.33% | 5.27% | ~0% |

### Autoscaling Behavior

- HPA: 2 → 7 pods in ~8 minuti
- Cluster Autoscaler: 3 → 5 nodi
- Tutti i pod distribuiti su nodi diversi

### Bug Fix

| Bug | Fix | Commit |
|-----|-----|--------|
| k6 `/me` endpoint path sbagliato | Uso `endpoints.me` invece di `/auth/me` | `6b9291e` |
| 15,356 errori su check `me ok` | Risolto | ✅ |

### Documentation

- [x] SESSION_06_RECAP_PERFORMANCE_FIX.md (IT)
- [x] SESSION_06_RECAP_PERFORMANCE_FIX_eng.md (EN)

---

## Dettaglio Giorno 8 - 2 Gennaio (Deep Observability) ✅

### Container Insights (EKS Add-on)

| Task | Stato |
|------|-------|
| CloudWatch Observability add-on via Terraform | ✅ |
| IRSA role per CloudWatch Agent + X-Ray Daemon | ✅ |
| Metriche pod-level (CPU, memoria, network) | ✅ |

**Metriche Disponibili:**
| Metrica | Namespace | Descrizione |
|---------|-----------|-------------|
| `pod_cpu_utilization` | ContainerInsights | CPU usage per pod |
| `pod_memory_utilization` | ContainerInsights | Memory usage per pod |
| `pod_network_rx_bytes` | ContainerInsights | Network in per pod |
| `pod_network_tx_bytes` | ContainerInsights | Network out per pod |

### AWS X-Ray Distributed Tracing

| Task | Stato |
|------|-------|
| X-Ray DaemonSet deployment (`k8s/xray-daemon/`) | ✅ |
| Backend instrumentation (`aws-xray-sdk-core`) | ✅ |
| Frontend instrumentation (Next.js `instrumentation.ts`) | ✅ |
| Manual segment management (evitato CLS context issues) | ✅ |
| 1700+ traces catturati con annotations | ✅ |

**Backend X-Ray Integration:**
- `apps/backend/src/utils/xray.ts` - X-Ray utility
- Fastify hooks per request tracing
- Annotations: http_method, http_url, http_status
- Error/fault flags per 4xx/5xx responses

**Frontend X-Ray Integration:**
- `apps/frontend/src/lib/xray.ts` - X-Ray utility
- `apps/frontend/src/instrumentation.ts` - Server-side init
- `captureHTTPsGlobal` per SSR→Backend tracing

### Terraform Updates

| Task | Stato |
|------|-------|
| IAM trust policy aggiornata per xray-daemon service account | ✅ |
| StringLike condition per multiple service accounts | ✅ |
| Tutte le modifiche CLI codificate in Terraform | ✅ |

### Problemi Risolti

| Problema | Soluzione |
|----------|-----------|
| CLS Context Error | Rimosso `setSegment()`, gestione manuale segmenti via request object |
| IRSA Permission Error | Aggiornata trust policy con StringLike e lista service accounts |
| Docker Networking | Aggiunto `INTERNAL_API_URL=http://backend:4000` per rewrites server-side |

### Documentation

- [x] SESSION_08_RECAP.md (IT)
- [x] SESSION_08_RECAP_eng.md (EN)

---

## Dettaglio Giorno 9 - Security Hardening ⏳

### Security Tasks

| Task | Stato |
|------|-------|
| OWASP Top 10 review | ⏳ |
| Network policies (namespace isolation) | ⏳ |
| Container hardening (securityContext) | ⏳ |
| Pod Security Standards | ⏳ |
| Secrets rotation strategy | ⏳ |

### Security Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY REVIEW CHECKLIST                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  APPLICATION SECURITY                                            │
│  ├── [x] SQL Injection prevention (Prisma ORM)                  │
│  ├── [x] XSS prevention (React escaping)                        │
│  ├── [ ] CSRF protection                                         │
│  ├── [x] Rate limiting configured                                │
│  ├── [x] Input validation (Zod schemas)                         │
│  └── [ ] Secure headers (HSTS, CSP, etc.)                       │
│                                                                  │
│  INFRASTRUCTURE SECURITY                                         │
│  ├── [x] Network isolation (VPC, subnets)                       │
│  ├── [x] Security groups minimal access                         │
│  ├── [x] Encryption at rest (RDS, S3)                           │
│  ├── [x] Encryption in transit (TLS)                            │
│  ├── [x] Secrets management (AWS Secrets Manager)               │
│  └── [ ] IAM roles with least privilege review                  │
│                                                                  │
│  KUBERNETES SECURITY                                             │
│  ├── [ ] Non-root containers                                     │
│  ├── [ ] Read-only root filesystem                              │
│  ├── [ ] Network policies                                        │
│  ├── [ ] Pod security standards                                  │
│  ├── [ ] Service accounts with minimal permissions              │
│  └── [x] RBAC configured correctly                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Piano Originale (Reference)

### Settimana 1: Foundation (Giorni 1-3)

### Giorno 1 - Struttura Base

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 1 | Struttura monorepo completa | ✅ | package.json, directories, configs |
| 2 | Modulo Terraform network | ✅ | VPC, subnets, NAT, route tables |

### Giorno 2 - EKS e Database

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 3 | Modulo Terraform EKS | ✅ | Cluster, node groups, IRSA, OIDC |
| 4 | Modulo Terraform database | ✅ | RDS PostgreSQL, Secrets Manager |

### Giorno 3 - Cache, CDN, Environment

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 5 | Moduli cache + cdn | ✅ | ElastiCache Redis, CloudFront, S3 |
| 6 | Terraform environment demo | ✅ | main.tf, variables, backend, providers |

---

## Settimana 2: Backend API (Giorni 4-10)

### Giorno 4 - Backend Base

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 7 | Backend API struttura completa | ✅ | Fastify, Prisma schema, config, middleware |

### Giorno 5 - Modulo Catalog

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 8 | Modulo catalog completo | ✅ | Routes, CRUD, validation, caching |

### Giorno 6 - Modulo Auth

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 9 | Modulo auth completo | ✅ | JWT, bcrypt, register/login |

### Giorno 7 - Modulo Search

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 10 | Modulo search completo | ✅ | Query, filters, Redis cache |

### Giorno 8 - Modulo Orders

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 11 | Modulo orders completo | ✅ | Checkout, status management |

### Giorno 9 - Testing Backend

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 12 | Testing backend | ✅ | Vitest, 177 tests (unit, integration, database) |

### Giorno 10 - Helm Backend

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 13 | Helm chart backend | ✅ | Deployment, service, ingress, HPA |

---

## Settimana 3: Frontend (Giorni 11-16)

### Giorno 11 - Frontend Base

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 14 | Frontend Next.js struttura | ✅ | App Router, layout, homepage |

### Giorno 12 - Components React

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 15 | Components React | ✅ | Header, Footer, ProductCard, ProductGrid, SearchBar, CartItem, CartSummary |

### Giorno 13 - API Client e Hooks

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 16 | API client + hooks | ✅ | Axios, React Query, useProducts, useCategories, useCart (Zustand) |

### Giorno 14 - Pagine Complete

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 17 | Pagine products, cart, checkout | 🔄 | /products, /categories, /cart ✅ - /checkout ⏳ |

### Giorno 15 - Auth Frontend

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 18 | Autenticazione frontend | ⏳ | Login/register, middleware, token |

### Giorno 16 - Helm Frontend

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 19 | Helm chart frontend | ✅ | Deployment, service, ingress, HPA |

---

## Settimana 4: CI/CD + Integrazione (Giorni 17-23)

### Giorno 17 - CI/CD Backend

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 20 | GitHub Actions backend | ✅ | Build, test, Docker, deploy EKS |

### Giorno 18 - CI/CD Frontend

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 21 | GitHub Actions frontend | ✅ | Build, Docker, deploy EKS |

### Giorno 19 - Scripts Automazione

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 22 | Scripts automazione | ✅ | setup-infra.sh, deploy-all.sh, local-dev.sh |

### Giorno 20 - Docker Compose

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 23 | Docker Compose local dev | ✅ | PostgreSQL, Redis, Adminer |

### Giorno 21 - Documentazione

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 24 | Documentazione completa | ✅ | README, SETUP, DEVELOPMENT, DEPLOYMENT, API |

### Giorni 22-23 - Ottimizzazione

| Sessione | Task | Stato | Note |
|----------|------|-------|------|
| 25 | Review e ottimizzazione | ⏳ | Security review, rate limiting |

---

## Settimana 5: Buffer & Polish (Giorni 24-30)

### Giorno 24-25 - Dockerfiles

| Task | Stato | Note |
|------|-------|------|
| Dockerfile backend multi-stage | ✅ | Non-root user, health check, ~180MB |
| Dockerfile frontend multi-stage | ✅ | Next.js standalone, ~120MB |

### Giorno 26-27 - Seed Data

| Task | Stato | Note |
|------|-------|------|
| prisma/seed.ts | ✅ | 3 users, 9 categories, 18 products, 3 orders |
| Script seed automation | ✅ | npm run db:seed |

### Giorno 28-29 - Testing E2E

| Task | Stato | Note |
|------|-------|------|
| Test manuale completo | ⏳ | Tutti i flussi |
| Fix bug trovati | ⏳ | |
| Test su EKS | ⏳ | Deploy reale AWS |

### Giorno 30 - Finalizzazione

| Task | Stato | Note |
|------|-------|------|
| Screenshots/video demo | ⏳ | Per portfolio |
| Cleanup codice | ⏳ | Rimozione dead code |
| README finale | ⏳ | Badges, demo links |

---

## Riepilogo Stato Attuale

### Completato ✅ (Sessioni 1-3)

**Infrastruttura:**
- [x] Struttura monorepo
- [x] Terraform modules (network, eks, database, cache, cdn)
- [x] Terraform environment demo
- [x] Helm charts (frontend, backend)
- [x] GitHub Actions workflows (base)
- [x] Scripts automazione
- [x] Docker Compose

**Backend:**
- [x] Backend API (server, config, middleware, utils)
- [x] Backend modules (auth, catalog, search, orders)
- [x] Prisma schema
- [x] Dockerfile multi-stage (non-root user, health check)
- [x] Test suite completa (177 tests)
- [x] Seed data (3 users, 9 categories, 18 products, 3 orders)
- [x] CORS wildcard support (*.k8s.it, *.ngrok-free.app, *.ngrok.app)

**Frontend:**
- [x] Layout, providers, styles
- [x] Dockerfile multi-stage (standalone output)
- [x] Components (Header, Footer, ProductCard, ProductGrid, SearchBar, CartItem, CartSummary, AddressForm)
- [x] API client (Axios)
- [x] Hooks (useProducts, useCategories, useCart, useAuth, useOrders, useSearch)
- [x] Pages (/products, /categories, /cart, /auth/login, /auth/register, /checkout, /account, /orders)
- [x] Auth system (AuthContext, useAuth, middleware)
- [x] Checkout flow (checkout page, order confirmation)
- [x] User account (profile, orders history, order detail)
- [x] Frontend test suite (29 tests)

**Documentazione:**
- [x] README, SETUP, DEVELOPMENT, DEPLOYMENT, API docs
- [x] Execution plan (IT + EN)
- [x] Session recaps 1-3 (IT + EN)

### Completato ✅ (Sessione 4)

**CI Security Scanning:**
- [x] Gitleaks secret scanning (apps + infra)
- [x] Trivy vulnerability scan (warn only, JSON reports)
- [x] CVE Summary in GitHub Actions page
- [x] Checkov + TFLint per Terraform

**ArgoCD Preparation:**
- [x] Project + Applications manifests
- [x] deploy-argocd.yml workflow (manual trigger)

**Terraform Remote State:**
- [x] S3 bucket + DynamoDB locking
- [x] State migration da local a S3
- [x] Layer separation (platform/services)

**CVE Analysis:**
- [x] Report contestualizzato (36 CVEs → 1 action required)
- [x] CVE_ANALYSIS.md (IT + EN)

**Documentation:**
- [x] SESSION_04_RECAP (IT + EN)

### Da Completare ⏳

**Giorno 5 - AWS Deploy:**
- [ ] Terraform apply Layer 1 (Platform: Network + EKS + ECR)
- [ ] Terraform apply Layer 2 (Services: RDS + ElastiCache + CDN)
- [ ] Run deploy-argocd.yml workflow
- [ ] Manual sync via ArgoCD UI
- [ ] E2E tests su AWS
- [ ] Screenshots/demo

---

## Prossima Sessione

**Giorno 5 - AWS Deploy**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SESSIONE 5 - AWS DEPLOY                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. TERRAFORM APPLY                                              │
│     ├── Layer 1: Platform (Network + EKS + ECR)                 │
│     │   cd infra/terraform/environments/demo/platform           │
│     │   terraform init && terraform apply                       │
│     │                                                            │
│     └── Layer 2: Services (RDS + ElastiCache + CDN)             │
│         cd infra/terraform/environments/demo/services           │
│         terraform init && terraform apply                       │
│                                                                  │
│  2. ARGOCD DEPLOY                                                │
│     ├── Run: .github/workflows/deploy-argocd.yml                │
│     │   (manual trigger from GitHub Actions)                    │
│     │                                                            │
│     └── Workflow steps:                                          │
│         ├── Configure AWS credentials (OIDC)                    │
│         ├── Update kubeconfig for EKS                           │
│         ├── helm upgrade --install argocd                       │
│         ├── kubectl apply Project + Applications                │
│         └── Output ArgoCD UI URL + admin password               │
│                                                                  │
│  3. APPLICATION DEPLOY                                           │
│     ├── Access ArgoCD UI                                         │
│     ├── Manual sync: Backend Application                        │
│     └── Manual sync: Frontend Application                       │
│                                                                  │
│  4. E2E TESTING                                                  │
│     ├── Verify all endpoints                                     │
│     ├── Test user flows (register, login, checkout)             │
│     └── Screenshots/demo                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Comandi da eseguire:**
```bash
# Layer 1: Platform
cd ecommerce-demo/infra/terraform/environments/demo/platform
terraform init
terraform plan
terraform apply

# Layer 2: Services
cd ../services
terraform init
terraform plan
terraform apply

# ArgoCD: Run from GitHub Actions UI
# .github/workflows/deploy-argocd.yml (manual trigger)

# After ArgoCD is running:
# 1. Access ArgoCD UI (URL from workflow output)
# 2. Login with admin password (from workflow output)
# 3. Sync Backend application
# 4. Sync Frontend application
# 5. Access e-commerce app and test
```

**⚠️ IMPORTANTE:**
- Tutti i Terraform state sono su S3 remote backend
- MAI usare tfstate locali
- Layer 1 deve completare PRIMA di Layer 2

---

## Statistiche Progetto

| Metrica | Sess. 1 | Sess. 2 | Sess. 3 | Sess. 4 | Sess. 5 | Sess. 6 | Sess. 7 | Sess. 8 | Totale |
|---------|---------|---------|---------|---------|---------|---------|---------|---------|--------|
| File creati | 82 | 21 | 24 | 15 | 12 | 12 | 6 | 11 | 183 |
| Linee di codice | ~8,900 | ~3,200 | ~2,500 | ~1,500 | ~3,400 | ~1,800 | ~300 | ~400 | ~22,000 |
| Backend Tests | 0 | 177 | 177 | 177 | 177 | 177 | 177 | 177 | 177 |
| Frontend Tests | 0 | 0 | 29 | 29 | 29 | 29 | 29 | 29 | 29 |
| Tempo Claude | ~2h | ~1.5h | ~1.5h | ~2h | ~5h | ~2h | ~2h | ~2h | ~18h |
| Tempo equiv. dev | ~50h | ~50h | ~26.5h | ~40h | ~20h | ~18h | ~12h | ~14h | ~230.5h |
| Bug fixes | 0 | 0 | 5 | 10+ | 8 | 3 | 1 | 3 | 30+ |
| CVE analyzed | 0 | 0 | 0 | 36 | 0 | 0 | 0 | 0 | 36 |
| AWS Resources | 0 | 0 | 0 | 4 | 85 | 89 | 89 | 91 | 91 |
| Load Tests | 0 | 0 | 0 | 0 | 0 | 183K | 291K | 291K | 291K |
| X-Ray Traces | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1700+ | 1700+ |

### Distribuzione Codice (~22.000 linee)

| Categoria | Linee | % |
|-----------|-------|---|
| Application (Frontend + Backend) | 6,917 | 35.6% |
| QA / Tests | 5,110 | 26.3% |
| Infrastructure (Terraform + Helm + ArgoCD) | 4,950 | 25.5% |
| DevOps / Scripts | 1,321 | 6.8% |
| CI/CD Pipelines | 985 | 5.1% |
| Security Config | 158 | 0.8% |

### Risorse AWS (89 totali - 13 servizi)

| Servizio | Risorse |
|----------|---------|
| IAM (Roles, Policies, OIDC) | 22 |
| VPC (Network, Subnets, NAT) | 15 |
| ECR (Repositories) | 12 |
| Security Groups | 11 |
| S3 (State + Assets) | 10 |
| CloudFront (CDN) | 6 |
| Secrets Manager | 6 |
| RDS PostgreSQL | 3 |
| ElastiCache Redis | 3 |
| EKS (Cluster + Nodes) | 2 |
| CloudWatch (Alarms) | 2 |
| DynamoDB (TF Locks) | 1 |

---

## Note

- Repository: https://github.com/lorenzogirardi/ai-ecom-demo
- Commit iniziale: bd0d99f (24 Dic 2024)
- Ultimo aggiornamento: 30 Dic 2024
- Total tests: 206 (177 backend + 29 frontend)
- Total linee codice: ~21,300
- Total risorse AWS: 89 (13 servizi)
- Load tests eseguiti: 183K+ requests
- **⚠️ Terraform State: SEMPRE remote backend su S3, MAI locale**
- **📊 Presentazione C-Level:** `docs/presentation/` (locale, in .gitignore)
- **🎬 Demo Video:** [GitHub Release v1.0.0-presentation](https://github.com/lorenzogirardi/ai-ecom-demo/releases/tag/v1.0.0-presentation)
