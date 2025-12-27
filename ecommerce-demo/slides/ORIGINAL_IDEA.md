# Demo E-commerce Semplificato - Fattibile con Claude Max ($100/mese)

> **Questo documento è il piano originale usato per presentazione.**
> **Documento vivo: aggiornato ad ogni sessione con progressi effettivi.**
> Vedi sezione finale per confronto piano vs realtà.

## Obiettivo Realistico
Creare un **e-commerce demo funzionante e completo** che mostri tutte le competenze (app, IaC, CI/CD) ma con **scope ridotto** per completarlo in 1 mese con account Max standard.

---

## ⚠️ Limiti Account Max Standard

**Cosa aspettarsi:**
- ~100-400 prompt con Claude Code ogni 5 ore
- Limiti settimanali: ~120-240 ore di Sonnet 4
- Limiti condivisi tra chat web e Claude Code
- **Realisticamente: 3-5 ore intensive al giorno prima di rate limit**

**Strategia: Massimizzare l'output per prompt**
- Un prompt = un componente completo (non iterazioni multiple)
- Usare prompt molto dettagliati e precisi
- Lavorare "a blocchi" distribuiti nella settimana

---

## Architettura Semplificata (ma professionale)

### DA 5 MICROSERVIZI → 1 MONOLITO MODULARE + 1 FRONTEND

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
│  │    - Catalogo prodotti                       │   │
│  │    - Ricerca                                 │   │
│  │    - Cart & Checkout                         │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │ REST API                           │
│  ┌──────────────▼───────────────────────────────┐   │
│  │       API Backend (Node.js Monolith)         │   │
│  │  Moduli:                                     │   │
│  │    - /catalog (prodotti, categorie)          │   │
│  │    - /auth (JWT, bcrypt)                     │   │
│  │    - /search (in-memory o Redis)             │   │
│  │    - /orders (checkout mock)                 │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐   │
│  │        RDS Aurora Serverless v2              │   │
│  │         (PostgreSQL)                         │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │      ElastiCache Redis (opzionale)            │  │
│  │         (cache + sessioni)                    │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

         S3 Bucket (immagini prodotti)
