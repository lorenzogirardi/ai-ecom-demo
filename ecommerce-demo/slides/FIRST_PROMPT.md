# FIRST PROMPT - Il Prompt Iniziale

> **Questo documento contiene il prompt originale fornito a Claude Code per avviare il progetto e-commerce demo.**

---

## Obiettivi e Requisiti

**Obiettivo:** E-commerce dimostrativo "end-to-end" (UI, BFF, backend servizi core, checkout), scalabile su AWS EKS e completamente automatizzato (IaC + CI/CD).

### Requisiti Funzionali

- Frontend + BFF in TypeScript/Node.js
- Backend servizi:
  - Prodotti e categorie
  - Ricerca
  - Autenticazione/login
  - Ordine/pagamento (mock o integrazione light)

### Requisiti Non Funzionali

- Solo managed service AWS per data plane (DB, cache, queue, ecc.)
- Multi-repo IaC con ownership chiara tra team piattaforma e team applicativi
- Tool terzi solo se free-tier o open source (CMS, PIM, search, checkout)

---

## Architettura Logica su AWS

### Layer Edge e Networking

| Componente | Descrizione |
|------------|-------------|
| **Route 53** | DNS pubblico del dominio demo |
| **Amazon CloudFront** | Origin su ALB o direttamente su ingress EKS per servire frontend e BFF, con HTTPS (ACM) |
| **AWS WAF** | (Opzionale per demo) Associato a CloudFront per protezione base |

### Compute e Orchestrazione (EKS)

| Componente | Descrizione |
|------------|-------------|
| **Amazon EKS** | Cluster managed per tutti i microservizi |
| **Managed Node Groups** | Suddivisi per tipo workload (frontend/BFF vs backend) |
| **Addon Gestiti** | CoreDNS, VPC CNI, kube-proxy |
| **Ingress Controller** | AWS Load Balancer Controller per esporre servizi HTTP/HTTPS tramite ALB |

### Servizi Applicativi (tutti in TypeScript/Node.js)

#### Frontend SPA/SSR + BFF (app "web-app")

- UI in React/Next.js (SSR/SSG) o simile, servita dal BFF
- BFF con API REST/GraphQL verso i microservizi interni (catalogo, auth, ordine)

#### Servizio "catalog-service"

- API per categorie, prodotti, dettagli prodotto
- Integrazione con CMS/PIM per contenuti e attributi

#### Servizio "search-service"

- Wrapper verso motore di ricerca (Algolia free tier o alternativa self-hosted)
- Ricerche full-text, filtro per categoria, ecc.

#### Servizio "auth-service"

- Gestione utenti demo (signup/login/logout, token JWT)
- Oppure delega ad Amazon Cognito user pool

#### Servizio "checkout-service"

- Creazione ordine, calcolo totale
- Integrazione con provider di pagamento in modalità test/sandbox

### Data Layer e Integrazioni Managed

| Servizio | Uso |
|----------|-----|
| **Amazon RDS Aurora Serverless v2** | Database transazionale (MySQL o PostgreSQL) per utenti, ordini, anagrafiche base prodotto |
| **Amazon ElastiCache for Redis** | Cache per sessioni BFF o caching delle query di catalogo/ricerca |
| **Amazon S3** | Storage oggetti per asset statici (immagini prodotto), log esportati, eventuale static build frontend |
| **Amazon SQS** | (Opzionale) Messaggistica per ordini asincroni (es. email conferma, webhook) |

---

## Tool Esterni Free / Low Cost

### CMS / PIM Free

**Opzione 1: Strapi Community Edition**
- Self-hosted in un namespace dedicato su EKS
- Esposto solo internamente ai servizi (catalog-service)
- Per gestire contenuti marketing, descrizioni estese e attributi custom

**Opzione 2: Hygraph o altri headless CMS**
- Con free tier, se si preferisce non hostare nulla
- Uso solo GraphQL SaaS

### Search

**Opzione 1: Algolia Build (free development tier)**
- Fino a 10.000 ricerche/mese e 1.000.000 record
- Sufficiente per una demo e integrazione semplice via SDK

**Opzione 2: Meilisearch (self-hosting)**
- Container su EKS
- Meno "managed" rispetto ad Algolia

### Login / Identity

**Opzione 1: Amazon Cognito**
- User pool, modalità free tier per pochi utenti e traffico demo
- Con hosted UI opzionale

**Opzione 2: Auth-service custom**
- In Node.js con JWT e storage in Aurora
- Accettando minore sicurezza enterprise (ok per demo)

### Pagamento / Checkout

**Opzione 1: Stripe**
- Uso in modalità test con chiavi di test
- Non genera costi reali e permette un checkout demo completo

**Opzione 2: Solo mock**
- Checkout-service che simula payment-provider senza chiamate esterne
- Utile se si vuole zero dipendenze SaaS

---

## Design IaC con Terraform

### Linee Guida Generali

Tutto su Terraform, ma con separazione netta:

| Repository | Gestito da | Contenuto |
|------------|------------|-----------|
| **Repo piattaforma** | Team core infra | Cluster EKS, add-on, networking, osservabilità di base, S3 bucket condivisi, IAM ruoli di base |
| **Repo applicativi** | Team app | Risorse AWS strettamente legate all'app (DB, Redis, code pipeline IAM, secret, SQS, Algolia keys in Secret Manager, ecc.) |

### Struttura Repo Piattaforma

```
platform-infra/
├── modules/
│   ├── network/           # VPC, subnet pubbliche/private, route table, NAT gateway
│   ├── eks/               # Cluster EKS, node groups, IRSA, CloudWatch logging base
│   ├── edge/              # Route 53, ACM certificate, CloudFront, WAF opzionale
│   └── observability/     # CloudWatch log group, metric filter base
└── environments/
    ├── dev/
    └── demo/              # Variabili per dimensionamento ridotto
```

### Struttura Repo Applicativo (per dominio)

Per ogni dominio (es. web-app/BFF, catalog-service, checkout-service):

```
app-repo/
├── infra/terraform/
│   ├── db/                # Aurora cluster + subnet group + security group
│   ├── cache/             # ElastiCache Redis cluster
│   ├── queues/            # SQS code per gestione eventi ordine
│   ├── secrets/           # AWS Secrets Manager
│   └── eks-integration/   # IAM roles for service accounts
├── helm/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
│   └── values-demo.yaml
└── .github/workflows/     # Template GitHub Actions per CI/CD
```

---

## Pipeline CI/CD con GitHub Actions e Helm

### Flusso Generale

**Triggers:** Push/PR su branch main o feature per ogni servizio

### Jobs tipici per app Node.js/TypeScript

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│ build-and-test  │ ──► │ docker-build-and-push│ ──► │ helm-deploy │
└─────────────────┘     └──────────────────────┘     └─────────────┘
```

| Job | Attività |
|-----|----------|
| **build-and-test** | Installazione dipendenze, lint, test unitari, build TypeScript |
| **docker-build-and-push** | Build immagine Docker, push verso Amazon ECR (autenticazione OIDC GitHub → AWS IAM role) |
| **helm-deploy** | `helm upgrade --install` verso cluster EKS, con kubeconfig via `aws eks update-kubeconfig` |

### Design Chart Helm

Per ogni microservizio:

- **Deployment/ReplicaSet**, Service, HPA (opzionale per demo)
- **ConfigMap**, Secret (con referenze a Secrets Manager tramite CSI driver)
- **Ingress resource** per BFF/servizi esposti, con annotation per AWS Load Balancer Controller

Pattern:
- `values-dev.yaml`, `values-demo.yaml` per dimensionamento e URL diversi
- Reuse di template per label standard, probes, risorse

---

## Design Applicativo in TypeScript/Node.js

### Frontend + BFF

**Stack consigliato:** Next.js in TypeScript per la UI, integrato in un app Node.js che funge da BFF

**Responsabilità BFF:**
- Orchestrare chiamate ai servizi interni (catalog, search, auth, checkout)
- Gestire sessione (cookie + JWT Cognito o token custom)
- Implementare logica di layout e adattamento dati per la UI

### Microservizi Backend

**Tech:** Node.js + TypeScript + framework leggero (Express, Fastify o NestJS)

| Servizio | Responsabilità |
|----------|----------------|
| **catalog-service** | CRUD categorie/prodotti su Aurora, endpoint listing/dettaglio, collegamento a Strapi, sync verso Algolia |
| **search-service** | API /search che chiama Algolia (o motore interno), mapping query → indice |
| **auth-service** | Se Cognito: BFF delega login, riceve token. Se custom: /login, /register, /me con JWT |
| **checkout-service** | Crea ordine in Aurora, calcola totale, chiama Stripe test API (o mock) |

### Modello Dati Minimo

#### Tabelle in Aurora

```sql
-- Utenti
users: id, email, password_hash (se custom), metadata

-- Catalogo
categories: id, name, slug
products: id, category_id, name, sku, price, stock, image_url, description_short

-- Ordini
orders: id, user_id, status, total_amount, created_at
order_items: id, order_id, product_id, quantity, unit_price
```

#### Indici Algolia

```
Indice "products":
- id, name, category, price, image_url, description_short
- Attributi extra da Strapi
```

---

## Nota

Questo prompt è stato il punto di partenza per lo sviluppo del progetto e-commerce demo. Durante le 10 sessioni di sviluppo, alcune scelte architetturali sono state semplificate o adattate:

| Prompt Originale | Implementazione Finale |
|------------------|------------------------|
| Multi-repo | Monorepo per semplicità demo |
| Strapi CMS | Rimosso (non necessario per demo) |
| Algolia | Ricerca implementata direttamente con PostgreSQL |
| Cognito | Auth custom con JWT (più didattico) |
| Stripe | Mock checkout (zero dipendenze esterne) |

---

*Documento originale: Dicembre 2025*
