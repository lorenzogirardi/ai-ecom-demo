# FIRST PROMPT - The Initial Prompt

> **This document contains the original prompt provided to Claude Code to start the e-commerce demo project.**

---

## Objectives and Requirements

**Objective:** End-to-end demo e-commerce (UI, BFF, backend core services, checkout), scalable on AWS EKS and fully automated (IaC + CI/CD).

### Functional Requirements

- Frontend + BFF in TypeScript/Node.js
- Backend services:
  - Products and categories
  - Search
  - Authentication/login
  - Order/payment (mock or light integration)

### Non-Functional Requirements

- AWS managed services only for data plane (DB, cache, queue, etc.)
- Multi-repo IaC with clear ownership between platform team and application teams
- Third-party tools only if free-tier or open source (CMS, PIM, search, checkout)

---

## Logical Architecture on AWS

### Edge Layer and Networking

| Component | Description |
|-----------|-------------|
| **Route 53** | Public DNS for demo domain |
| **Amazon CloudFront** | Origin on ALB or directly on EKS ingress to serve frontend and BFF, with HTTPS (ACM) |
| **AWS WAF** | (Optional for demo) Associated with CloudFront for basic protection |

### Compute and Orchestration (EKS)

| Component | Description |
|-----------|-------------|
| **Amazon EKS** | Managed cluster for all microservices |
| **Managed Node Groups** | Divided by workload type (frontend/BFF vs backend) |
| **Managed Addons** | CoreDNS, VPC CNI, kube-proxy |
| **Ingress Controller** | AWS Load Balancer Controller to expose HTTP/HTTPS services via ALB |

### Application Services (all in TypeScript/Node.js)

#### Frontend SPA/SSR + BFF ("web-app")

- UI in React/Next.js (SSR/SSG) or similar, served by BFF
- BFF with REST/GraphQL API towards internal microservices (catalog, auth, order)

#### "catalog-service"

- API for categories, products, product details
- Integration with CMS/PIM for content and attributes

#### "search-service"

- Wrapper to search engine (Algolia free tier or self-hosted alternative)
- Full-text search, category filter, etc.

#### "auth-service"

- Demo user management (signup/login/logout, JWT token)
- Or delegation to Amazon Cognito user pool

#### "checkout-service"

- Order creation, total calculation
- Integration with payment provider in test/sandbox mode

### Data Layer and Managed Integrations

| Service | Use |
|---------|-----|
| **Amazon RDS Aurora Serverless v2** | Transactional database (MySQL or PostgreSQL) for users, orders, base product data |
| **Amazon ElastiCache for Redis** | Cache for BFF sessions or catalog/search query caching |
| **Amazon S3** | Object storage for static assets (product images), exported logs, optional frontend static build |
| **Amazon SQS** | (Optional) Messaging for async orders (e.g., confirmation email, webhook) |

---

## Free / Low Cost External Tools

### Free CMS / PIM

**Option 1: Strapi Community Edition**
- Self-hosted in a dedicated namespace on EKS
- Exposed only internally to services (catalog-service)
- To manage marketing content, extended descriptions and custom attributes

**Option 2: Hygraph or other headless CMS**
- With free tier, if you prefer not to host anything
- GraphQL SaaS only

### Search

**Option 1: Algolia Build (free development tier)**
- Up to 10,000 searches/month and 1,000,000 records
- Sufficient for a demo and simple integration via SDK

**Option 2: Meilisearch (self-hosting)**
- Container on EKS
- Less "managed" compared to Algolia

### Login / Identity

**Option 1: Amazon Cognito**
- User pool, free tier mode for few users and demo traffic
- With optional hosted UI

**Option 2: Custom auth-service**
- In Node.js with JWT and Aurora storage
- Accepting lower enterprise security (ok for demo)

### Payment / Checkout

**Option 1: Stripe**
- Use in test mode with test keys
- No real costs and allows a complete demo checkout

**Option 2: Mock only**
- Checkout-service that simulates payment-provider without external calls
- Useful if you want zero SaaS dependencies

---

## IaC Design with Terraform

### General Guidelines

Everything on Terraform, but with clear separation:

| Repository | Managed by | Content |
|------------|------------|---------|
| **Platform repo** | Core infra team | EKS cluster, add-ons, networking, base observability, shared S3 buckets, base IAM roles |
| **Application repos** | App team | AWS resources closely tied to the app (DB, Redis, code pipeline IAM, secret, SQS, Algolia keys in Secret Manager, etc.) |

