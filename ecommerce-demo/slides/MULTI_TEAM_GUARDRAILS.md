# Multi-Team Guardrails con Claude Code

Guida completa per implementare guardrails in un contesto enterprise multi-repo con Claude Code.

---

## Contesto Organizzativo

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION STRUCTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │ Platform Team   │  Gestisce: VPC, EKS, RDS, Security        │
│  │ (3-5 engineers) │  Responsabilità: Uptime, Compliance       │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ DevOps Team     │  Gestisce: CI/CD, Helm, Monitoring        │
│  │ (2-4 engineers) │  Supporta: Tutti i team applicativi       │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────┐        │
│  │              Application Teams                       │        │
│  ├─────────────────┬─────────────────┬─────────────────┤        │
│  │ Team Catalog    │ Team Orders     │ Team Payments   │        │
│  │ (4 devs)        │ (4 devs)        │ (3 devs)        │        │
│  └─────────────────┴─────────────────┴─────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architettura Multi-Repo

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB ORGANIZATION                           │
│                    github.com/acme-corp/                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PLATFORM REPOS (Private - Solo Platform Team)                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ platform-infrastructure          🔒 RESTRICTED      │        │
│  │ ├── terraform/                                      │        │
│  │ │   ├── bootstrap/     (S3, DynamoDB, OIDC)        │        │
│  │ │   ├── network/       (VPC, Subnets, NAT)         │        │
│  │ │   ├── eks/           (Cluster, Node Groups)      │        │
│  │ │   ├── security/      (IAM, Security Groups)      │        │
│  │ │   └── shared/        (RDS, ElastiCache, ECR)     │        │
│  │ ├── CLAUDE.md                                       │        │
│  │ └── CODEOWNERS                                      │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ platform-modules                 🔒 RESTRICTED      │        │
│  │ ├── modules/                                        │        │
│  │ │   ├── eks-namespace/   (namespace + RBAC)        │        │
│  │ │   ├── app-database/    (RDS schema + user)       │        │
│  │ │   ├── app-cache/       (Redis namespace)         │        │
│  │ │   └── app-secrets/     (Secrets Manager path)    │        │
│  │ └── CLAUDE.md                                       │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  DEVOPS REPOS (Internal - DevOps + Platform Read)               │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ shared-helm-charts              📦 INTERNAL         │        │
│  │ ├── charts/                                         │        │
│  │ │   ├── base-app/        (template applicazione)   │        │
│  │ │   ├── base-worker/     (template worker)         │        │
│  │ │   └── base-cronjob/    (template cronjob)        │        │
│  │ └── CLAUDE.md                                       │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ shared-pipelines                📦 INTERNAL         │        │
│  │ ├── .github/workflows/                              │        │
│  │ │   ├── build-push.yml   (reusable build)          │        │
│  │ │   ├── deploy-app.yml   (reusable deploy)         │        │
│  │ │   └── security-scan.yml                          │        │
│  │ └── CLAUDE.md                                       │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  APPLICATION REPOS (Per Team - Full Access proprio repo)        │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ catalog-service                 ✅ Team Catalog     │        │
│  │ ├── src/                        (codice app)        │        │
│  │ ├── helm/                       (solo values)       │        │
│  │ ├── infra/                      (solo app-scoped)   │        │
│  │ ├── CLAUDE.md                                       │        │
│  │ └── .github/workflows/          (usa shared)        │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ orders-service                  ✅ Team Orders      │        │
│  │ payments-service                ✅ Team Payments    │        │
│  │ ...                                                 │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. CLAUDE.md per Ogni Repo

### platform-infrastructure/CLAUDE.md

```markdown
# Platform Infrastructure - CLAUDE.md

## Repository Overview

Questo repository contiene l'infrastruttura core AWS gestita dal Platform Team.

**Team Owner:** Platform Team
**Criticità:** ALTA - Downtime impatta tutti i servizi
**Change Frequency:** Bassa (settimanale/mensile)

---

## Chi Può Modificare

| Ruolo | Permessi |
|-------|----------|
| Platform Team | Full access |
| DevOps Team | Read-only |
| Developers | Nessun accesso |

---

## Struttura Repository

| Directory | Layer | Descrizione |
|-----------|-------|-------------|
| `terraform/bootstrap/` | Layer 0 | State backend, OIDC - Modificare SOLO per setup iniziale |
| `terraform/network/` | Layer 1 | VPC, Subnets - Modifiche richiedono maintenance window |
| `terraform/eks/` | Layer 1 | Cluster Kubernetes - ⚠️ UPGRADE = POSSIBILE DOWNTIME |
| `terraform/security/` | Layer 1 | IAM, Security Groups - Richiede Security Review |
| `terraform/shared/` | Layer 2 | RDS, ElastiCache, ECR - Impatta tutti i team applicativi |

---

## Regole Critiche per Claude Code

### ❌ NON FARE MAI

1. **EKS Upgrade** senza runbook approvato
   - Upgrade richiede maintenance window
   - Seguire docs/RUNBOOKS/eks-upgrade.md

2. **Modificare Security Groups** senza security review
   - Ogni SG change richiede approval da Security Team

3. **Cambiare VPC CIDR o Subnet allocation**
   - Impatta networking di tutti i servizi
   - Richiede re-provisioning completo

4. **Modificare IAM Policies** production senza audit
   - Principle of least privilege
   - Ogni change loggato in CloudTrail

5. **Terraform destroy** su risorse production
   - Mai usare `destroy` senza approval esplicito
   - Usare `terraform state rm` se necessario rimuovere

### ⚠️ ATTENZIONE

1. **RDS/ElastiCache changes** possono causare restart
   - Verificare `apply_immediately` = false
   - Schedulare in maintenance window

2. **Node Group updates** causano rolling restart
   - Verificare PodDisruptionBudget dei team
   - Comunicare a tutti i team prima

### ✅ SAFE OPERATIONS

1. Aggiungere nuovi tag
2. Aumentare capacità (scale up)
3. Aggiungere nuovi ECR repositories
4. Creare nuovi Secrets Manager paths

---

## Workflow per Modifiche

```
1. Crea branch: platform/TICKET-123-description
2. Fai modifiche con Claude Code
3. terraform plan > plan.txt
4. Crea PR con plan.txt allegato
5. Review da 2 Platform Engineers
6. Se impatta altri team → notifica in #platform-changes
7. Merge solo in maintenance window (se critico)
8. Apply con monitoring attivo
```

---

## Comandi Terraform

```bash
# Init (primo setup)
cd terraform/network
terraform init -backend-config=backend.hcl