```

### Cosa ELIMINIAMO rispetto al progetto originale:

❌ **5 microservizi separati** → ✅ 1 monolito modulare ben strutturato
❌ **Strapi CMS** → ✅ Admin API semplice nel backend
❌ **Algolia** → ✅ Ricerca in-memory o Redis con filtering base
❌ **Cognito** → ✅ Auth JWT custom (più semplice da dimostrare)
❌ **Stripe** → ✅ Mock payment (fake checkout)
❌ **SQS** → ✅ Funzionalità sincrona
❌ **Multi-repo** → ✅ Monorepo semplice

### Cosa MANTENIAMO (valore demo):

✅ **EKS + managed services** (Aurora, Redis, S3, CloudFront)
✅ **Terraform IaC completo** (VPC, EKS, RDS, ALB, CloudFront)
✅ **Helm charts** (deployment professionale)
✅ **GitHub Actions CI/CD** (build, test, Docker, deploy)
✅ **Full-stack TypeScript** (frontend + backend)
✅ **Best practices** (error handling, logging, monitoring)

---

## Struttura Progetto Semplificata

### Monorepo unico:

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
│   ├── frontend/              # Chart per Next.js
│   └── backend/               # Chart per API
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

## Piano di Lavoro con Max Standard (1 mese)

### 🎯 STRATEGIA: 1 componente completo per sessione

Ogni sessione Claude Code = 1 componente finito al 100%

### Settimana 1: Foundation (6 sessioni)

**Sessione 1** (Giorno 1 - mattina):
```
"Genera struttura monorepo completa con:
- package.json workspace root
- Directory apps/frontend e apps/backend vuote con package.json base
- Directory infra/terraform con struttura moduli
- Directory helm con struttura base
- .gitignore, README.md, scripts base
- tsconfig.json per shared config"
```

**Sessione 2** (Giorno 1 - pomeriggio):
```
"Genera modulo Terraform network completo in infra/terraform/modules/network/:
- VPC 10.0.0.0/16
- 2 subnet pubbliche, 2 subnet private
- Internet Gateway, NAT Gateway (1 solo per demo)
- Route tables
- Security groups base
- VPC Flow Logs
- Output completi
Include main.tf, variables.tf, outputs.tf con commenti"
```

**Sessione 3** (Giorno 2 - mattina):
```
"Genera modulo Terraform EKS completo in infra/terraform/modules/eks/:
- Cluster EKS 1.28+
- 1 node group managed (t3.medium, 2-4 nodi)
- Addon: vpc-cni, coredns, kube-proxy
- IAM roles + IRSA
- CloudWatch logging
- Security groups
Include main.tf, variables.tf, outputs.tf, data sources"
```

**Sessione 4** (Giorno 2 - pomeriggio):
```
"Genera modulo Terraform database completo in infra/terraform/modules/database/:
- Aurora Serverless v2 PostgreSQL
- Min 0.5 ACU, max 2 ACU
- Subnet group
- Security group (accesso solo da EKS)
- Secrets Manager per credentials
- Parameter group
Include main.tf, variables.tf, outputs.tf"
```

**Sessione 5** (Giorno 3 - mattina):
```
"Genera moduli Terraform rimanenti:
1. modules/cache/: ElastiCache Redis (cache.t4g.micro)
2. modules/cdn/: CloudFront + ACM certificate
Include per ognuno: main.tf, variables.tf, outputs.tf"
```

**Sessione 6** (Giorno 3 - pomeriggio):
```
"Genera Terraform environment demo in infra/terraform/environments/demo/:
- main.tf che usa tutti i moduli
- variables.tf
- terraform.tfvars con valori demo
- backend.tf per S3 remote state
- providers.tf
Tutto pronto per terraform apply"
```

### Settimana 2: Backend API (7 sessioni)

**Sessione 7** (Giorno 4):
```
"Genera backend API completo in apps/backend/:
Struttura:
- src/server.ts (Fastify + configurazione)
- src/config/ (database, redis, env)
- src/middleware/ (auth, error, logging)
- src/utils/ (logger con Pino, errors)
- prisma/schema.prisma (User, Category, Product, Order)
- package.json con dipendenze (fastify, prisma, bcrypt, jsonwebtoken, pino)
- tsconfig.json
- .env.example
- Dockerfile multi-stage ottimizzato"
```

**Sessione 8** (Giorno 5):
```
"Genera modulo catalog completo in apps/backend/src/modules/catalog/:
- routes.ts (GET /categories, GET /products, GET /products/:id)
- controller.ts
- service.ts (business logic)
- validation.ts (Zod schemas)
Implementazione completa con Prisma, error handling, pagination"
```

**Sessione 9** (Giorno 6):
```
"Genera modulo auth completo in apps/backend/src/modules/auth/:
- routes.ts (POST /register, POST /login, POST /logout, GET /me)
- controller.ts
- service.ts (bcrypt hash, JWT generation)
- middleware/auth.middleware.ts (JWT verification)
- validation.ts
Implementazione completa con session management"
```

**Sessione 10** (Giorno 7):
```
"Genera modulo search completo in apps/backend/src/modules/search/:
- routes.ts (GET /search?q=&category=&minPrice=&maxPrice=)
- controller.ts
- service.ts (query Prisma con filters, usa Redis per cache risultati)
- validation.ts
Implementazione con caching intelligente"
```

**Sessione 11** (Giorno 8):
```
"Genera modulo orders completo in apps/backend/src/modules/orders/:
- routes.ts (POST /orders, GET /orders, GET /orders/:id)
- controller.ts
- service.ts (calcolo totale, mock payment, status management)
- validation.ts
Implementazione checkout completo con mock Stripe"
```

**Sessione 12** (Giorno 9):
```
"Genera testing per backend:
- tests/ directory con Jest
- Unit tests per ogni service
- Integration tests per API routes
- Test setup con database in-memory
- package.json scripts per test
Almeno 60% coverage"
```

**Sessione 13** (Giorno 10):
```
"Genera Helm chart backend completo in helm/backend/:
- Chart.yaml
- values.yaml (con tutte le configurazioni)
- values-demo.yaml
- templates/ completi:
  - deployment.yaml (con init container Prisma migrate)
  - service.yaml
  - ingress.yaml (ALB annotations)
  - configmap.yaml
  - secret.yaml (Secrets Manager CSI)
  - serviceaccount.yaml (IRSA)
  - hpa.yaml
Include probes, resources, security contexts"
```

### Settimana 3: Frontend (6 sessioni)

**Sessione 14** (Giorno 11):
```
"Genera frontend Next.js 14 completo in apps/frontend/:
Struttura base:
- src/app/ con App Router:
  - layout.tsx
  - page.tsx (homepage)
  - products/page.tsx (catalogo)
  - products/[id]/page.tsx (dettaglio)
  - cart/page.tsx
  - checkout/page.tsx
  - login/page.tsx
- next.config.js
- tailwind.config.js
- package.json
- tsconfig.json
- Dockerfile multi-stage"
```

**Sessione 15** (Giorno 12):
```
"Genera components React in apps/frontend/src/components/:
- Header.tsx (nav + cart icon)
- Footer.tsx
- ProductCard.tsx
- ProductGrid.tsx
- CategoryNav.tsx
- SearchBar.tsx (con debounce)
- Cart/CartItem.tsx
- Cart/CartSummary.tsx
Tutti con TypeScript, Tailwind CSS, responsive"
```

**Sessione 16** (Giorno 13):
```
"Genera API client e state management in apps/frontend/src/lib/:
- api-client.ts (fetch wrapper con auth headers)
- hooks/ directory:
  - useProducts.ts
  - useCart.ts (context + localStorage)
  - useAuth.ts
