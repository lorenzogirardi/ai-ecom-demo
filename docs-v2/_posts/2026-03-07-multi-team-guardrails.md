---
layout: post
title: "Multi-Team Guardrails"
date: 2026-03-07
category: technical
order: 7
reading_time: 24
tags: [enterprise,teams,codeowners,iam]
---


Complete guide for implementing guardrails in an enterprise multi-repo context with Claude Code.

---

## Organizational Context

### Teams and Responsibilities

| Team | Size | Manages | Responsibility |
|------|------|---------|----------------|
| **Platform Team** | 3-5 engineers | VPC, EKS, RDS, Security | Uptime, Compliance |
| **DevOps Team** | 2-4 engineers | CI/CD, Helm, Monitoring | Support all teams |
| **Team Catalog** | 4 developers | catalog-service | Product catalog |
| **Team Orders** | 4 developers | orders-service | Order management |
| **Team Payments** | 3 developers | payments-service | Payments |

### Responsibility Hierarchy

```
Platform Team (core infrastructure)
       ↓
DevOps Team (pipelines and deploy)
       ↓
Application Teams (application code)
```

---

## Multi-Repo Architecture

### Repositories by Category

| Category | Repository | Access | Description |
|----------|------------|--------|-------------|
| **Platform** | `platform-infrastructure` | Platform Team only | Terraform for VPC, EKS, RDS, IAM |
| **Platform** | `platform-modules` | Platform Team only | Reusable Terraform modules |
| **DevOps** | `shared-helm-charts` | DevOps + Platform read | Helm chart templates |
| **DevOps** | `shared-pipelines` | DevOps + Platform read | Reusable GitHub Actions |
| **App** | `catalog-service` | Team Catalog | Catalog microservice |
| **App** | `orders-service` | Team Orders | Orders microservice |
| **App** | `payments-service` | Team Payments | Payments microservice |

### Platform Repository Content

**platform-infrastructure:**

| Directory | Content |
|-----------|---------|
| `terraform/bootstrap/` | S3, DynamoDB, OIDC |
| `terraform/network/` | VPC, Subnets, NAT |
| `terraform/eks/` | Cluster, Node Groups |
| `terraform/security/` | IAM, Security Groups |
| `terraform/shared/` | RDS, ElastiCache, ECR |
| `CLAUDE.md` | Context for Claude Code |
| `CODEOWNERS` | Approval rules |

### Application Repository Content

**catalog-service:**

| Directory | Content |
|-----------|---------|
| `src/` | Application code |
| `helm/` | Deploy values (values-dev, values-prod) |
| `infra/terraform/` | Platform modules only |
| `.github/workflows/` | CI/CD (uses shared-pipelines) |
| `CLAUDE.md` | Context for Claude Code |

---

## 1. CLAUDE.md for Each Repo

### Example: platform-infrastructure/CLAUDE.md

```markdown
# Platform Infrastructure - CLAUDE.md

## Repository Overview

This repository contains core AWS infrastructure managed by the Platform Team.

**Team Owner:** Platform Team
**Criticality:** HIGH - Downtime impacts all services
**Change Frequency:** Low (weekly/monthly)

## Who Can Modify

| Role | Permissions |
|------|-------------|
| Platform Team | Full access |
| DevOps Team | Read-only |
| Developers | No access |

## Repository Structure

| Directory | Layer | Description |
|-----------|-------|-------------|
| `terraform/bootstrap/` | Layer 0 | State backend, OIDC - Modify ONLY for initial setup |
| `terraform/network/` | Layer 1 | VPC, Subnets - Changes require maintenance window |
| `terraform/eks/` | Layer 1 | Kubernetes Cluster - UPGRADE = POSSIBLE DOWNTIME |
| `terraform/security/` | Layer 1 | IAM, Security Groups - Requires Security Review |
| `terraform/shared/` | Layer 2 | RDS, ElastiCache, ECR - Impacts all application teams |

## Critical Rules for Claude Code

### NEVER DO

1. **EKS Upgrade** without approved runbook
2. **Modify Security Groups** without security review
3. **Change VPC CIDR or Subnet allocation**
4. **Modify IAM Policies** production without audit
5. **Terraform destroy** on production resources

### CAUTION

1. **RDS/ElastiCache changes** can cause restart
2. **Node Group updates** cause rolling restart

### SAFE OPERATIONS

1. Adding new tags
2. Increasing capacity (scale up)
3. Adding new ECR repositories
4. Creating new Secrets Manager paths

## Managed Resources

| Resource | Terraform Path | Criticality |
|----------|----------------|-------------|
| VPC | network/vpc.tf | CRITICAL |
| EKS Cluster | eks/cluster.tf | CRITICAL |
| Node Groups | eks/nodes.tf | HIGH |
| RDS Cluster | shared/rds.tf | HIGH |
| ElastiCache | shared/redis.tf | MEDIUM |
| ECR Repos | shared/ecr.tf | LOW |

## Emergency Contacts

- Platform On-Call: #platform-oncall
- Escalation: platform-lead@company.com
```

---

### Example: catalog-service/CLAUDE.md