# Plan (SEMPRE prima di apply)
terraform plan -out=plan.tfplan

# Apply (solo dopo review)
terraform apply plan.tfplan

# NEVER DO THIS:
# terraform destroy  ← BLOCKED by policy
# terraform apply -auto-approve  ← BLOCKED
```

---

## Risorse Gestite

| Risorsa | Terraform Path | Criticità |
|---------|----------------|-----------|
| VPC | network/vpc.tf | CRITICA |
| EKS Cluster | eks/cluster.tf | CRITICA |
| Node Groups | eks/nodes.tf | ALTA |
| RDS Cluster | shared/rds.tf | ALTA |
| ElastiCache | shared/redis.tf | MEDIA |
| ECR Repos | shared/ecr.tf | BASSA |

---

## Contatti Emergenza

- Platform On-Call: #platform-oncall
- Escalation: platform-lead@company.com
```

---

### catalog-service/CLAUDE.md (Application Repo)

```markdown
# Catalog Service - CLAUDE.md

## Repository Overview

Microservizio per la gestione del catalogo prodotti.

**Team Owner:** Team Catalog
**Criticità:** MEDIA
**Dependencies:** RDS (read), Redis (cache), S3 (images)

---

## Chi Può Modificare

| Ruolo | Permessi |
|-------|----------|
| Team Catalog | Full access |
| DevOps Team | CI/CD, Helm review |
| Platform Team | Read-only |

---

## Struttura Repository

| Directory | Contenuto | Note |
|-----------|-----------|------|
| `src/` | controllers/, services/, repositories/, tests/ | ✅ Codice applicazione - Full access |
| `helm/` | values.yaml, values-dev.yaml, values-staging.yaml, values-prod.yaml | ✅ Values per deploy (prod richiede review) |
| `infra/terraform/` | main.tf, variables.tf | ⚠️ LIMITATO - Solo moduli platform |
| `.github/workflows/` | ci-cd.yml | Usa shared-pipelines |
| `CLAUDE.md` | Questo file | Contesto per Claude Code |

---

## Regole per Claude Code

### ✅ PUOI FARE

1. **Modificare src/**
   - Tutto il codice applicativo
   - Tests
   - Configurazioni app

2. **Modificare helm/values*.yaml**
   - Replica count
   - Resource requests/limits
   - Environment variables
   - ConfigMaps

3. **Modificare infra/terraform/** usando SOLO moduli approvati
   ```hcl
   # ✅ ALLOWED - Usa modulo platform
   module "catalog_namespace" {
     source = "git::https://github.com/acme-corp/platform-modules//eks-namespace"
     name   = "catalog"
     team   = "catalog"
   }

   module "catalog_database" {
     source = "git::https://github.com/acme-corp/platform-modules//app-database"
     name   = "catalog"
     # Solo parametri esposti dal modulo
   }
   ```

### ❌ NON PUOI FARE

1. **Creare risorse AWS direttamente**
   ```hcl
   # ❌ BLOCKED - Non usare aws provider direttamente
   resource "aws_rds_cluster" "catalog" { }
   resource "aws_security_group" "catalog" { }
   resource "aws_iam_role" "catalog" { }
   ```

2. **Modificare risorse di altri team**
   ```hcl
   # ❌ BLOCKED - Namespace non tuo
   resource "kubernetes_config_map" "orders_config" {
     metadata {
       namespace = "orders"  # NON TUO
     }
   }
   ```

3. **Bypassare i moduli platform**
   - Tutti i setup infra devono usare platform-modules
   - Se serve qualcosa non coperto → ticket a Platform Team

### ⚠️ RICHIEDE REVIEW

1. **Modifiche a values-prod.yaml**
   - Richiede approval DevOps
   - Label PR con `production`

2. **Nuove dipendenze infra**
   - Nuovo database? → ticket Platform
   - Nuova cache? → ticket Platform
   - Nuovo secret? → usa app-secrets module

---

## Come Richiedere Risorse Infra

Se hai bisogno di qualcosa non coperto dai moduli:

1. Apri issue in `platform-infrastructure`
2. Template: `.github/ISSUE_TEMPLATE/infra-request.md`
3. SLA: 3-5 giorni lavorativi
4. Platform Team creerà il modulo o la risorsa

---

## Workflow CI/CD

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  build:
    uses: acme-corp/shared-pipelines/.github/workflows/build-push.yml@v1
    with:
      app_name: catalog-service

  deploy-dev:
    needs: build
    if: github.ref == 'refs/heads/develop'
    uses: acme-corp/shared-pipelines/.github/workflows/deploy-app.yml@v1
    with:
      environment: dev
      app_name: catalog-service

  deploy-prod:
    needs: build
    if: github.ref == 'refs/heads/main'
    uses: acme-corp/shared-pipelines/.github/workflows/deploy-app.yml@v1
    with:
      environment: prod
      app_name: catalog-service
    # Richiede approval manuale per prod
```