- types.ts (shared types con backend)
Usa React Query per caching"
```

**Sessione 17** (Giorno 14):
```
"Implementa pagine complete in apps/frontend/src/app/:
1. products/page.tsx: lista con filtri, pagination, SSR
2. products/[id]/page.tsx: dettaglio con SSG, add to cart
3. cart/page.tsx: gestione cart, update quantità
4. checkout/page.tsx: form checkout, submit order
Con loading states, error handling, validazione"
```

**Sessione 18** (Giorno 15):
```
"Implementa autenticazione frontend:
- login/page.tsx: form login/register
- src/middleware.ts: protected routes
- src/lib/auth.ts: token management
- Integration con backend auth API
Con redirect, session management, error handling"
```

**Sessione 19** (Giorno 16):
```
"Genera Helm chart frontend completo in helm/frontend/:
- Chart.yaml
- values.yaml
- values-demo.yaml
- templates/ completi (deployment, service, ingress, configmap, hpa)
Include environment variables per API_URL, caching, probes"
```

### Settimana 4: CI/CD + Integrazione (6 sessioni)

**Sessione 20** (Giorno 17):
```
"Genera GitHub Actions workflow completo per backend:
.github/workflows/backend-ci-cd.yml:
1. build-and-test job
2. docker-build-push job (ECR con OIDC)
3. deploy-to-eks job (Helm)
Include matrix per multi-environment, caching, notifications"
```

**Sessione 21** (Giorno 18):
```
"Genera GitHub Actions workflow completo per frontend:
.github/workflows/frontend-ci-cd.yml:
1. build-and-test job (Next.js build)
2. docker-build-push job (ECR)
3. deploy-to-eks job (Helm)
Include build optimization, cache layers"
```

**Sessione 22** (Giorno 19):
```
"Genera script di automazione in scripts/:
1. setup-infra.sh: terraform init/plan/apply per tutti i moduli
2. deploy-all.sh: deploy backend + frontend con Helm in ordine
3. seed-data.sh: popolamento DB con dati demo
4. local-dev.sh: setup locale con Docker Compose
Include error handling, logging, rollback"
```

**Sessione 23** (Giorno 20):
```
"Genera Docker Compose per local development:
docker-compose.yml con:
- PostgreSQL
- Redis
- Backend API (hot reload)
- Frontend (hot reload)
- Adminer (DB UI)
Include volumes, networking, env variables"
```

**Sessione 24** (Giorno 21):
```
"Genera documentazione completa:
1. README.md root: architecture diagram (Mermaid), quick start
2. docs/SETUP.md: step-by-step infra setup
3. docs/DEVELOPMENT.md: local dev, testing, debugging
4. docs/DEPLOYMENT.md: CI/CD, Helm, troubleshooting
5. docs/API.md: OpenAPI/Swagger spec
Include screenshots, esempi, troubleshooting"
```

**Sessione 25** (Giorno 22-23):
```
"Rivedi e ottimizza tutto il progetto:
1. Security hardening (Dockerfile, Helm security contexts)
2. Performance optimization (caching strategies, query optimization)
3. Cost optimization (rightsizing resources)
4. Monitoring setup (CloudWatch dashboards, alarms)
5. Testing end-to-end
Genera checklist completa + fix critici"
```

### Giorni 24-30: Buffer & Polish

- Test manuale completo
- Fix bug trovati
- Refinement documentazione
- Video demo / screenshots
- Cleanup codice

---

## Stima Realistica

### Con Account Max ($100/mese):

**Tempo totale**: 25-30 giorni lavorativi
**Sessioni Claude Code**: ~25 sessioni intensive
**Ore effettive coding con Claude**: ~50-60 ore distribuite
**Rate limit management**: Lavorare 2-3 sessioni al giorno con pause

### Cosa aspettarsi:

✅ **Completamente fattibile** con disciplina
✅ **Dimostra tutte le competenze** richieste
✅ **Scalabile**: puoi espandere dopo (aggiungere microservizi)
❌ **Richiede disciplina**: prompt precisi, non iterare troppo
❌ **Alcune parti fatte manualmente**: piccoli fix, configurazioni AWS

---

## Tips per Massimizzare Max Standard

### 1. Prompt "One-Shot" Completi
```
❌ MALE:
"Crea il backend"
"Aggiungi auth"
"Aggiungi logging"
"Aggiungi tests"

