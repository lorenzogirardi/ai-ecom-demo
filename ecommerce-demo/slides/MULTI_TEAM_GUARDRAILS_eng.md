# Multi-Team Guardrails with Claude Code

Complete guide for implementing guardrails in an enterprise multi-repo context with Claude Code.

---

## Organizational Context

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION STRUCTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │ Platform Team   │  Manages: VPC, EKS, RDS, Security         │
│  │ (3-5 engineers) │  Responsibility: Uptime, Compliance       │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ DevOps Team     │  Manages: CI/CD, Helm, Monitoring         │
│  │ (2-4 engineers) │  Supports: All application teams          │
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

## Multi-Repo Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB ORGANIZATION                           │
│                    github.com/acme-corp/                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PLATFORM REPOS (Private - Platform Team Only)                  │
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
│  │ │   ├── base-app/        (application template)    │        │
│  │ │   ├── base-worker/     (worker template)         │        │
│  │ │   └── base-cronjob/    (cronjob template)        │        │
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
│  APPLICATION REPOS (Per Team - Full Access own repo)            │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ catalog-service                 ✅ Team Catalog     │        │
│  │ ├── src/                        (app code)          │        │
│  │ ├── helm/                       (values only)       │        │
│  │ ├── infra/                      (app-scoped only)   │        │
│  │ ├── CLAUDE.md                                       │        │
│  │ └── .github/workflows/          (uses shared)       │        │
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

## 1. CLAUDE.md for Each Repo

### platform-infrastructure/CLAUDE.md

```markdown
# Platform Infrastructure - CLAUDE.md

## Repository Overview

This repository contains core AWS infrastructure managed by the Platform Team.

**Team Owner:** Platform Team
**Criticality:** HIGH - Downtime impacts all services
**Change Frequency:** Low (weekly/monthly)

---

## Who Can Modify

| Role | Permissions |
|------|-------------|
| Platform Team | Full access |
| DevOps Team | Read-only |
| Developers | No access |

---

## Repository Structure

| Directory | Layer | Description |
|-----------|-------|-------------|
| `terraform/bootstrap/` | Layer 0 | State backend, OIDC - Modify ONLY for initial setup |
| `terraform/network/` | Layer 1 | VPC, Subnets - Changes require maintenance window |
| `terraform/eks/` | Layer 1 | Kubernetes Cluster - ⚠️ UPGRADE = POSSIBLE DOWNTIME |
| `terraform/security/` | Layer 1 | IAM, Security Groups - Requires Security Review |
| `terraform/shared/` | Layer 2 | RDS, ElastiCache, ECR - Impacts all application teams |

---

## Critical Rules for Claude Code

### ❌ NEVER DO

1. **EKS Upgrade** without approved runbook
   - Upgrade requires maintenance window
   - Follow docs/RUNBOOKS/eks-upgrade.md

2. **Modify Security Groups** without security review
   - Every SG change requires Security Team approval

3. **Change VPC CIDR or Subnet allocation**
   - Impacts networking of all services
   - Requires complete re-provisioning

4. **Modify IAM Policies** production without audit
   - Principle of least privilege
   - Every change logged in CloudTrail

5. **Terraform destroy** on production resources
   - Never use `destroy` without explicit approval
   - Use `terraform state rm` if removal needed

### ⚠️ CAUTION

1. **RDS/ElastiCache changes** can cause restart
   - Verify `apply_immediately` = false
   - Schedule in maintenance window

2. **Node Group updates** cause rolling restart
   - Verify team PodDisruptionBudgets
   - Communicate to all teams before

### ✅ SAFE OPERATIONS

1. Adding new tags
2. Increasing capacity (scale up)
3. Adding new ECR repositories
4. Creating new Secrets Manager paths

---

## Workflow for Changes

```
1. Create branch: platform/TICKET-123-description
2. Make changes with Claude Code
3. terraform plan > plan.txt
4. Create PR with plan.txt attached
5. Review from 2 Platform Engineers
6. If impacts other teams → notify in #platform-changes
7. Merge only in maintenance window (if critical)
8. Apply with active monitoring
```

---

## Terraform Commands

```bash
# Init (first setup)
cd terraform/network
terraform init -backend-config=backend.hcl

# Plan (ALWAYS before apply)
terraform plan -out=plan.tfplan