### Platform Repo Structure

```
platform-infra/
├── modules/
│   ├── network/           # VPC, public/private subnets, route table, NAT gateway
│   ├── eks/               # EKS cluster, node groups, IRSA, CloudWatch base logging
│   ├── edge/              # Route 53, ACM certificate, CloudFront, optional WAF
│   └── observability/     # CloudWatch log group, base metric filter
└── environments/
    ├── dev/
    └── demo/              # Variables for reduced sizing
```

### Application Repo Structure (per domain)

For each domain (e.g., web-app/BFF, catalog-service, checkout-service):

```
app-repo/
├── infra/terraform/
│   ├── db/                # Aurora cluster + subnet group + security group
│   ├── cache/             # ElastiCache Redis cluster
│   ├── queues/            # SQS queues for order event handling
│   ├── secrets/           # AWS Secrets Manager
│   └── eks-integration/   # IAM roles for service accounts
├── helm/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
│   └── values-demo.yaml
└── .github/workflows/     # GitHub Actions CI/CD templates
```

---

## CI/CD Pipeline with GitHub Actions and Helm

### General Flow

**Triggers:** Push/PR on main or feature branch for each service

### Typical Jobs for Node.js/TypeScript App

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│ build-and-test  │ ──► │ docker-build-and-push│ ──► │ helm-deploy │
└─────────────────┘     └──────────────────────┘     └─────────────┘
```

| Job | Activities |
|-----|------------|
| **build-and-test** | Install dependencies, lint, unit tests, TypeScript build |
| **docker-build-and-push** | Build Docker image, push to Amazon ECR (OIDC GitHub → AWS IAM role authentication) |
| **helm-deploy** | `helm upgrade --install` to EKS cluster, with kubeconfig via `aws eks update-kubeconfig` |

### Helm Chart Design

For each microservice:

- **Deployment/ReplicaSet**, Service, HPA (optional for demo)
- **ConfigMap**, Secret (with references to Secrets Manager via CSI driver)
- **Ingress resource** for BFF/exposed services, with annotations for AWS Load Balancer Controller

Pattern:
- `values-dev.yaml`, `values-demo.yaml` for different sizing and URLs
- Template reuse for standard labels, probes, resources

---

## Application Design in TypeScript/Node.js

### Frontend + BFF

**Recommended stack:** Next.js in TypeScript for UI, integrated in a Node.js app acting as BFF

**BFF Responsibilities:**
- Orchestrate calls to internal services (catalog, search, auth, checkout)
- Manage session (cookie + Cognito JWT or custom token)
- Implement layout logic and data adaptation for UI

### Backend Microservices

**Tech:** Node.js + TypeScript + lightweight framework (Express, Fastify or NestJS)

| Service | Responsibilities |
|---------|------------------|
| **catalog-service** | Categories/products CRUD on Aurora, listing/detail endpoints, Strapi connection, Algolia sync |
| **search-service** | /search API calling Algolia (or internal engine), query → index mapping |
| **auth-service** | If Cognito: BFF delegates login, receives token. If custom: /login, /register, /me with JWT |
| **checkout-service** | Create order in Aurora, calculate total, call Stripe test API (or mock) |

### Minimum Data Model

#### Aurora Tables

```sql
-- Users
users: id, email, password_hash (if custom), metadata

-- Catalog
categories: id, name, slug
products: id, category_id, name, sku, price, stock, image_url, description_short

-- Orders
orders: id, user_id, status, total_amount, created_at
order_items: id, order_id, product_id, quantity, unit_price
```

#### Algolia Indexes

```
Index "products":
- id, name, category, price, image_url, description_short
- Extra attributes from Strapi
```

---

## Note

This prompt was the starting point for the e-commerce demo project development. During the 10 development sessions, some architectural choices were simplified or adapted:

| Original Prompt | Final Implementation |
|-----------------|----------------------|
| Multi-repo | Monorepo for demo simplicity |
| Strapi CMS | Removed (not necessary for demo) |
| Algolia | Search implemented directly with PostgreSQL |
| Cognito | Custom auth with JWT (more educational) |
| Stripe | Mock checkout (zero external dependencies) |

---

*Original document: December 2025*