---

## Comandi Locali

```bash
# Development
npm install
npm run dev
npm run test

# Docker
docker build -t catalog-service .
docker run -p 3000:3000 catalog-service

# Helm (solo preview, deploy via CI)
helm template catalog ./helm -f ./helm/values-dev.yaml
```

---

## Dipendenze Esterne

| Servizio | Owner | Come Richiedere Modifiche |
|----------|-------|---------------------------|
| PostgreSQL | Platform | Ticket infra-request |
| Redis | Platform | Ticket infra-request |
| S3 Bucket | Platform | Ticket infra-request |
| Secrets | Platform | Usa module app-secrets |
```

---

## 2. CODEOWNERS per Repo

### platform-infrastructure/.github/CODEOWNERS

```
# Platform Infrastructure - CODEOWNERS
# Solo Platform Team può approvare modifiche

# Default: Platform Team owns everything
*                           @acme-corp/platform-team

# Critical paths require 2 reviewers
/terraform/eks/             @acme-corp/platform-leads
/terraform/security/        @acme-corp/platform-leads @acme-corp/security-team
/terraform/network/         @acme-corp/platform-leads

# Bootstrap is super restricted
/terraform/bootstrap/       @acme-corp/platform-leads
```

### catalog-service/.github/CODEOWNERS

```
# Catalog Service - CODEOWNERS

# Default: Team Catalog owns the code
*                           @acme-corp/team-catalog

# Infra changes need DevOps review
/infra/                     @acme-corp/team-catalog @acme-corp/devops-team

# Production Helm values need DevOps
/helm/values-prod.yaml      @acme-corp/devops-team