# Apply (only after review)
terraform apply plan.tfplan

# NEVER DO THIS:
# terraform destroy  ← BLOCKED by policy
# terraform apply -auto-approve  ← BLOCKED
```

---

## Managed Resources

| Resource | Terraform Path | Criticality |
|----------|----------------|-------------|
| VPC | network/vpc.tf | CRITICAL |
| EKS Cluster | eks/cluster.tf | CRITICAL |
| Node Groups | eks/nodes.tf | HIGH |
| RDS Cluster | shared/rds.tf | HIGH |
| ElastiCache | shared/redis.tf | MEDIUM |
| ECR Repos | shared/ecr.tf | LOW |

---

## Emergency Contacts

- Platform On-Call: #platform-oncall
- Escalation: platform-lead@company.com
```

---

### catalog-service/CLAUDE.md (Application Repo)

```markdown
# Catalog Service - CLAUDE.md

## Repository Overview

Microservice for product catalog management.

**Team Owner:** Team Catalog
**Criticality:** MEDIUM
**Dependencies:** RDS (read), Redis (cache), S3 (images)

---

## Who Can Modify

| Role | Permissions |
|------|-------------|
| Team Catalog | Full access |
| DevOps Team | CI/CD, Helm review |
| Platform Team | Read-only |

---

## Repository Structure

| Directory | Content | Notes |
|-----------|---------|-------|
| `src/` | controllers/, services/, repositories/, tests/ | ✅ Application code - Full access |
| `helm/` | values.yaml, values-dev.yaml, values-staging.yaml, values-prod.yaml | ✅ Deploy values (prod requires review) |
| `infra/terraform/` | main.tf, variables.tf | ⚠️ LIMITED - Platform modules only |
| `.github/workflows/` | ci-cd.yml | Uses shared-pipelines |
| `CLAUDE.md` | This file | Context for Claude Code |

---

## Rules for Claude Code

### ✅ YOU CAN DO

1. **Modify src/**
   - All application code
   - Tests
   - App configurations

2. **Modify helm/values*.yaml**
   - Replica count
   - Resource requests/limits
   - Environment variables
   - ConfigMaps

3. **Modify infra/terraform/** using ONLY approved modules
   ```hcl
   # ✅ ALLOWED - Uses platform module
   module "catalog_namespace" {
     source = "git::https://github.com/acme-corp/platform-modules//eks-namespace"
     name   = "catalog"
     team   = "catalog"
   }

   module "catalog_database" {
     source = "git::https://github.com/acme-corp/platform-modules//app-database"
     name   = "catalog"
     # Only parameters exposed by module
   }
   ```

### ❌ YOU CANNOT DO

1. **Create AWS resources directly**
   ```hcl
   # ❌ BLOCKED - Don't use aws provider directly
   resource "aws_rds_cluster" "catalog" { }
   resource "aws_security_group" "catalog" { }
   resource "aws_iam_role" "catalog" { }
   ```

2. **Modify other teams' resources**
   ```hcl
   # ❌ BLOCKED - Not your namespace
   resource "kubernetes_config_map" "orders_config" {
     metadata {
       namespace = "orders"  # NOT YOURS
     }
   }
   ```

3. **Bypass platform modules**
   - All infra setup must use platform-modules
   - If something not covered → ticket to Platform Team

### ⚠️ REQUIRES REVIEW

1. **Changes to values-prod.yaml**
   - Requires DevOps approval
   - Label PR with `production`

2. **New infra dependencies**
   - New database? → ticket Platform
   - New cache? → ticket Platform
   - New secret? → use app-secrets module

---

## How to Request Infra Resources

If you need something not covered by modules:

1. Open issue in `platform-infrastructure`
2. Template: `.github/ISSUE_TEMPLATE/infra-request.md`
3. SLA: 3-5 business days
4. Platform Team will create module or resource

---

## CI/CD Workflow

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
    # Requires manual approval for prod
```

---

## Local Commands

```bash
# Development
npm install
npm run dev
npm run test

# Docker
docker build -t catalog-service .
docker run -p 3000:3000 catalog-service

# Helm (preview only, deploy via CI)
helm template catalog ./helm -f ./helm/values-dev.yaml
```

---

## External Dependencies