✅ BENE:
"Genera backend API completo con:
- Struttura completa
- Auth module con JWT
- Logging con Pino
- Error handling
- Tests con Jest
- Dockerfile
Implementazione completa, production-ready"
```

### 2. Batch Related Tasks
```
✅ "Genera moduli Terraform cache + cdn insieme"
✅ "Genera tutti i React components in una sessione"
```

### 3. Usa Chat Web per Planning
- Discuti architettura in chat normale (non consuma Claude Code limits)
- Poi usa Claude Code solo per generazione codice

### 4. Distribuisci Sessioni
- 2-3 sessioni intensive al giorno
- Pausa di qualche ora tra sessioni
- Evita di esaurire tutto in 2 giorni

---

## Deliverable Finale

Alla fine avrai:

📦 **Codice**:
- 2 applicazioni full-stack TypeScript
- 1 monorepo ben strutturato
- ~5000-7000 righe di codice applicativo
- ~2000 righe IaC Terraform

🏗️ **Infrastruttura**:
- EKS cluster su AWS
- Aurora Serverless v2
- ElastiCache Redis
- CloudFront + ACM
- Tutto via IaC

🚀 **CI/CD**:
- 2 pipeline complete GitHub Actions
- Automated testing
- Docker build & push
- Helm deployments

📚 **Documentazione**:
- Architecture diagrams
- Setup guides
- API documentation
- Troubleshooting

---

---

## Progresso Effettivo vs Piano Originale

> **Ultimo aggiornamento: 27 Dicembre 2024 (Giorno 4)**

### Stato Attuale

| Settimana Piano | Sessioni Previste | Completato in | Stato |
|-----------------|-------------------|---------------|-------|
| Settimana 1: Foundation | 6 sessioni (Giorni 1-3) | **Giorno 1** | ✅ |
| Settimana 2: Backend API | 7 sessioni (Giorni 4-10) | **Giorno 1** | ✅ |
| Settimana 3: Frontend | 6 sessioni (Giorni 11-16) | **Giorni 2-3** | ✅ |
| Settimana 4: CI/CD + Integrazione | 6 sessioni (Giorni 17-23) | **Giorni 1, 4** | ✅ |
| Giorni 24-30: Buffer & Polish | 7 giorni | **Giorno 4** | ✅ |
| **Giorno 5: AWS Deploy** | Non previsto | Prossimo | ⏳ |

### Cosa è stato fatto (Giorni 1-4)

| Giorno | Piano Originale | Realtà |
|--------|-----------------|--------|
| **1** | Sessioni 1-2 (Struttura + Network) | Sessioni 1-14 complete (Foundation + Backend + Helm + CI/CD base + Docs) |
| **2** | Sessioni 3-4 (EKS + Database) | Dockerfiles + React Components + 177 Backend Tests + Seed Data |
| **3** | Sessione 5 (Cache + CDN) | Auth + Checkout + Account + Search + Security + 29 Frontend Tests |
| **4** | Sessione 6 (Environment demo) | CI Security + ArgoCD + Terraform Remote State + CVE Analysis + 10+ Bug Fixes |

### Perché siamo più veloci del piano?

| Fattore | Piano Originale | Realtà |
|---------|-----------------|--------|
| **Modello** | Sonnet 4 (ipotizzato) | **Opus 4.5** (più potente, meno iterazioni) |
| **Strategia Prompt** | 1 componente per sessione | **Multi-componente per sessione** |
| **Context Window** | Limitato, reset frequente | **Illimitato** (auto-summarization) |
| **Parallelismo** | Sequenziale | **Task paralleli** con agent |
| **Qualità Output** | Iterazioni multiple | **Corretto al primo tentativo** |
| **Rate Limits** | 3-5 ore/giorno max | **Sessioni intensive senza limiti** |

### Metriche Correnti (Giorno 4)

```
┌─────────────────────────────────────────────────────────┐
│              PROGRESSO vs PIANO                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Giorni pianificati:     30                             │
│  Giorni effettivi:       4 (+ Day 5 deploy)             │
│  Speedup:                ~6-7x                          │
│                                                          │
│  Sessioni pianificate:   25                             │
│  Sessioni effettive:     4                              │
│  Efficienza:             ~6x                            │
│                                                          │
│  File creati:            142                            │
│  Linee di codice:        ~16,100                        │
│  Tests:                  206 (177 backend + 29 frontend)│
│                                                          │
│  Costo Claude:           ~$10                           │
│  Costo Team (stima):     €12,000 - €15,000             │
│  ROI:                    ~1,300x                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Prossimi Passi

- [ ] **Giorno 5**: Terraform apply (Platform + Services) + ArgoCD deploy + E2E Tests

---

*Documento vivo - Aggiornato ad ogni sessione*
*Ultimo aggiornamento: 27 Dicembre 2024*
