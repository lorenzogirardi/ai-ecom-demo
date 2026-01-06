# REASONING PROMPT UI - Sessione di Planning con Claude Web

> **Questo documento contiene la sessione di ragionamento e pianificazione eseguita con Claude via interfaccia web, prima di iniziare lo sviluppo con Claude Code.**

---

## Indice

1. [Requisiti Originali](#1-requisiti-originali)
2. [Analisi Fattibilità Claude Code](#2-analisi-fattibilità-claude-code)
3. [Piano Max 5x Ottimizzato](#3-piano-max-5x-ottimizzato)
4. [Rate Limits e Vincoli](#4-rate-limits-e-vincoli)
5. [Guida Setup Iniziale](#5-guida-setup-iniziale)
6. [Troubleshooting](#6-troubleshooting)
7. [Prompt Presentazione C-Level](#7-prompt-presentazione-c-level)

---

## 1. Requisiti Originali

### 1.1 Obiettivo

E-commerce dimostrativo "end-to-end" (UI, BFF, backend servizi core, checkout), scalabile su AWS EKS e completamente automatizzato (IaC + CI/CD).

### 1.2 Requisiti Funzionali

- Frontend + BFF in TypeScript/Node.js
- Backend servizi: prodotti e categorie, ricerca, autenticazione/login, ordine/pagamento (mock o integrazione light)

### 1.3 Requisiti Non Funzionali

- Solo managed service AWS per data plane (DB, cache, queue, ecc.)
- Multi-repo IaC con ownership chiara tra team piattaforma e team applicativi
- Tool terzi solo se free-tier o open source (CMS, PIM, search, checkout)

### 1.4 Architettura Logica AWS

#### Layer Edge e Networking
- **Route 53**: DNS pubblico del dominio demo
- **CloudFront**: Origin su ALB o ingress EKS, HTTPS con ACM
- **AWS WAF**: (opzionale) protezione base

#### Compute e Orchestrazione (EKS)
- Cluster Amazon EKS managed
- Nodi gestiti (managed node groups) suddivisi per tipo workload
- Addon: CoreDNS, VPC CNI, kube-proxy, AWS Load Balancer Controller

#### Servizi Applicativi (TypeScript/Node.js)

| Servizio | Responsabilità |
|----------|----------------|
| **web-app (Frontend + BFF)** | UI React/Next.js SSR, orchestrazione chiamate servizi interni |
| **catalog-service** | API categorie/prodotti, integrazione CMS/PIM |
| **search-service** | Wrapper motore ricerca (Algolia free tier) |
| **auth-service** | Gestione utenti demo, JWT o Cognito |
| **checkout-service** | Creazione ordine, calcolo totale, payment mock |

#### Data Layer
- **Amazon RDS Aurora Serverless v2**: PostgreSQL per utenti, ordini, prodotti
- **Amazon ElastiCache Redis**: Sessioni BFF, caching query
- **Amazon S3**: Asset statici, immagini prodotto
- **Amazon SQS**: (opzionale) ordini asincroni

### 1.5 Tool Esterni Free/Low Cost

| Categoria | Tool | Note |
|-----------|------|------|
| CMS/PIM | Strapi Community | Self-hosted su EKS |
| Search | Algolia Build | Free tier: 10K ricerche/mese |
| Identity | Amazon Cognito | Free tier per demo |
| Payment | Stripe Test Mode | Zero costi reali |

### 1.6 Design IaC Terraform

#### Repo Piattaforma (Team Infra)
```
terraform/
├── modules/
│   ├── network/     # VPC, subnet, NAT
│   ├── eks/         # Cluster, node groups, IRSA
│   ├── edge/        # Route53, ACM, CloudFront, WAF
│   └── observability/  # CloudWatch
└── env/
    ├── dev/
    └── demo/
```

#### Repo Applicativo (Per Dominio)
```
infra/terraform/
├── db/          # Aurora cluster
├── cache/       # ElastiCache Redis
├── queues/      # SQS
├── secrets/     # Secrets Manager
└── eks-integration/  # IRSA roles
```

### 1.7 Modello Dati

```sql
-- Tabelle Aurora
users: id, email, password_hash, metadata
categories: id, name, slug
products: id, category_id, name, sku, price, stock, image_url, description_short
orders: id, user_id, status, total_amount, created_at
order_items: id, order_id, product_id, quantity, unit_price

-- Indice Algolia
products: id, name, category, price, image_url, description_short
```

---

## 2. Analisi Fattibilità Claude Code

### 2.1 Cosa Claude Code Può Fare

**Generazione codice applicativo:**
- Tutti i microservizi TypeScript/Node.js
- Configurazioni Dockerfile
- Chart Helm completi
- Frontend Next.js SSR/SSG
- Integrazioni Algolia, Stripe, Cognito

**Infrastructure as Code:**
- Moduli Terraform completi
- IAM roles, security groups, IRSA
- Struttura multi-repo

**CI/CD:**
- Pipeline GitHub Actions
- OIDC authentication GitHub → AWS
- Workflow build, test, deploy

### 2.2 Limitazioni

Claude Code NON può:
- Eseguire `terraform apply` sui tuoi account AWS
- Creare account su servizi esterni
- Testare end-to-end senza ambiente reale

### 2.3 Confronto Piani Claude

| Piano | Prezzo | Prompts/5h | Limite Settimanale |
|-------|--------|------------|-------------------|
| Pro | $20/mese | 10-40 | 40-80h Sonnet |
| **Max 5x** | **$100/mese** | **50-200** | **140-280h Sonnet** |
| Max 20x | $200/mese | 200-800 | 240-480h Sonnet + 24-40h Opus |

### 2.4 Stima Costi Progetto

| Scenario | Costo | Tempo | Note |
|----------|-------|-------|------|
| Max 5x solo | $100 | 30 giorni | Richiede disciplina |
| Max 20x | $200 | 15-20 giorni | Doppia velocità |
| Max 5x + Extra | $300-400 | 20 giorni | Più flessibile |
| API Console | $400-600 | 10-15 giorni | Zero rate limits |

---

## 3. Piano Max 5x Ottimizzato

### 3.1 Architettura Semplificata

**DA 5 microservizi → 1 monolito modulare + 1 frontend**

```
┌─────────────────────────────────────────────────────┐
│                   CloudFront + ACM                   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│            EKS Cluster (Managed Node Group)          │
│  ┌──────────────────────────────────────────────┐   │
│  │          Frontend (Next.js SSR)              │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │ REST API                           │
│  ┌──────────────▼───────────────────────────────┐   │
│  │       API Backend (Node.js Monolith)         │   │
│  │  Moduli: catalog, auth, search, orders       │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                    │
│  ┌──────────────▼───────────────────────────────┐   │
│  │        RDS Aurora Serverless v2              │   │
│  └──────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────┐  │
│  │      ElastiCache Redis (cache + sessioni)     │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 3.2 Cosa Eliminiamo vs Manteniamo

**Eliminato:**
- 5 microservizi separati → 1 monolito modulare
- Strapi CMS → Admin API semplice
- Algolia → Ricerca in-memory/Redis
- Cognito → Auth JWT custom
- Stripe → Mock payment
- SQS → Funzionalità sincrona
- Multi-repo → Monorepo

**Mantenuto:**
- EKS + managed services (Aurora, Redis, S3, CloudFront)
- Terraform IaC completo
- Helm charts
- GitHub Actions CI/CD
- Full-stack TypeScript

### 3.3 Struttura Progetto

```
ecommerce-demo/
├── apps/
│   ├── frontend/              # Next.js 14 App Router
│   │   ├── src/
│   │   ├── public/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── backend/               # Node.js API (Fastify)
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
│       │   ├── network/
│       │   ├── eks/
│       │   ├── database/
│       │   ├── cache/
│       │   └── cdn/
│       └── environments/
│           └── demo/
│
├── helm/
│   ├── frontend/
│   └── backend/
│
├── .github/
│   └── workflows/
│       ├── frontend-ci-cd.yml
│       └── backend-ci-cd.yml
│
├── scripts/
├── docs/
├── package.json
├── docker-compose.yml
└── README.md
```

### 3.4 Calendario Sessioni (30 giorni)

#### Week 1: Infrastructure (6 sessioni)
| Giorno | Sessione | Contenuto |
|--------|----------|-----------|
| 1 Sera | 1 | Struttura base progetto |
| 2 Mattina | 2 | Terraform Network |
| 2 Sera | 3 | Terraform EKS |
| 3 Mattina | 4 | Terraform Database |
| 3 Sera | 5 | Terraform Cache + CDN |
| 4 Mattina | 6 | Terraform Environment Demo |

#### Week 2: Backend (7 sessioni)
| Giorno | Sessione | Contenuto |
|--------|----------|-----------|
| 5 | 7 | Backend Base Setup |
| 6 | 8 | Catalog Module |
| 7 | 9 | Auth Module |
| 8 | 10 | Search Module |
| 9 | 11 | Orders Module |
| 10 | 12 | Backend Tests |
| 11 | 13 | Backend Helm Chart |

#### Week 3: Frontend (6 sessioni)
| Giorno | Sessione | Contenuto |
|--------|----------|-----------|
| 12 | 14 | Frontend Base |
| 13 | 15 | React Components |
| 14 | 16 | API Client + State |
| 15 | 17 | Pages Implementation |
| 16 | 18 | Auth Frontend |
| 17 | 19 | Frontend Helm Chart |

#### Week 4: CI/CD + Polish (6 sessioni)
| Giorno | Sessione | Contenuto |
|--------|----------|-----------|
| 18 | 20 | Backend CI/CD |
| 19 | 21 | Frontend CI/CD |
| 20 | 22 | Scripts Automation |
| 21 | 23 | Docker Compose |
| 22 | 24 | Documentation |
| 23 | 25 | Review & Optimization |

#### Week 5: Buffer
- Giorni 24-30: Testing, fixes, deploy reale

---

## 4. Rate Limits e Vincoli

### 4.1 Limiti Max 5x

- **50-200 prompt** ogni 5 ore
- **140-280 ore Sonnet** per settimana
- Reset ogni **5 ore** dal primo messaggio
- Limiti **condivisi** tra chat web e Claude Code

### 4.2 Strategia Oraria

```
8:00  → Sessione mattina (2-3 ore intensive)
11:00 → STOP (rate limit)
16:00 → Sessione pomeriggio (reset, altre 2-3 ore)
19:00 → STOP

Lavoro manuale tra sessioni:
- Testa codice generato
- Prepara prompt successivo
- Setup ambiente AWS
```

### 4.3 Tips Ottimizzazione

**Prompt One-Shot (Efficiente):**
```
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

**Prompt Iterativi (Inefficiente):**
```
❌ MALE:
"Crea il backend"
"Aggiungi auth"
"Aggiungi logging"
"Aggiungi tests"
```

---

## 5. Guida Setup Iniziale

### 5.1 Prerequisiti

```bash
# Installa Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Verifica
claude-code --version
```

### 5.2 Creazione Progetto

```bash
mkdir ecommerce-demo
cd ecommerce-demo
git init
claude-code
```

### 5.3 Prompt Sessione 1 (Struttura Base)

```
Crea la struttura completa di un monorepo e-commerce demo per AWS EKS.

Struttura da generare:

ecommerce-demo/
├── apps/
│   ├── frontend/
│   │   ├── src/app/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── .env.example
│   └── backend/
│       ├── src/
│       │   ├── modules/ (catalog, auth, search, orders)
│       │   ├── config/
│       │   ├── middleware/
│       │   └── server.ts
│       ├── prisma/schema.prisma
│       ├── package.json
│       └── .env.example
├── infra/terraform/
│   ├── modules/ (network, eks, database, cache, cdn)
│   └── environments/demo/
├── helm/ (frontend, backend)
├── .github/workflows/
├── scripts/
├── docs/
├── package.json (workspace root)
├── docker-compose.yml
└── README.md

Requisiti:
1. npm workspaces configurato
2. .gitignore completo
3. README.md con Mermaid diagram
4. Prisma schema con User, Category, Product, Order, OrderItem
5. docker-compose.yml con PostgreSQL + Redis + Adminer

Genera TUTTI i file con contenuto completo.
```

### 5.4 Post-Generazione

```bash
# Installa dipendenze
npm install

# Fix vulnerabilità
npm audit fix

# Aggiorna Next.js
npm install next@latest --workspace=@ecommerce-demo/frontend

# Avvia Docker
docker-compose up -d

# Setup Prisma
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init

# Commit
git add .
git commit -m "chore: initial project structure"
```

---

## 6. Troubleshooting

### 6.1 Frontend Non Parte

**Problema:** `npm run dev` fallisce in apps/frontend

**Soluzione - Prompt Claude Code:**
```
Il frontend Next.js non parte. Quando eseguo "npm run dev --workspace=@ecommerce-demo/frontend" ottengo errore.

Fai queste cose:
1. DIAGNOSTICA: Controlla struttura apps/frontend/
2. FIX: Crea/correggi file mancanti (layout.tsx, page.tsx, globals.css)
3. VERIFICA: Esegui npm run dev e verifica che parta
4. TEST: Verifica http://localhost:3000

Procedi step by step.
```

### 6.2 Warning Husky Deprecato

```bash
# Rimuovi Husky
npm uninstall husky
npm pkg delete scripts.prepare
```

### 6.3 Vulnerabilità NPM

```bash
npm audit fix
# Se necessario:
npm audit fix --force
```

---

## 7. Prompt Presentazione C-Level

### 7.1 Contesto

- **Audience:** C-Level (CEO, CFO, CTO)
- **Focus:** Economics, ROI, adoption strategy
- **Formato:** Reveal.js (HTML)

### 7.2 Scenario Aziendale

- 70 sviluppatori, 65% esterni
- Team silos con comunicazione limitata
- Tool esistenti: AWS, GitHub, Jira, Confluence
- Problema: frammentazione, velocity ridotta

### 7.3 Prompt Completo

```
Genera una presentazione Reveal.js professionale per audience C-Level.

## CONTESTO PRESENTAZIONE

Titolo: "AI-Augmented Development: Da 70 Sviluppatori a Velocità 10x"
Sottotitolo: "Case Study E-commerce Demo - 5 Giorni con Claude Code"

## STRUTTURA SLIDES (15-18 slides)

### SEZIONE 1: EXECUTIVE SUMMARY (3 slides)

**Slide 1 - Cover**
**Slide 2 - The Challenge:** "Il Costo della Frammentazione"
- 70 sviluppatori, 65% esterni
- Team silos
- Risultato: velocity ridotta, technical debt

**Slide 3 - The Opportunity:**
- 5 giorni vs 8-12 settimane
- 1 persona vs team di 5-8

### SEZIONE 2: IL PROOF OF CONCEPT (4 slides)

**Slide 4 - Cosa Abbiamo Costruito**
- Diagramma architettura Mermaid
- Stack completo

**Slide 5 - Timeline Day by Day**

**Slide 6 - Quality Built-In**
- CVE Analysis contestualizzata
- Test generation automatica
- Claude Code come QA integrato

**Slide 7 - Confronto Effort**
| Aspetto | Tradizionale | Claude Code |
|---------|--------------|-------------|
| Timeline | 8-12 settimane | 5 giorni |
| Team | 5-8 persone | 1 persona |
| Test coverage | <50% | >80% |

### SEZIONE 3: ECONOMICS (3 slides)

**Slide 8 - Cost Analysis**
- Tradizionale: €180-220K
- AI-Augmented: €6K

**Slide 9 - Licensing Options**
| Opzione | Anthropic Direct | AWS Bedrock |
|---------|------------------|-------------|
| Billing | Nuovo vendor | AWS esistente |
| Procurement | Da validare | Già in essere |
| Qualità | Identica | Identica |

**Slide 10 - ROI Projection**
- ROI: 8-12x primo anno

### SEZIONE 4: ADOPTION STRATEGY (4 slides)

**Slide 11 - Current State**
✅ AWS, GitHub, Jira, Confluence
❌ Orchestrazione AI end-to-end

**Slide 12 - Integration Vision**
Claude Code + MCP → GitHub + Jira + Confluence

**Slide 13 - Adoption Roadmap**
- Fase 1 (Mese 1-2): 5-10 persone, €2K
- Fase 2 (Mese 3-4): 20-30 persone, €6K
- Fase 3 (Mese 5-6): Rollout, Bedrock

**Slide 14 - Team Enablement**
- AI potenzia, non sostituisce
- Ruoli evolvono verso enablement

### SEZIONE 5: CLOSING (2 slides)

**Slide 15 - Key Takeaways**
1. Speed: 10x faster
2. Quality: Security + Testing integrati
3. Economics: ROI 8-12x
4. Risk: Basso (AWS Bedrock)
5. Path: Roadmap chiara

**Slide 16 - Call to Action**
1. Approvazione budget Fase 1: €2.000
2. Identificazione early adopters
3. Setup AWS Bedrock

## REQUISITI TECNICI

- Reveal.js con CDN
- Tema scuro professionale
- Diagrammi Mermaid embedded
- Speaker notes incluse

Salva in: docs/presentation/index.html
```

### 7.4 Apertura Presentazione

```bash
# Apri nel browser
open docs/presentation/index.html

# Oppure con server locale
npx serve docs/presentation

# Export PDF: aggiungi ?print-pdf all'URL
```

---

## Appendice

### A. Comandi Utili

```bash
# Claude Code
claude-code                    # Avvia
npx @anthropic-ai/claude-code  # Alternativa

# NPM Workspaces
npm ls --workspaces
npm run dev --workspace=@ecommerce-demo/frontend
npm run dev --workspace=@ecommerce-demo/backend

# Docker
docker-compose up -d
docker-compose down
docker ps

# Prisma
npx prisma generate
npx prisma migrate dev --name <nome>
npx prisma studio

# Terraform
terraform init
terraform plan
terraform apply
```

### B. Link Utili

- [Claude Code Docs](https://docs.anthropic.com/claude-code)
- [AWS EKS](https://docs.aws.amazon.com/eks/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [Next.js 14](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)

---

## Nota

Questo documento rappresenta la **fase di planning** eseguita con Claude via interfaccia web. L'obiettivo era:

1. **Validare la fattibilità** del progetto con Claude Code
2. **Ottimizzare l'architettura** per i limiti di rate del piano Max 5x
3. **Pianificare le sessioni** in modo efficiente
4. **Preparare prompt efficaci** per massimizzare l'output

Il risultato finale ha superato le aspettative iniziali, completando il progetto in **10 sessioni** invece delle 25 pianificate.

---

*Documento generato: Gennaio 2025*