| Service | Owner | How to Request Changes |
|---------|-------|------------------------|
| PostgreSQL | Platform | Ticket infra-request |
| Redis | Platform | Ticket infra-request |
| S3 Bucket | Platform | Ticket infra-request |
| Secrets | Platform | Use module app-secrets |
```

---

## 2. CODEOWNERS per Repo

### platform-infrastructure/.github/CODEOWNERS

```
# Platform Infrastructure - CODEOWNERS
# Only Platform Team can approve changes

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

### IAM Roles Structure

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

### Terraform for IAM Roles (in platform-infrastructure)

```hcl
# terraform/security/github-oidc.tf

# OIDC Provider (already exists)
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
      # ECR - Own repository only
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
      # EKS - Cluster access
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster"
        ]
        Resource = "*"
      },
      # Secrets Manager - Own path only
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:/${each.key}/*"
      },
      # Explicit DENY on platform resources
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
    name: github-${team}-deploy  # Mapped from IAM Role
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
          # Extract team from repo name
          REPO="${{ github.repository }}"
          APP_NAME="${{ inputs.app_name }}"

          # Map repo → allowed namespace
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
              echo "❌ Repository not authorized for deploy"
              exit 1
              ;;
          esac

          echo "namespace=$ALLOWED_NS" >> $GITHUB_OUTPUT
          echo "role_arn=$ROLE_ARN" >> $GITHUB_OUTPUT
          echo "✅ Authorized deploy to namespace: $ALLOWED_NS"

  security-gate:
    runs-on: ubuntu-latest
    needs: validate
    if: inputs.environment == 'prod'
    environment: production  # Requires manual approval
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

          # Test we can access only our namespace
          if kubectl auth can-i create deployments -n $NAMESPACE; then
            echo "✅ Access to $NAMESPACE confirmed"
          else
            echo "❌ No access to $NAMESPACE"
            exit 1
          fi

          # Verify we CANNOT access other namespaces
          if kubectl auth can-i create deployments -n kube-system 2>/dev/null; then
            echo "❌ ERROR: Access to kube-system should not be allowed"
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
      # Platform team - full access
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
      # App teams - DENY on platform state
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
      # App teams - access only own state
      {
        Sid    = "AppAccessOwnState"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.app_deploy["catalog"].arn
        }
        Action = ["s3:GetObject", "s3:PutObject"]
        Resource = "${aws_s3_bucket.terraform_state.arn}/apps/catalog/*"
      }
      # ... repeat for each team
    ]
  })
}
```

---

## 5. Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW EXAMPLES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SCENARIO 1: Developer modifies app code                        │
│  ─────────────────────────────────────────                      │
│  1. Dev opens catalog-service in Claude Code                    │
│  2. Claude reads CLAUDE.md → knows limits                       │
│  3. Dev: "add new endpoint /products/featured"                  │
│  4. Claude modifies src/ → ✅ ALLOWED                           │
│  5. PR → CI → Deploy dev → ✅ SUCCESS                           │
│                                                                  │
│                                                                  │
│  SCENARIO 2: Developer tries to modify platform infra           │
│  ─────────────────────────────────────────────────────          │
│  1. Dev opens catalog-service in Claude Code                    │
│  2. Dev: "increase RDS database CPU"                            │
│  3. Claude reads CLAUDE.md → sees limit                         │
│  4. Claude responds:                                            │
│     "❌ I cannot modify RDS directly.                           │
│      RDS is managed by Platform Team.                           │
│      Open ticket: github.com/acme-corp/platform-infrastructure  │
│      Template: infra-request.md"                                │
│                                                                  │
│                                                                  │
│  SCENARIO 3: Developer tries bypass via terraform               │
│  ─────────────────────────────────────────────────              │
│  1. Dev creates infra/terraform/rds.tf                          │
│  2. Writes: resource "aws_rds_cluster" "bigger" { }             │
│  3. Push → CI → terraform plan                                  │
│  4. ❌ DENIED by IAM Policy                                     │
│     "AccessDenied: User github-catalog-deploy                   │
│      is not authorized to perform rds:CreateDBCluster"          │
│                                                                  │
│                                                                  │
│  SCENARIO 4: Platform Team modifies EKS                         │
│  ───────────────────────────────────────                        │
│  1. Platform eng opens platform-infrastructure                  │
│  2. Claude reads CLAUDE.md → sees critical rules                │
│  3. Eng: "upgrade EKS to 1.32"                                  │
│  4. Claude:                                                     │
│     "⚠️ EKS upgrade requires:                                   │
│      1. Scheduled maintenance window                            │
│      2. Runbook: docs/RUNBOOKS/eks-upgrade.md                   │
│      3. Approval from 2 platform leads                          │
│      4. Communication to all teams                              │
│      Should I proceed with runbook preparation?"                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Onboarding New Team

