# Multi-Team Guardrails con Claude Code

Guida completa per implementare guardrails in un contesto enterprise multi-repo con Claude Code.

---

## Contesto Organizzativo

### Team e Responsabilità

| Team | Dimensione | Gestisce | Responsabilità |
|------|------------|----------|----------------|
| **Platform Team** | 3-5 engineers | VPC, EKS, RDS, Security | Uptime, Compliance |
| **DevOps Team** | 2-4 engineers | CI/CD, Helm, Monitoring | Supporto a tutti i team |
| **Team Catalog** | 4 developers | catalog-service | Catalogo prodotti |
| **Team Orders** | 4 developers | orders-service | Gestione ordini |
| **Team Payments** | 3 developers | payments-service | Pagamenti |

### Gerarchia Responsabilità

```
Platform Team (infrastruttura core)
       ↓
DevOps Team (pipeline e deploy)
       ↓
Application Teams (codice applicativo)
```

---

## Architettura Multi-Repo

### Repository per Categoria

| Categoria | Repository | Accesso | Descrizione |
|-----------|------------|---------|-------------|
| **Platform** | `platform-infrastructure` | Solo Platform Team | Terraform per VPC, EKS, RDS, IAM |
| **Platform** | `platform-modules` | Solo Platform Team | Moduli Terraform riutilizzabili |
| **DevOps** | `shared-helm-charts` | DevOps + Platform read | Chart Helm template |
| **DevOps** | `shared-pipelines` | DevOps + Platform read | GitHub Actions reusable |
| **App** | `catalog-service` | Team Catalog | Microservizio catalogo |
| **App** | `orders-service` | Team Orders | Microservizio ordini |
| **App** | `payments-service` | Team Payments | Microservizio pagamenti |

### Contenuto Repository Platform

**platform-infrastructure:**

| Directory | Contenuto |
|-----------|-----------|
| `terraform/bootstrap/` | S3, DynamoDB, OIDC |
| `terraform/network/` | VPC, Subnets, NAT |
| `terraform/eks/` | Cluster, Node Groups |
| `terraform/security/` | IAM, Security Groups |
| `terraform/shared/` | RDS, ElastiCache, ECR |
| `CLAUDE.md` | Contesto per Claude Code |
| `CODEOWNERS` | Approval rules |

### Contenuto Repository Applicativo

**catalog-service:**

| Directory | Contenuto |
|-----------|-----------|
| `src/` | Codice applicazione |
| `helm/` | Values per deploy (values-dev, values-prod) |
| `infra/terraform/` | Solo moduli platform |
| `.github/workflows/` | CI/CD (usa shared-pipelines) |
| `CLAUDE.md` | Contesto per Claude Code |

---

## 1. CLAUDE.md per Ogni Repo

### Esempio: platform-infrastructure/CLAUDE.md

```markdown
# Platform Infrastructure - CLAUDE.md

## Repository Overview

Questo repository contiene l'infrastruttura core AWS gestita dal Platform Team.

**Team Owner:** Platform Team
**Criticità:** ALTA - Downtime impatta tutti i servizi
**Change Frequency:** Bassa (settimanale/mensile)

## Chi Può Modificare

| Ruolo | Permessi |
|-------|----------|
| Platform Team | Full access |
| DevOps Team | Read-only |
| Developers | Nessun accesso |

## Struttura Repository

| Directory | Layer | Descrizione |
|-----------|-------|-------------|
| `terraform/bootstrap/` | Layer 0 | State backend, OIDC - Modificare SOLO per setup iniziale |
| `terraform/network/` | Layer 1 | VPC, Subnets - Modifiche richiedono maintenance window |
| `terraform/eks/` | Layer 1 | Cluster Kubernetes - UPGRADE = POSSIBILE DOWNTIME |
| `terraform/security/` | Layer 1 | IAM, Security Groups - Richiede Security Review |
| `terraform/shared/` | Layer 2 | RDS, ElastiCache, ECR - Impatta tutti i team applicativi |

## Regole Critiche per Claude Code

### NON FARE MAI

1. **EKS Upgrade** senza runbook approvato
2. **Modificare Security Groups** senza security review
3. **Cambiare VPC CIDR o Subnet allocation**
4. **Modificare IAM Policies** production senza audit
5. **Terraform destroy** su risorse production

### ATTENZIONE

1. **RDS/ElastiCache changes** possono causare restart
2. **Node Group updates** causano rolling restart

### SAFE OPERATIONS

1. Aggiungere nuovi tag
2. Aumentare capacità (scale up)
3. Aggiungere nuovi ECR repositories
4. Creare nuovi Secrets Manager paths

## Risorse Gestite

| Risorsa | Terraform Path | Criticità |
|---------|----------------|-----------|
| VPC | network/vpc.tf | CRITICA |
| EKS Cluster | eks/cluster.tf | CRITICA |
| Node Groups | eks/nodes.tf | ALTA |
| RDS Cluster | shared/rds.tf | ALTA |
| ElastiCache | shared/redis.tf | MEDIA |
| ECR Repos | shared/ecr.tf | BASSA |

## Contatti Emergenza

- Platform On-Call: #platform-oncall
- Escalation: platform-lead@company.com
```