```markdown
# Catalog Service - CLAUDE.md

## Repository Overview

Microservice for product catalog management.

**Team Owner:** Team Catalog
**Criticality:** MEDIUM
**Dependencies:** RDS (read), Redis (cache), S3 (images)

## Who Can Modify

| Role | Permissions |
|------|-------------|
| Team Catalog | Full access |
| DevOps Team | CI/CD, Helm review |
| Platform Team | Read-only |

## Repository Structure

| Directory | Content | Note |
|-----------|---------|------|
| `src/` | controllers/, services/, tests/ | Full access |
| `helm/` | values.yaml, values-prod.yaml | prod requires review |
| `infra/terraform/` | main.tf, variables.tf | Platform modules only |
| `.github/workflows/` | ci-cd.yml | Uses shared-pipelines |

## Rules for Claude Code

### YOU CAN DO

1. Modify everything in `src/`
2. Modify `helm/values*.yaml`
3. Use modules from `platform-modules`

### YOU CANNOT DO

1. Create AWS resources directly (no `resource "aws_*"`)
2. Modify other teams' namespaces
3. Bypass platform modules

### REQUIRES REVIEW

1. Changes to `values-prod.yaml` → DevOps approval
2. New infra dependencies → Platform Team ticket

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

CODEOWNERS is a GitHub file that defines who must approve PRs for specific paths.

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

**Explanation:**
- Any change requires approval from `@platform-team`
- Critical paths (EKS, security, network) require `@platform-leads`
- Security changes also require `@security-team`

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

**Explanation:**
- Application team approves their own code
- Infra and production changes require DevOps

---

## 3. IAM Isolation

Each GitHub repository has a dedicated IAM Role with limited permissions.

### IAM Roles Structure

| Role | Trust (GitHub Repo) | Permissions |
|------|---------------------|-------------|
| `PlatformDeployRole` | `platform-infrastructure:*` | AdministratorAccess |
| `DevOpsDeployRole` | `shared-*:*` | ECR, EKS deploy, Secrets read |
| `AppDeployRole-Catalog` | `catalog-service:*` | Only namespace `catalog` |
| `AppDeployRole-Orders` | `orders-service:*` | Only namespace `orders` |
| `AppDeployRole-Payments` | `payments-service:*` | Only namespace `payments` |

### AppDeployRole Permissions (per team)

| Action | Permission | Scope |
|--------|------------|-------|
| ECR push/pull | ✅ | Own repository only |
| EKS deploy | ✅ | Own namespace only |
| Secrets Manager read | ✅ | Own path only (`/{team}/*`) |
| VPC modify | ❌ | Blocked |
| RDS modify | ❌ | Blocked |
| EKS cluster modify | ❌ | Blocked |

### Terraform for IAM Roles

```hcl
# terraform/security/github-oidc.tf

# OIDC Provider for GitHub Actions
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
      # ECR - Own repository only
      {
        Effect = "Allow"
        Action = ["ecr:*"]
        Resource = "arn:aws:ecr:*:*:repository/${each.key}-service"
      },
      # EKS - Cluster access (deploy only)
      {
        Effect = "Allow"
        Action = ["eks:DescribeCluster"]
        Resource = "*"
      },
      # Secrets Manager - Own path only
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
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

### Deploy Workflow with Validation

The workflow verifies that each repo can only deploy to its own namespace.

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
            *)
              echo "Repository not authorized for deploy"
              exit 1
              ;;
          esac

          echo "namespace=$ALLOWED_NS" >> $GITHUB_OUTPUT
          echo "role_arn=$ROLE_ARN" >> $GITHUB_OUTPUT

  security-gate:
    needs: validate
    if: inputs.environment == 'prod'
    environment: production  # Requires manual approval
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

          # Verify access to own namespace
          if kubectl auth can-i create deployments -n $NAMESPACE; then
            echo "Access to $NAMESPACE confirmed"
          else
            exit 1
          fi

          # Verify NO access to other namespaces
          if kubectl auth can-i create deployments -n kube-system 2>/dev/null; then
            echo "ERROR: Access to kube-system should not be allowed"
            exit 1
          fi

      - name: Deploy with Helm
        run: |
          helm upgrade --install ${{ inputs.app_name }} ./helm \
            --namespace ${{ needs.validate.outputs.namespace }} \
            --values ./helm/values-${{ inputs.environment }}.yaml
```

---

## 5. Complete Flow - Scenarios

### Scenario 1: Developer modifies app code

| Step | Action | Result |
|------|--------|--------|
| 1 | Dev opens `catalog-service` in Claude Code | Claude reads CLAUDE.md |
| 2 | Dev: "add endpoint /products/featured" | Claude modifies `src/` |
| 3 | Push → PR | CODEOWNERS: Team Catalog approves |
| 4 | CI → Deploy dev | ✅ SUCCESS |

### Scenario 2: Developer tries to modify platform infra

| Step | Action | Result |
|------|--------|--------|
| 1 | Dev opens `catalog-service` in Claude Code | Claude reads CLAUDE.md |
| 2 | Dev: "increase RDS database CPU" | Claude sees limit in CLAUDE.md |
| 3 | Claude responds | "Cannot modify RDS. Open ticket to Platform Team." |

### Scenario 3: Developer tries bypass via Terraform

| Step | Action | Result |
|------|--------|--------|
| 1 | Dev creates `infra/terraform/rds.tf` | `resource "aws_rds_cluster" {}` |
| 2 | Push → CI → terraform plan | ❌ DENIED by IAM Policy |
| 3 | Error | "AccessDenied: User github-catalog-deploy is not authorized" |

### Scenario 4: Platform Team modifies EKS

| Step | Action | Result |
|------|--------|--------|
| 1 | Platform eng opens `platform-infrastructure` | Claude reads CLAUDE.md |
| 2 | Eng: "upgrade EKS to 1.32" | Claude sees critical rules |
| 3 | Claude responds | "EKS upgrade requires: maintenance window, runbook, 2 approvals" |

---

## 6. Onboarding New Team

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
terraform apply

# 4. Create Secrets Manager path
terraform apply
```

### Create Repo from Template

```bash
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

**Problem:** The `platform-infrastructure` repositories are restricted, but application teams need to understand the architecture to optimize their choices.

**Solution:** Public documentation repository managed by the Platform Team.

### platform-docs Repository Structure

| Directory | Content |
|-----------|---------|
| `docs/architecture/` | cluster-overview.md, networking.md, storage-classes.md |
| `docs/capabilities/` | compute.md, databases.md, caching.md, secrets.md |
| `docs/best-practices/` | resource-requests.md, hpa-configuration.md, health-checks.md |
| `docs/examples/` | helm-values/, hpa-configs/, resource-configs/ |
| `CLAUDE.md` | Context for Claude Code |

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

## Best Practices

- **CPU Throttling:** request = 50-70% of limit for headroom
- **Memory OOMKill:** monitor RSS in staging before prod
- **Pod Anti-Affinity:** use for HA
```

### Workflow: Developer Optimizes with Claude Code

| Step | Action |
|------|--------|
| 1 | Developer opens `catalog-service` in Claude Code |
| 2 | Asks: "Optimize resources and HPA for our cluster" |
| 3 | Claude reads `catalog-service/CLAUDE.md` → sees reference to platform-docs |
| 4 | Claude reads `platform-docs/docs/architecture/cluster-overview.md` |
| 5 | Claude proposes: CPU request 250m, limit 500m, HPA target 50% |

### Reference in Application CLAUDE.md

```markdown
## Cluster Architecture

For information about architecture and best practices:
- Repository: github.com/acme-corp/platform-docs
- Main docs:
  - docs/architecture/cluster-overview.md
  - docs/best-practices/resource-requests.md

Claude Code: when optimizing resources, first read platform-docs.
```

---

## 7b. Alternative: Platform Repo Read-Only for Everyone

If the organization prefers **full transparency**, all repositories can be readable (internal visibility) with guardrails in the application CLAUDE.md.

### GitHub Configuration

| Repository | Visibility | Write Access | Branch Protection |
|------------|------------|--------------|-------------------|
| `platform-infrastructure` | Internal | Platform Team only | 2 platform-leads |
| `catalog-service` | Internal | Team Catalog only | 1 team member |

### Application CLAUDE.md with Read-Only Guardrails

```markdown
# Catalog Service - CLAUDE.md

## Cluster Architecture (Read-Only Reference)

To understand cluster architecture and optimize choices,
you can READ (but not modify) the platform repository:

| Repository | Path | What to Look For |
|------------|------|------------------|
| platform-infrastructure | terraform/eks/cluster.tf | K8s version, node types |
| platform-infrastructure | terraform/eks/nodes.tf | Node groups, scaling limits |
| platform-infrastructure | terraform/shared/rds.tf | RDS configuration |

## Guardrails for Claude Code

### YOU CAN DO
- Read platform-infrastructure to understand architecture
- Use the info to optimize this repo

### YOU CANNOT DO
- Modify platform-infrastructure (no branch, no PR)
- Copy platform configurations to this repo
```

### Workflow: Read Platform → Optimize App

| Step | Action |
|------|--------|
| 1 | Developer: "Optimize resources for our cluster" |
| 2 | Claude reads CLAUDE.md → "You can READ platform-infrastructure" |
| 3 | Claude clones platform-infrastructure (temp, read-only) |
| 4 | Reads `terraform/eks/nodes.tf` → `t3.medium` |
| 5 | Proposes changes to `catalog-service/helm/values.yaml` ONLY |

### Benefits vs Separate platform-docs

| Aspect | platform-docs | Read-Only Platform |
|--------|---------------|-------------------|
| Source of Truth | Docs can diverge | Always up-to-date |
| Maintenance | Requires docs↔code sync | Zero overhead |
| Detail | Only selected docs | Everything visible |

### Security

```hcl
# SAFE - In terraform code (readable)
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "ecommerce/rds/password"
}

# NEVER - Never in repo
# variable "db_password" { default = "actual-password" }
```

---

## 8. Monitoring and Audit

### CloudTrail for Audit

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