When a new application team needs to be added:

### Platform Team Checklist

```bash
# 1. Create namespace and RBAC
cd platform-infrastructure/terraform/eks
# Add team to locals.tf
terraform apply

# 2. Create IAM Role for GitHub
cd ../security
# Add team to github-oidc.tf
terraform apply

# 3. Create ECR repository
cd ../shared
# Add repo to ecr.tf
terraform apply

# 4. Create Secrets Manager path
# Add path to secrets.tf
terraform apply
```

### Application Repo Template

```bash
# Platform team creates repo from template
gh repo create acme-corp/newteam-service \
  --template acme-corp/app-template \
  --private

# Template includes:
# - Pre-configured CLAUDE.md
# - .github/CODEOWNERS
# - .github/workflows/ using shared-pipelines
# - helm/ with base structure
# - infra/terraform/ with module examples
```

---

## 7. Platform Documentation (Read-Only for App Teams)

The problem: `platform-infrastructure` repositories are restricted, but application teams need to understand the architecture to optimize their choices.

**Solution:** Public documentation repository managed by the Platform Team.

### platform-docs Repository Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  platform-docs                    📖 INTERNAL (Read All)        │
│  Architectural documentation repository                         │
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
│  └── CLAUDE.md                    # Context for Claude Code    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Example: docs/architecture/cluster-overview.md

```markdown
# EKS Cluster - Overview

## Cluster Specifications

| Aspect | Value | Notes |
|--------|-------|-------|
| Kubernetes Version | 1.32 | Upgrades scheduled quarterly |
| Region | eu-west-1 | Multi-AZ (3 availability zones) |
| Node Type | t3.medium | 2 vCPU, 4GB RAM per node |
| Node Range | 2-10 nodes | Cluster Autoscaler enabled |
| Max Pods/Node | 17 | ENI limit for t3.medium |

## Available Resources per Pod

| Category | Recommended Request | Maximum Limit |
|----------|---------------------|---------------|
| CPU (standard app) | 100m - 250m | 500m |
| Memory (standard app) | 128Mi - 256Mi | 512Mi |
| CPU (intensive worker) | 500m - 1000m | 2000m |
| Memory (intensive worker) | 512Mi - 1Gi | 2Gi |

## Storage Classes

| Name | Type | Use Case |
|------|------|----------|
| gp3 (default) | EBS gp3 | Database, persistent data |
| efs-sc | EFS | Shared storage across pods |

## Ingress

| Aspect | Value |
|--------|-------|
| Controller | AWS ALB Ingress Controller |
| SSL Termination | ALB (ACM certificates) |
| WAF | Enabled on ALB |

---

## Best Practices for this Cluster

### CPU Throttling
- The cluster uses **CPU limits**. If your app exceeds the limit, it gets throttled
- Recommendation: request = 50-70% of limit for headroom

### Memory OOMKill
- If you exceed memory limit, the pod gets killed
- Recommendation: monitor RSS in staging before prod

### Node Scheduling
- Use **Pod Anti-Affinity** if you need HA
- Nodes can be terminated with 10min notice (spot reclaim)
```

### Example: docs/best-practices/resource-requests.md

```markdown
# Resource Requests - Guide

## How to Choose Values

### Step 1: Profile in Dev/Staging

```bash
# Observe real usage for 24h
kubectl top pods -n catalog --containers

# Or Prometheus query
avg(container_cpu_usage_seconds_total{namespace="catalog"}) by (pod)
```

### Step 2: Apply Formula

| Metric | Request Formula | Limit Formula |
|--------|-----------------|---------------|
| CPU | P95 usage × 1.2 | Request × 2 |
| Memory | Max RSS × 1.3 | Request × 1.5 |

### Step 3: Configure HPA

```yaml
# For CPU-bound apps (API servers)
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
        averageUtilization: 50  # Scale before throttling