---

### Esempio: catalog-service/CLAUDE.md

```markdown
# Catalog Service - CLAUDE.md

## Repository Overview

Microservizio per la gestione del catalogo prodotti.

**Team Owner:** Team Catalog
**Criticità:** MEDIA
**Dependencies:** RDS (read), Redis (cache), S3 (images)

## Chi Può Modificare

| Ruolo | Permessi |
|-------|----------|
| Team Catalog | Full access |
| DevOps Team | CI/CD, Helm review |
| Platform Team | Read-only |

## Struttura Repository

| Directory | Contenuto | Note |
|-----------|-----------|------|
| `src/` | controllers/, services/, tests/ | Full access |
| `helm/` | values.yaml, values-prod.yaml | prod richiede review |
| `infra/terraform/` | main.tf, variables.tf | Solo moduli platform |
| `.github/workflows/` | ci-cd.yml | Usa shared-pipelines |

## Regole per Claude Code

### PUOI FARE

1. Modificare tutto in `src/`
2. Modificare `helm/values*.yaml`
3. Usare moduli da `platform-modules`

### NON PUOI FARE

1. Creare risorse AWS direttamente (no `resource "aws_*"`)
2. Modificare namespace di altri team
3. Bypassare i moduli platform

### RICHIEDE REVIEW

1. Modifiche a `values-prod.yaml` → DevOps approval
2. Nuove dipendenze infra → ticket Platform Team

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

CODEOWNERS è un file GitHub che definisce chi deve approvare le PR per specifici path.

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

**Spiegazione:**
- Qualsiasi modifica richiede approval da `@platform-team`
- Path critici (EKS, security, network) richiedono `@platform-leads`
- Security changes richiedono anche `@security-team`

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

**Spiegazione:**
- Il team applicativo approva il proprio codice
- Cambi infra e production richiedono DevOps

---

## 3. IAM Isolation

Ogni repository GitHub ha un IAM Role dedicato con permessi limitati.

### Struttura IAM Roles

| Role | Trust (GitHub Repo) | Permessi |
|------|---------------------|----------|
| `PlatformDeployRole` | `platform-infrastructure:*` | AdministratorAccess |
| `DevOpsDeployRole` | `shared-*:*` | ECR, EKS deploy, Secrets read |
| `AppDeployRole-Catalog` | `catalog-service:*` | Solo namespace `catalog` |
| `AppDeployRole-Orders` | `orders-service:*` | Solo namespace `orders` |
| `AppDeployRole-Payments` | `payments-service:*` | Solo namespace `payments` |

### Permessi AppDeployRole (per ogni team)

| Azione | Permesso | Scope |
|--------|----------|-------|
| ECR push/pull | ✅ | Solo proprio repository |
| EKS deploy | ✅ | Solo proprio namespace |
| Secrets Manager read | ✅ | Solo proprio path (`/{team}/*`) |
| VPC modify | ❌ | Bloccato |
| RDS modify | ❌ | Bloccato |
| EKS cluster modify | ❌ | Bloccato |

### Terraform per IAM Roles

```hcl
# terraform/security/github-oidc.tf

# OIDC Provider per GitHub Actions
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
        Action = ["ecr:*"]
        Resource = "arn:aws:ecr:*:*:repository/${each.key}-service"
      },
      # EKS - Accesso al cluster (deploy only)
      {
        Effect = "Allow"
        Action = ["eks:DescribeCluster"]
        Resource = "*"
      },
      # Secrets Manager - Solo proprio path
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
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
          "arn:aws:eks:*:*:cluster/*"
        ]
      }
    ]
  })
}
```

### Kubernetes RBAC

```yaml
# terraform/eks/rbac/app-team-rbac.yaml.tpl
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ${team}-deployer
  namespace: ${team}
rules:
  - apiGroups: ["", "apps", "batch"]
    resources: ["deployments", "services", "configmaps", "secrets", "pods"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ${team}-deployer-binding
  namespace: ${team}
subjects:
  - kind: User
    name: github-${team}-deploy
roleRef:
  kind: Role
  name: ${team}-deployer
```

---

## 4. CI/CD Gates

### Workflow di Deploy con Validazione

Il workflow verifica che ogni repo possa deployare solo nel proprio namespace.

```yaml
# shared-pipelines/.github/workflows/deploy-app.yml
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
          REPO="${{ github.repository }}"

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
            *)
              echo "Repository non autorizzato per deploy"
              exit 1
              ;;
          esac

          echo "namespace=$ALLOWED_NS" >> $GITHUB_OUTPUT
          echo "role_arn=$ROLE_ARN" >> $GITHUB_OUTPUT

  security-gate:
    needs: validate
    if: inputs.environment == 'prod'
    environment: production  # Richiede approval manuale
    runs-on: ubuntu-latest
    steps:
      - run: echo "Production deployment approved"

  deploy:
    needs: [validate, security-gate]
    if: always() && needs.validate.result == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ needs.validate.outputs.role_arn }}
          aws-region: us-east-1

      - name: Validate namespace access
        run: |
          NAMESPACE="${{ needs.validate.outputs.namespace }}"

          # Verifica accesso al proprio namespace
          if kubectl auth can-i create deployments -n $NAMESPACE; then
            echo "Accesso a $NAMESPACE confermato"
          else
            exit 1
          fi

          # Verifica NO accesso ad altri namespace
          if kubectl auth can-i create deployments -n kube-system 2>/dev/null; then
            echo "ERRORE: Accesso a kube-system non dovrebbe essere permesso"
            exit 1
          fi

      - name: Deploy with Helm
        run: |
          helm upgrade --install ${{ inputs.app_name }} ./helm \
            --namespace ${{ needs.validate.outputs.namespace }} \
            --values ./helm/values-${{ inputs.environment }}.yaml
```

---

## 5. Flusso Completo - Scenari

### Scenario 1: Developer modifica codice app

| Step | Azione | Risultato |
|------|--------|-----------|
| 1 | Dev apre `catalog-service` in Claude Code | Claude legge CLAUDE.md |
| 2 | Dev: "aggiungi endpoint /products/featured" | Claude modifica `src/` |
| 3 | Push → PR | CODEOWNERS: Team Catalog approva |
| 4 | CI → Deploy dev | ✅ SUCCESS |

### Scenario 2: Developer prova a modificare infra platform

| Step | Azione | Risultato |
|------|--------|-----------|
| 1 | Dev apre `catalog-service` in Claude Code | Claude legge CLAUDE.md |
| 2 | Dev: "aumenta CPU del database RDS" | Claude vede limite in CLAUDE.md |
| 3 | Claude risponde | "Non posso modificare RDS. Apri ticket a Platform Team." |

### Scenario 3: Developer prova bypass via Terraform

| Step | Azione | Risultato |
|------|--------|-----------|
| 1 | Dev crea `infra/terraform/rds.tf` | `resource "aws_rds_cluster" {}` |
| 2 | Push → CI → terraform plan | ❌ DENIED by IAM Policy |
| 3 | Errore | "AccessDenied: User github-catalog-deploy is not authorized" |

### Scenario 4: Platform Team modifica EKS

| Step | Azione | Risultato |
|------|--------|-----------|
| 1 | Platform eng apre `platform-infrastructure` | Claude legge CLAUDE.md |
| 2 | Eng: "upgrade EKS a 1.32" | Claude vede regole critiche |
| 3 | Claude risponde | "EKS upgrade richiede: maintenance window, runbook, 2 approvals" |

---

## 6. Onboarding Nuovo Team

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
terraform apply

# 4. Crea Secrets Manager path
terraform apply
```

### Crea Repo da Template

```bash
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

**Problema:** I repository `platform-infrastructure` sono restricted, ma i team applicativi hanno bisogno di conoscere l'architettura per ottimizzare le loro scelte.

**Soluzione:** Repository di documentazione pubblica gestito dal Platform Team.

### Struttura platform-docs Repository

| Directory | Contenuto |
|-----------|-----------|
| `docs/architecture/` | cluster-overview.md, networking.md, storage-classes.md |
| `docs/capabilities/` | compute.md, databases.md, caching.md, secrets.md |
| `docs/best-practices/` | resource-requests.md, hpa-configuration.md, health-checks.md |
| `docs/examples/` | helm-values/, hpa-configs/, resource-configs/ |
| `CLAUDE.md` | Context per Claude Code |

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

## Best Practices

- **CPU Throttling:** request = 50-70% del limit per headroom
- **Memory OOMKill:** monitora RSS in staging prima di prod
- **Pod Anti-Affinity:** usa per HA
```

### Workflow: Developer Ottimizza con Claude Code

| Step | Azione |
|------|--------|
| 1 | Developer apre `catalog-service` in Claude Code |
| 2 | Chiede: "Ottimizza resources e HPA per il nostro cluster" |
| 3 | Claude legge `catalog-service/CLAUDE.md` → vede riferimento a platform-docs |
| 4 | Claude legge `platform-docs/docs/architecture/cluster-overview.md` |
| 5 | Claude propone: CPU request 250m, limit 500m, HPA target 50% |

### Referenza in CLAUDE.md Applicativo

```markdown
## Architettura Cluster

Per informazioni sull'architettura e best practices:
- Repository: github.com/acme-corp/platform-docs
- Docs principali:
  - docs/architecture/cluster-overview.md
  - docs/best-practices/resource-requests.md

Claude Code: quando ottimizzi risorse, leggi prima platform-docs.
```

---

## 7b. Alternativa: Repo Platform Read-Only per Tutti

Se l'organizzazione preferisce **trasparenza totale**, tutti i repository possono essere leggibili (internal visibility) con guardrails nel CLAUDE.md applicativo.

### Configurazione GitHub

| Repository | Visibility | Write Access | Branch Protection |
|------------|------------|--------------|-------------------|
| `platform-infrastructure` | Internal | Solo Platform Team | 2 platform-leads |
| `catalog-service` | Internal | Solo Team Catalog | 1 team member |

### CLAUDE.md Applicativo con Guardrails Read-Only

```markdown
# Catalog Service - CLAUDE.md

## Architettura Cluster (Read-Only Reference)

Per capire l'architettura del cluster e ottimizzare le scelte,
puoi LEGGERE (ma non modificare) il repository platform:

| Repository | Path | Cosa Cercare |
|------------|------|--------------|
| platform-infrastructure | terraform/eks/cluster.tf | Versione K8s, node types |
| platform-infrastructure | terraform/eks/nodes.tf | Node groups, scaling limits |
| platform-infrastructure | terraform/shared/rds.tf | RDS configuration |

## Guardrails per Claude Code

### PUOI FARE
- Leggere platform-infrastructure per capire architettura
- Usare le info per ottimizzare questo repo

### NON PUOI FARE
- Modificare platform-infrastructure (no branch, no PR)
- Copiare configurazioni platform in questo repo
```

### Workflow: Read Platform → Optimize App

| Step | Azione |
|------|--------|
| 1 | Developer: "Ottimizza resources per il nostro cluster" |
| 2 | Claude legge CLAUDE.md → "Puoi LEGGERE platform-infrastructure" |
| 3 | Claude clona platform-infrastructure (temp, read-only) |
| 4 | Legge `terraform/eks/nodes.tf` → `t3.medium` |
| 5 | Propone modifiche a `catalog-service/helm/values.yaml` SOLO |

### Vantaggi vs platform-docs Separato

| Aspetto | platform-docs | Read-Only Platform |
|---------|---------------|-------------------|
| Source of Truth | Docs possono divergere | Sempre aggiornato |
| Manutenzione | Richiede sync docs↔code | Zero overhead |
| Dettaglio | Solo docs selezionate | Tutto visibile |

### Sicurezza

```hcl
# SAFE - In terraform code (leggibile)
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "ecommerce/rds/password"
}

# NEVER - Mai in repo
# variable "db_password" { default = "actual-password" }
```

---

## 8. Monitoring e Audit

### CloudTrail per Audit

```hcl
resource "aws_cloudtrail" "audit" {
  name           = "platform-audit"
  s3_bucket_name = aws_s3_bucket.audit_logs.id

  event_selector {
    read_write_type           = "All"
    include_management_events = true
  }
}

resource "aws_cloudwatch_metric_alarm" "unauthorized_api_calls" {
  alarm_name          = "UnauthorizedAPICalls"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}
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