# CI/CD changes need DevOps
/.github/workflows/         @acme-corp/devops-team
```

---

## 3. IAM Isolation

### Struttura IAM Roles

```
┌─────────────────────────────────────────────────────────────────┐
│                    AWS IAM STRUCTURE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GitHub OIDC Provider                                           │
│  └── arn:aws:iam::ACCOUNT:oidc-provider/token.actions...       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ PlatformDeployRole                                   │        │
│  │ Trust: repo:acme-corp/platform-infrastructure:*     │        │
│  │ Permissions:                                         │        │
│  │   ✅ Full AWS access (AdministratorAccess)          │        │
│  │   ✅ Terraform state: platform/*                    │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ DevOpsDeployRole                                     │        │
│  │ Trust: repo:acme-corp/shared-*:*                    │        │
│  │ Permissions:                                         │        │
│  │   ✅ ECR push/pull                                  │        │
│  │   ✅ EKS deploy                                     │        │
│  │   ✅ Secrets Manager read                           │        │
│  │   ❌ VPC, RDS, EKS cluster modify                   │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ AppDeployRole-Catalog                                │        │
│  │ Trust: repo:acme-corp/catalog-service:*             │        │
│  │ Permissions:                                         │        │
│  │   ✅ ECR push: catalog-service repo only            │        │
│  │   ✅ EKS deploy: namespace catalog only             │        │
│  │   ✅ Secrets read: /catalog/* only                  │        │
│  │   ❌ Other namespaces                               │        │
│  │   ❌ Platform resources                             │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ AppDeployRole-Orders                                 │        │
│  │ Trust: repo:acme-corp/orders-service:*              │        │
│  │ Permissions: (same pattern, orders namespace)       │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Terraform per IAM Roles (in platform-infrastructure)

```hcl
# terraform/security/github-oidc.tf

# OIDC Provider (già esistente)
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# Platform Role - Full Access
resource "aws_iam_role" "platform_deploy" {
  name = "github-platform-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = data.aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:acme-corp/platform-infrastructure:*"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "platform_admin" {
  role       = aws_iam_role.platform_deploy.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

# App Role - Scoped per namespace
resource "aws_iam_role" "app_deploy" {
  for_each = toset(["catalog", "orders", "payments"])

  name = "github-${each.key}-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = data.aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:acme-corp/${each.key}-service:*"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "app_deploy_policy" {
  for_each = toset(["catalog", "orders", "payments"])

  name = "${each.key}-deploy-policy"
  role = aws_iam_role.app_deploy[each.key].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # ECR - Solo proprio repository
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = "arn:aws:ecr:*:*:repository/${each.key}-service"
      },
      # EKS - Accesso al cluster
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster"
        ]
        Resource = "*"
      },
      # Secrets Manager - Solo proprio path
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:/${each.key}/*"
      },
      # DENY esplicito su risorse platform
      {
        Effect   = "Deny"
        Action   = "*"
        Resource = [
          "arn:aws:rds:*:*:cluster:*",
          "arn:aws:elasticache:*:*:*",
          "arn:aws:ec2:*:*:vpc/*",
          "arn:aws:ec2:*:*:subnet/*",
          "arn:aws:eks:*:*:cluster/*"  # No modify cluster
        ]
      }
    ]
  })
}
```

### Kubernetes RBAC (in platform-infrastructure)

```yaml
# terraform/eks/rbac/app-team-rbac.yaml.tpl
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ${team}-deployer
  namespace: ${team}
rules:
  - apiGroups: ["", "apps", "batch"]
    resources: ["deployments", "services", "configmaps", "secrets", "pods", "jobs", "cronjobs"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["networking.k8s.io"]
    resources: ["ingresses"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["autoscaling"]
    resources: ["horizontalpodautoscalers"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ${team}-deployer-binding
  namespace: ${team}
subjects:
  - kind: User
    name: github-${team}-deploy  # Mappato da IAM Role
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: ${team}-deployer
  apiGroup: rbac.authorization.k8s.io
```

---

## 4. CI/CD Gates

### shared-pipelines/.github/workflows/deploy-app.yml

```yaml
name: Deploy Application

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      app_name:
        required: true
        type: string
      helm_values_file:
        required: false
        type: string
        default: ''

jobs:
  validate:
    runs-on: ubuntu-latest
    outputs:
      namespace: ${{ steps.validate.outputs.namespace }}
      role_arn: ${{ steps.validate.outputs.role_arn }}
    steps:
      - name: Validate app ownership
        id: validate
        run: |
          # Estrai team dal nome repo
          REPO="${{ github.repository }}"
          APP_NAME="${{ inputs.app_name }}"

          # Mappa repo → namespace permesso
          case "$REPO" in
            "acme-corp/catalog-service")
              ALLOWED_NS="catalog"
              ROLE_ARN="arn:aws:iam::ACCOUNT:role/github-catalog-deploy"
              ;;
            "acme-corp/orders-service")
              ALLOWED_NS="orders"
              ROLE_ARN="arn:aws:iam::ACCOUNT:role/github-orders-deploy"
              ;;
            "acme-corp/payments-service")
              ALLOWED_NS="payments"
              ROLE_ARN="arn:aws:iam::ACCOUNT:role/github-payments-deploy"
              ;;
            *)
              echo "❌ Repository non autorizzato per deploy"
              exit 1
              ;;
          esac

          echo "namespace=$ALLOWED_NS" >> $GITHUB_OUTPUT
          echo "role_arn=$ROLE_ARN" >> $GITHUB_OUTPUT
          echo "✅ Autorizzato deploy in namespace: $ALLOWED_NS"

  security-gate:
    runs-on: ubuntu-latest
    needs: validate
    if: inputs.environment == 'prod'
    environment: production  # Richiede approval manuale
    steps:
      - run: echo "Production deployment approved"

  deploy:
    runs-on: ubuntu-latest
    needs: [validate, security-gate]
    if: always() && needs.validate.result == 'success' && (needs.security-gate.result == 'success' || inputs.environment != 'prod')
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ needs.validate.outputs.role_arn }}
          aws-region: us-east-1

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --name ecommerce-cluster

      - name: Validate namespace access
        run: |
          NAMESPACE="${{ needs.validate.outputs.namespace }}"

          # Test che possiamo accedere solo al nostro namespace
          if kubectl auth can-i create deployments -n $NAMESPACE; then
            echo "✅ Accesso a $NAMESPACE confermato"
          else
            echo "❌ Nessun accesso a $NAMESPACE"
            exit 1
          fi

          # Verifica che NON possiamo accedere ad altri namespace
          if kubectl auth can-i create deployments -n kube-system 2>/dev/null; then
            echo "❌ ERRORE: Accesso a kube-system non dovrebbe essere permesso"
            exit 1
          fi

      - name: Deploy with Helm
        run: |
          NAMESPACE="${{ needs.validate.outputs.namespace }}"
          VALUES_FILE="${{ inputs.helm_values_file || format('values-{0}.yaml', inputs.environment) }}"

          helm upgrade --install ${{ inputs.app_name }} ./helm \
            --namespace $NAMESPACE \
            --values ./helm/$VALUES_FILE \
            --wait \
            --timeout 5m

      - name: Verify deployment
        run: |
          NAMESPACE="${{ needs.validate.outputs.namespace }}"
          kubectl rollout status deployment/${{ inputs.app_name }} -n $NAMESPACE
```

### Terraform State Isolation (S3 Policies)

```hcl
# In platform-infrastructure/terraform/bootstrap/s3-policies.tf

resource "aws_s3_bucket_policy" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # Platform team - accesso completo
      {
        Sid    = "PlatformFullAccess"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.platform_deploy.arn
        }
        Action   = "s3:*"
        Resource = [
          "${aws_s3_bucket.terraform_state.arn}",
          "${aws_s3_bucket.terraform_state.arn}/*"
        ]
      },
      # App teams - DENY su state platform
      {
        Sid    = "DenyAppAccessToPlatformState"
        Effect = "Deny"
        Principal = {
          AWS = [for role in aws_iam_role.app_deploy : role.arn]
        }
        Action = "s3:*"
        Resource = [
          "${aws_s3_bucket.terraform_state.arn}/platform/*",
          "${aws_s3_bucket.terraform_state.arn}/shared/*"
        ]
      },
      # App teams - accesso solo a proprio state
      {
        Sid    = "AppAccessOwnState"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.app_deploy["catalog"].arn
        }
        Action = ["s3:GetObject", "s3:PutObject"]
        Resource = "${aws_s3_bucket.terraform_state.arn}/apps/catalog/*"
      }
      # ... repeat per ogni team
    ]
  })
}
```

---

## 5. Flusso Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW EXAMPLES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SCENARIO 1: Developer modifica codice app                      │
│  ─────────────────────────────────────────                      │
│  1. Dev apre catalog-service in Claude Code                     │
│  2. Claude legge CLAUDE.md → conosce limiti                     │
│  3. Dev: "aggiungi nuovo endpoint /products/featured"           │
│  4. Claude modifica src/ → ✅ PERMESSO                          │
│  5. PR → CI → Deploy dev → ✅ SUCCESS                           │
│                                                                  │
│                                                                  │
│  SCENARIO 2: Developer prova a modificare infra platform        │
│  ─────────────────────────────────────────────────────          │
│  1. Dev apre catalog-service in Claude Code                     │
│  2. Dev: "aumenta CPU del database RDS"                         │
│  3. Claude legge CLAUDE.md → vede limite                        │
│  4. Claude risponde:                                            │
│     "❌ Non posso modificare RDS direttamente.                  │
│      RDS è gestito da Platform Team.                            │
│      Apri ticket: github.com/acme-corp/platform-infrastructure  │
│      Template: infra-request.md"                                │
│                                                                  │
│                                                                  │
│  SCENARIO 3: Developer prova bypass via terraform               │
│  ─────────────────────────────────────────────────              │
│  1. Dev crea infra/terraform/rds.tf                             │
│  2. Scrive: resource "aws_rds_cluster" "bigger" { }             │
│  3. Push → CI → terraform plan                                  │
│  4. ❌ DENIED by IAM Policy                                     │
│     "AccessDenied: User github-catalog-deploy                   │
│      is not authorized to perform rds:CreateDBCluster"          │
│                                                                  │
│                                                                  │
│  SCENARIO 4: Platform Team modifica EKS                         │
│  ───────────────────────────────────────                        │
│  1. Platform eng apre platform-infrastructure                   │
│  2. Claude legge CLAUDE.md → vede regole critiche               │
│  3. Eng: "upgrade EKS a 1.32"                                   │
│  4. Claude:                                                     │
│     "⚠️ EKS upgrade richiede:                                   │
│      1. Maintenance window schedulata                           │
│      2. Runbook: docs/RUNBOOKS/eks-upgrade.md                   │
│      3. Approval da 2 platform leads                            │
│      4. Comunicazione a tutti i team                            │
│      Procedo con la preparazione del runbook?"                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Onboarding Nuovo Team

Quando un nuovo team applicativo deve essere aggiunto:

### Checklist Platform Team

```bash
# 1. Crea namespace e RBAC
cd platform-infrastructure/terraform/eks
# Aggiungi team a locals.tf
terraform apply

# 2. Crea IAM Role per GitHub
cd ../security
# Aggiungi team a github-oidc.tf
terraform apply

# 3. Crea ECR repository
cd ../shared
# Aggiungi repo a ecr.tf
terraform apply

# 4. Crea Secrets Manager path
# Aggiungi path a secrets.tf
terraform apply
```

### Template Repo Applicativo

```bash
# Platform team crea repo da template
gh repo create acme-corp/newteam-service \
  --template acme-corp/app-template \
  --private

# Il template include:
# - CLAUDE.md preconfigurato
# - .github/CODEOWNERS
# - .github/workflows/ che usa shared-pipelines
# - helm/ con structure base
# - infra/terraform/ con esempi moduli
```

---

## 7. Platform Documentation (Read-Only per App Teams)

Il problema: i repository `platform-infrastructure` sono restricted, ma i team applicativi hanno bisogno di conoscere l'architettura per ottimizzare le loro scelte.

**Soluzione:** Repository di documentazione pubblica gestito dal Platform Team.

### Struttura platform-docs Repository

```
┌─────────────────────────────────────────────────────────────────┐
│  platform-docs                    📖 INTERNAL (Read All)        │
│  Repository di documentazione architetturale                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  docs/                                                          │
│  ├── architecture/                                              │
│  │   ├── cluster-overview.md      # EKS version, node types    │
│  │   ├── networking.md            # VPC, subnets, ingress      │
│  │   ├── storage-classes.md       # EBS, EFS options           │
│  │   └── diagrams/                # Mermaid/draw.io            │
│  │                                                              │
│  ├── capabilities/                                              │
│  │   ├── compute.md               # Node sizes, limits         │
│  │   ├── databases.md             # RDS options, connection    │
│  │   ├── caching.md               # Redis clusters, patterns   │
│  │   ├── secrets.md               # Secrets Manager usage      │
│  │   └── observability.md         # Metrics, logs, traces      │
│  │                                                              │
│  ├── best-practices/                                            │
│  │   ├── resource-requests.md     # CPU/Memory sizing          │
│  │   ├── hpa-configuration.md     # Autoscaling patterns       │
│  │   ├── health-checks.md         # Liveness/Readiness         │
│  │   ├── pod-disruption.md        # PDB configuration          │
│  │   └── cost-optimization.md     # Spot instances, rightsizing│
│  │                                                              │
│  ├── examples/                                                  │
│  │   ├── helm-values/             # Optimized values examples  │
│  │   ├── hpa-configs/             # HPA templates              │
│  │   └── resource-configs/        # Resource request examples  │
│  │                                                              │
│  └── CLAUDE.md                    # Context per Claude Code    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Esempio: docs/architecture/cluster-overview.md

```markdown
# Cluster EKS - Overview

## Specifiche Cluster

| Aspetto | Valore | Note |
|---------|--------|------|
| Kubernetes Version | 1.32 | Upgrade schedulati trimestralmente |
| Region | eu-west-1 | Multi-AZ (3 availability zones) |
| Node Type | t3.medium | 2 vCPU, 4GB RAM per nodo |
| Node Range | 2-10 nodi | Cluster Autoscaler attivo |
| Max Pods/Node | 17 | Limite ENI t3.medium |

## Risorse Disponibili per Pod

| Categoria | Request Consigliato | Limit Massimo |
|-----------|---------------------|---------------|
| CPU (app standard) | 100m - 250m | 500m |
| Memory (app standard) | 128Mi - 256Mi | 512Mi |
| CPU (worker intensive) | 500m - 1000m | 2000m |
| Memory (worker intensive) | 512Mi - 1Gi | 2Gi |

## Storage Classes

| Nome | Tipo | Use Case |
|------|------|----------|
| gp3 (default) | EBS gp3 | Database, persistent data |
| efs-sc | EFS | Shared storage across pods |

## Ingress

| Aspetto | Valore |
|---------|--------|
| Controller | AWS ALB Ingress Controller |
| SSL Termination | ALB (ACM certificates) |
| WAF | Abilitato su ALB |

---

## Best Practices per questo Cluster

### CPU Throttling
- Il cluster usa **CPU limits**. Se la tua app supera il limit, viene throttled
- Consiglio: request = 50-70% del limit per headroom

### Memory OOMKill
- Se superi il memory limit, il pod viene killed
- Consiglio: monitora RSS in staging prima di prod

### Node Scheduling
- Usa **Pod Anti-Affinity** se hai bisogno di HA
- I nodi possono essere terminati con 10min notice (spot reclaim)
```

### Esempio: docs/best-practices/resource-requests.md

```markdown
# Resource Requests - Guida

## Come Scegliere i Valori

### Step 1: Profila in Dev/Staging

```bash
# Osserva utilizzo reale per 24h
kubectl top pods -n catalog --containers

# Oppure query Prometheus
avg(container_cpu_usage_seconds_total{namespace="catalog"}) by (pod)
```

### Step 2: Applica Formula

| Metrica | Formula Request | Formula Limit |
|---------|-----------------|---------------|
| CPU | P95 usage × 1.2 | Request × 2 |
| Memory | Max RSS × 1.3 | Request × 1.5 |

### Step 3: Configura HPA

```yaml
# Per app CPU-bound (API servers)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50  # Scale prima del throttling
```

### Esempi Reali

| App Type | CPU Request | CPU Limit | Mem Request | Mem Limit |
|----------|-------------|-----------|-------------|-----------|
| API Light | 100m | 200m | 128Mi | 256Mi |
| API Standard | 250m | 500m | 256Mi | 512Mi |
| Worker | 500m | 1000m | 512Mi | 1Gi |
| Heavy Processing | 1000m | 2000m | 1Gi | 2Gi |
```

### platform-docs/CLAUDE.md

```markdown
# Platform Documentation - CLAUDE.md

## Scopo Repository

Questo repository contiene la documentazione dell'architettura
per i team applicativi. È READ-ONLY e mantenuto dal Platform Team.

## Come Usare con Claude Code

Quando un developer chiede a Claude Code di ottimizzare la loro app:

1. Claude legge i file in questo repo per capire:
   - Limiti del cluster (CPU, memory, storage)
   - Best practices consigliate
   - Esempi di configurazione

2. Claude applica queste informazioni al codice applicativo

## Esempio Prompt per Developer

"Ottimizza il mio deployment Helm per il cluster attuale.
Leggi le best practices da platform-docs e applica i valori corretti."

## Aggiornamenti

- Questo repo è aggiornato dal Platform Team dopo ogni modifica infra
- Changelog in CHANGELOG.md
- Canale Slack: #platform-announcements
```

### Workflow: Developer Ottimizza con Claude Code

```
┌─────────────────────────────────────────────────────────────────┐
│           DEVELOPER OPTIMIZATION FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Developer apre catalog-service in Claude Code               │
│                                                                  │
│  2. Chiede: "Ottimizza resources e HPA per il nostro cluster"   │
│                                                                  │
│  3. Claude:                                                     │
│     a) Legge catalog-service/CLAUDE.md → limiti app             │
│     b) Clona/legge platform-docs → architettura cluster         │
│     c) Analizza helm/values.yaml corrente                       │
│     d) Propone modifiche basate su best practices               │
│                                                                  │
│  4. Output Claude:                                              │
│     "Basandomi sulla documentazione platform-docs:              │
│      - Cluster ha nodi t3.medium (2 vCPU, 4GB)                  │
│      - Consigliato CPU request 250m per API standard            │
│      - HPA threshold 50% per evitare throttling                 │
│                                                                  │
│      Modifiche proposte a helm/values.yaml:                     │
│      - resources.requests.cpu: 100m → 250m                      │
│      - resources.limits.cpu: 200m → 500m                        │
│      - hpa.targetCPU: 70 → 50"                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Referenza in CLAUDE.md Applicativo

Nel CLAUDE.md di ogni repo applicativo, aggiungi:

```markdown
## Architettura Cluster

Per informazioni sull'architettura del cluster e best practices:
- Repository: github.com/acme-corp/platform-docs
- Docs principali:
  - docs/architecture/cluster-overview.md
  - docs/best-practices/resource-requests.md
  - docs/best-practices/hpa-configuration.md

Claude Code: quando ottimizzi risorse, leggi prima platform-docs
per capire i limiti e le best practices del cluster.
```

### Vantaggi di questo Approccio

| Aspetto | Beneficio |
|---------|-----------|
| **Separazione** | Infra codice rimane privato, docs sono pubbliche |
| **Context per Claude** | Claude ha tutte le info per ottimizzare |
| **Self-Service** | Developer non devono chiedere a Platform Team |
| **Aggiornamento** | Platform Team aggiorna docs dopo ogni cambio |
| **Audit** | Docs versionati, si vede chi ha modificato cosa |

---

## 7b. Alternativa: Repo Platform Read-Only per Tutti

Se l'organizzazione preferisce **trasparenza totale**, tutti i repository possono essere leggibili (internal visibility) con guardrails nel CLAUDE.md applicativo.

### Configurazione GitHub

```
┌─────────────────────────────────────────────────────────────────┐
│              GITHUB VISIBILITY SETTINGS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  platform-infrastructure     📖 INTERNAL (Read All, Write Few)  │
│  ├── Visibility: Internal                                       │
│  ├── Branch Protection: main → require 2 platform-leads         │
│  └── CODEOWNERS: @platform-team                                 │
│                                                                  │
│  catalog-service            📖 INTERNAL (Read All, Write Team)  │
│  ├── Visibility: Internal                                       │
│  ├── Branch Protection: main → require 1 team-catalog           │
│  └── CODEOWNERS: @team-catalog                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### CLAUDE.md Applicativo con Guardrails Read-Only

```markdown
# Catalog Service - CLAUDE.md

## Repository Overview

Microservizio per la gestione del catalogo prodotti.

**Team Owner:** Team Catalog

---

## Architettura Cluster (Read-Only Reference)

Per capire l'architettura del cluster e ottimizzare le scelte,
puoi LEGGERE (ma non modificare) il repository platform:

| Repository | Path | Cosa Cercare |
|------------|------|--------------|
| platform-infrastructure | terraform/eks/cluster.tf | Versione K8s, node types |
| platform-infrastructure | terraform/eks/nodes.tf | Node groups, scaling limits |
| platform-infrastructure | terraform/shared/rds.tf | RDS configuration |
| platform-infrastructure | terraform/shared/redis.tf | Redis cluster settings |

### Come Usare

```
# ✅ ALLOWED - Leggere per capire architettura
git clone git@github.com:acme-corp/platform-infrastructure.git /tmp/platform-ref
cat /tmp/platform-ref/terraform/eks/nodes.tf

# ❌ BLOCKED - NON creare branch o PR
# Claude NON deve MAI modificare platform-infrastructure
```

---

## Guardrails per Claude Code

### ✅ PUOI FARE

1. **Leggere platform-infrastructure** per capire:
   - Tipo di nodi (t3.medium, t3.large, etc.)
   - Limiti HPA configurati a livello cluster
   - Versione Kubernetes
   - Configurazione RDS/Redis

2. **Usare le info per ottimizzare** questo repo:
   - Adeguare resource requests/limits
   - Configurare HPA appropriato
   - Scegliere connection pool size basato su RDS

### ❌ NON PUOI FARE

1. **Modificare platform-infrastructure**
   - Non creare file, branch o PR in quel repo
   - Se serve una modifica → suggerisci ticket a Platform Team

2. **Copiare configurazioni platform in questo repo**
   - Non duplicare Terraform da platform
   - Usa solo i moduli esposti in platform-modules

---

## Esempio Workflow

Developer: "Ottimizza il mio deployment per il cluster attuale"

Claude:
1. Clona platform-infrastructure in /tmp (read-only)
2. Legge terraform/eks/nodes.tf → nodi t3.medium (2 vCPU, 4GB)
3. Legge terraform/eks/cluster.tf → EKS 1.32
4. Analizza helm/values.yaml corrente
5. Propone modifiche a helm/values.yaml (NON a platform!)

Output:
"Ho letto la configurazione cluster da platform-infrastructure:
- Nodi: t3.medium (2 vCPU, 4GB RAM)
- Max pods per nodo: 17
- HPA cluster-wide: nessun limite

Per il tuo servizio catalog, consiglio:
- CPU request: 250m (attuale 100m)
- CPU limit: 500m (attuale 200m)
- HPA target: 50% (attuale 70%)

Modifico helm/values.yaml?"
```

### Workflow Completo: Read Platform → Optimize App

```
┌─────────────────────────────────────────────────────────────────┐
│     CLAUDE CODE: READ PLATFORM → OPTIMIZE APP                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Developer in catalog-service/                                  │
│  └── "Ottimizza resources per il nostro cluster"                │
│                                                                  │
│  Claude legge CLAUDE.md                                         │
│  └── Vede: "Puoi LEGGERE platform-infrastructure"               │
│                                                                  │
│  Claude clona platform-infrastructure (temp, read-only)         │
│  ├── Legge terraform/eks/nodes.tf                               │
│  │   └── instance_type = "t3.medium"                            │
│  ├── Legge terraform/eks/cluster.tf                             │
│  │   └── version = "1.32"                                       │
│  └── Legge terraform/shared/rds.tf                              │
│      └── max_connections = 100                                  │
│                                                                  │
│  Claude analizza catalog-service/helm/values.yaml               │
│  └── Trova: requests.cpu = 100m, limits.cpu = 200m              │
│                                                                  │
│  Claude propone modifiche a catalog-service SOLO:               │
│  ├── helm/values.yaml → resources optimized                     │
│  └── src/config/database.ts → pool size = 10 (100/10 services)  │
│                                                                  │
│  ❌ Claude NON tocca platform-infrastructure                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Vantaggi Rispetto a platform-docs Separato

| Aspetto | platform-docs | Read-Only Platform |
|---------|---------------|-------------------|
| **Source of Truth** | Docs possono divergere | Sempre aggiornato (è il codice) |
| **Manutenzione** | Richiede sync docs↔code | Zero overhead |
| **Dettaglio** | Solo docs selezionate | Tutto visibile |
| **Rischio** | Nessun accesso a secrets | Secrets in tfvars (gitignore) |

### Considerazioni di Sicurezza

Per usare questo approccio in modo sicuro:

1. **Secrets in AWS Secrets Manager**, non in repo
2. **tfvars in .gitignore** (mai committati)
3. **Branch protection** rigorosa su platform repos
4. **Audit log** su tutti i clone/pull

```hcl
# ✅ SAFE - In terraform code (leggibile)
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "ecommerce/rds/password"
}

# ❌ NEVER - Mai in repo
# variable "db_password" { default = "actual-password" }
```

---

## 8. Monitoring e Audit

### CloudTrail per Audit

```hcl
# In platform-infrastructure
resource "aws_cloudtrail" "audit" {
  name           = "platform-audit"
  s3_bucket_name = aws_s3_bucket.audit_logs.id

  event_selector {
    read_write_type           = "All"
    include_management_events = true
  }
}

# Alert su azioni sospette
resource "aws_cloudwatch_metric_alarm" "unauthorized_api_calls" {
  alarm_name          = "UnauthorizedAPICalls"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UnauthorizedAttemptCount"
  namespace           = "CloudTrailMetrics"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}
```

### GitHub Audit Log

```yaml
# Webhook per audit GitHub → CloudWatch
# Ogni PR/push ai repo platform viene loggato
```

---

## Riepilogo Implementazione

| Componente | File/Risorsa | Owner |
|------------|--------------|-------|
| CLAUDE.md Platform | `platform-infrastructure/CLAUDE.md` | Platform |
| CLAUDE.md Apps | `{app}-service/CLAUDE.md` | Template |
| CODEOWNERS Platform | `platform-infrastructure/.github/CODEOWNERS` | Platform |
| CODEOWNERS Apps | `{app}-service/.github/CODEOWNERS` | Template |
| IAM Roles | `platform-infrastructure/terraform/security/` | Platform |
| K8s RBAC | `platform-infrastructure/terraform/eks/rbac/` | Platform |
| Shared Pipelines | `shared-pipelines/.github/workflows/` | DevOps |
| S3 State Policies | `platform-infrastructure/terraform/bootstrap/` | Platform |

---

*Documento generato: 2025-12-31*