```

### Real Examples

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

## Repository Purpose

This repository contains architectural documentation
for application teams. It's READ-ONLY and maintained by the Platform Team.

## How to Use with Claude Code

When a developer asks Claude Code to optimize their app:

1. Claude reads files in this repo to understand:
   - Cluster limits (CPU, memory, storage)
   - Recommended best practices
   - Configuration examples

2. Claude applies this information to the application code

## Example Prompt for Developer

"Optimize my Helm deployment for the current cluster.
Read best practices from platform-docs and apply the correct values."

## Updates

- This repo is updated by Platform Team after every infra change
- Changelog in CHANGELOG.md
- Slack channel: #platform-announcements
```

### Workflow: Developer Optimizes with Claude Code

```
┌─────────────────────────────────────────────────────────────────┐
│           DEVELOPER OPTIMIZATION FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Developer opens catalog-service in Claude Code              │
│                                                                  │
│  2. Asks: "Optimize resources and HPA for our cluster"          │
│                                                                  │
│  3. Claude:                                                     │
│     a) Reads catalog-service/CLAUDE.md → app limits             │
│     b) Clones/reads platform-docs → cluster architecture        │
│     c) Analyzes current helm/values.yaml                        │
│     d) Proposes changes based on best practices                 │
│                                                                  │
│  4. Claude Output:                                              │
│     "Based on platform-docs documentation:                      │
│      - Cluster has t3.medium nodes (2 vCPU, 4GB)                │
│      - Recommended CPU request 250m for standard API            │
│      - HPA threshold 50% to avoid throttling                    │
│                                                                  │
│      Proposed changes to helm/values.yaml:                      │
│      - resources.requests.cpu: 100m → 250m                      │
│      - resources.limits.cpu: 200m → 500m                        │
│      - hpa.targetCPU: 70 → 50"                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Reference in Application CLAUDE.md

In each application repo CLAUDE.md, add:

```markdown
## Cluster Architecture

For information about cluster architecture and best practices:
- Repository: github.com/acme-corp/platform-docs
- Main docs:
  - docs/architecture/cluster-overview.md
  - docs/best-practices/resource-requests.md
  - docs/best-practices/hpa-configuration.md

Claude Code: when optimizing resources, first read platform-docs
to understand cluster limits and best practices.
```

### Benefits of this Approach

| Aspect | Benefit |
|--------|---------|
| **Separation** | Infra code remains private, docs are public |
| **Context for Claude** | Claude has all info to optimize |
| **Self-Service** | Developers don't need to ask Platform Team |
| **Updates** | Platform Team updates docs after every change |
| **Audit** | Versioned docs, visibility on who changed what |

---

## 7b. Alternative: Platform Repo Read-Only for Everyone

If the organization prefers **full transparency**, all repositories can be readable (internal visibility) with guardrails in the application CLAUDE.md.

### GitHub Configuration

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

### Application CLAUDE.md with Read-Only Guardrails

```markdown
# Catalog Service - CLAUDE.md

## Repository Overview

Microservice for product catalog management.

**Team Owner:** Team Catalog

---

## Cluster Architecture (Read-Only Reference)

To understand cluster architecture and optimize choices,
you can READ (but not modify) the platform repository:

| Repository | Path | What to Look For |
|------------|------|------------------|
| platform-infrastructure | terraform/eks/cluster.tf | K8s version, node types |
| platform-infrastructure | terraform/eks/nodes.tf | Node groups, scaling limits |
| platform-infrastructure | terraform/shared/rds.tf | RDS configuration |
| platform-infrastructure | terraform/shared/redis.tf | Redis cluster settings |

### How to Use

```
# ✅ ALLOWED - Read to understand architecture
git clone git@github.com:acme-corp/platform-infrastructure.git /tmp/platform-ref
cat /tmp/platform-ref/terraform/eks/nodes.tf

# ❌ BLOCKED - DO NOT create branches or PRs
# Claude must NEVER modify platform-infrastructure
```

---

## Guardrails for Claude Code

### ✅ YOU CAN DO

1. **Read platform-infrastructure** to understand:
   - Node types (t3.medium, t3.large, etc.)
   - HPA limits configured at cluster level
   - Kubernetes version
   - RDS/Redis configuration

2. **Use the info to optimize** this repo:
   - Adjust resource requests/limits
   - Configure appropriate HPA
   - Choose connection pool size based on RDS

### ❌ YOU CANNOT DO

1. **Modify platform-infrastructure**
   - Don't create files, branches or PRs in that repo
   - If a change is needed → suggest ticket to Platform Team

2. **Copy platform configurations to this repo**
   - Don't duplicate Terraform from platform
   - Use only modules exposed in platform-modules

---

## Example Workflow

Developer: "Optimize my deployment for the current cluster"

Claude:
1. Clone platform-infrastructure to /tmp (read-only)
2. Read terraform/eks/nodes.tf → t3.medium nodes (2 vCPU, 4GB)
3. Read terraform/eks/cluster.tf → EKS 1.32
4. Analyze current helm/values.yaml
5. Propose changes to helm/values.yaml (NOT to platform!)

Output:
"I read the cluster configuration from platform-infrastructure:
- Nodes: t3.medium (2 vCPU, 4GB RAM)
- Max pods per node: 17
- Cluster-wide HPA: no limit

For your catalog service, I recommend:
- CPU request: 250m (current 100m)
- CPU limit: 500m (current 200m)
- HPA target: 50% (current 70%)

Should I modify helm/values.yaml?"
```

### Complete Workflow: Read Platform → Optimize App

```
┌─────────────────────────────────────────────────────────────────┐
│     CLAUDE CODE: READ PLATFORM → OPTIMIZE APP                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Developer in catalog-service/                                  │
│  └── "Optimize resources for our cluster"                       │
│                                                                  │
│  Claude reads CLAUDE.md                                         │
│  └── Sees: "You can READ platform-infrastructure"               │
│                                                                  │
│  Claude clones platform-infrastructure (temp, read-only)        │
│  ├── Reads terraform/eks/nodes.tf                               │
│  │   └── instance_type = "t3.medium"                            │
│  ├── Reads terraform/eks/cluster.tf                             │
│  │   └── version = "1.32"                                       │
│  └── Reads terraform/shared/rds.tf                              │
│      └── max_connections = 100                                  │
│                                                                  │
│  Claude analyzes catalog-service/helm/values.yaml               │
│  └── Finds: requests.cpu = 100m, limits.cpu = 200m              │
│                                                                  │
│  Claude proposes changes to catalog-service ONLY:               │
│  ├── helm/values.yaml → resources optimized                     │
│  └── src/config/database.ts → pool size = 10 (100/10 services)  │
│                                                                  │
│  ❌ Claude does NOT touch platform-infrastructure                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Benefits vs Separate platform-docs

| Aspect | platform-docs | Read-Only Platform |
|--------|---------------|-------------------|
| **Source of Truth** | Docs can diverge | Always up-to-date (it's the code) |
| **Maintenance** | Requires docs↔code sync | Zero overhead |
| **Detail** | Only selected docs | Everything visible |
| **Risk** | No access to secrets | Secrets in tfvars (gitignored) |

### Security Considerations

To use this approach safely:

1. **Secrets in AWS Secrets Manager**, not in repo
2. **tfvars in .gitignore** (never committed)
3. **Strict branch protection** on platform repos
4. **Audit logging** on all clone/pull operations

```hcl
# ✅ SAFE - In terraform code (readable)
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "ecommerce/rds/password"
}

# ❌ NEVER - Never in repo
# variable "db_password" { default = "actual-password" }
```

---

## 8. Monitoring and Audit

### CloudTrail for Audit

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

# Alert on suspicious actions
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
# Webhook for audit GitHub → CloudWatch
# Every PR/push to platform repos is logged
```

---

## Implementation Summary

| Component | File/Resource | Owner |
|-----------|---------------|-------|
| CLAUDE.md Platform | `platform-infrastructure/CLAUDE.md` | Platform |
| CLAUDE.md Apps | `{app}-service/CLAUDE.md` | Template |
| CODEOWNERS Platform | `platform-infrastructure/.github/CODEOWNERS` | Platform |
| CODEOWNERS Apps | `{app}-service/.github/CODEOWNERS` | Template |
| IAM Roles | `platform-infrastructure/terraform/security/` | Platform |
| K8s RBAC | `platform-infrastructure/terraform/eks/rbac/` | Platform |
| Shared Pipelines | `shared-pipelines/.github/workflows/` | DevOps |
| S3 State Policies | `platform-infrastructure/terraform/bootstrap/` | Platform |

---

*Document generated: 2025-12-31*
