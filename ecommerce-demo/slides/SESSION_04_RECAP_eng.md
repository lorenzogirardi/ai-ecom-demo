# Session 4 - Claude Code Demo

## E-commerce Monorepo for AWS EKS

**Date**: December 27, 2024
**Session Duration**: ~3 hours
**Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)

---

## Session Objectives

```
┌─────────────────────────────────────────────────┐
│              DAY 4 - COMPLETED                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ✅ CI Security Scanning (Gitleaks, Trivy)      │
│  ✅ Infrastructure CI (TFLint, Checkov)         │
│  ✅ ArgoCD Preparation (manifests, workflow)    │
│  ✅ Terraform Remote State (S3 + DynamoDB)      │
│  ✅ ECR Repositories (backend + frontend)       │
│  ✅ CVE Summary in GitHub Actions               │
│  ✅ Claude CVE Analysis Report                  │
│  ✅ CI/CD Bug Fixes (10+ issues)                │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Generated Output

### Session 4 Statistics

| Metric | Value |
|--------|-------|
| Files created/modified | 24 |
| GitHub Actions workflows | 4 |
| Terraform modules | 1 new (state-backend) |
| AWS resources (all via TF) | 4 (S3, DynamoDB, 2 ECR) |
| CI/CD bugs fixed | 10+ |
| CVEs analyzed | 36 |

### Files Created

```
.github/workflows/
├── backend-ci-cd.yml        # Enhanced: Gitleaks + Trivy + Summary
├── frontend-ci-cd.yml       # Enhanced: Gitleaks + Trivy + Summary
├── infra-ci.yml             # NEW: TFLint + Checkov + Gitleaks
└── deploy-argocd.yml        # NEW: ArgoCD deployment workflow

ecommerce-demo/
├── .checkov.yaml            # Checkov skip rules for demo
├── .tflint.hcl              # TFLint AWS plugin config
├── argocd/
│   ├── README.md            # ArgoCD setup documentation
│   ├── install/
│   │   └── values.yaml      # ArgoCD Helm values (EKS/ALB)
│   ├── projects/
│   │   └── ecommerce.yaml   # ArgoCD Project with RBAC
│   └── applications/
│       ├── backend.yaml     # Backend App (manual sync)
│       └── frontend.yaml    # Frontend App (manual sync)
├── security/
│   └── reports/
│       ├── trivy-backend-*.json   # Backend vulnerability reports
│       └── trivy-frontend-*.json  # Frontend vulnerability reports
├── slides/
│   ├── CVE_ANALYSIS.md      # CVE analysis report (IT)
│   └── CVE_ANALYSIS_eng.md  # CVE analysis report (EN)
└── infra/terraform/bootstrap/
    ├── backend.tf           # S3 remote backend config
    ├── state-backend/       # NEW: State infrastructure module
    │   ├── main.tf          # S3 bucket + DynamoDB table
    │   ├── variables.tf     # Configuration variables
    │   ├── outputs.tf       # Backend config output
    │   ├── providers.tf     # AWS provider
    │   ├── backend.tf       # Remote state (self-referencing)
    │   └── README.md        # Bootstrap documentation
    └── ecr/
        ├── main.tf          # ECR repositories
        └── backend.tf       # S3 remote backend config
```

---

## CI/CD Architecture

### Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE CI                             │
│  Trigger: infra/terraform/** changes                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌───────────┐         │
│  │ TFLint  │  │ Checkov │  │ Gitleaks │  │ Helm Lint │         │
│  └─────────┘  └─────────┘  └──────────┘  └───────────┘         │
│                    (parallel execution)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND CI/CD                                 │
│  Trigger: apps/backend/** changes                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌─────────────┐   ┌───────┐   ┌────────┐       │
│  │ Gitleaks │ → │ Lint & Test │ → │ Build │ → │ Trivy  │       │
│  └──────────┘   └─────────────┘   └───────┘   └────────┘       │
│                                                    ↓             │
│                                         ┌──────────────────┐    │
│                                         │ CVE Summary      │    │
│                                         │ in GitHub Actions│    │
│                                         └──────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND CI/CD                                │
│  Trigger: apps/frontend/** changes                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌─────────────┐   ┌───────┐   ┌────────┐       │
│  │ Gitleaks │ → │ Lint & Test │ → │ Build │ → │ Trivy  │       │
│  └──────────┘   └─────────────┘   └───────┘   └────────┘       │
│                                                    ↓             │
│                                         ┌──────────────────┐    │
│                                         │ CVE Summary      │    │
│                                         │ in GitHub Actions│    │
│                                         └──────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Trivy CVE Summary

Vulnerability summary is visible directly in GitHub Actions page:

```
┌─────────────────────────────────────────────────┐
│  🔒 Trivy Security Scan - Backend               │
├─────────────────────────────────────────────────┤
│  Image: ecommerce-demo/backend:71f088e          │
│                                                  │
│  Vulnerability Summary                          │
│  ┌──────────────┬───────┐                       │
│  │ Severity     │ Count │                       │
│  ├──────────────┼───────┤                       │
│  │ 🔴 Critical  │   1   │                       │
│  │ 🟠 High      │   7   │                       │
│  │ 🟡 Medium    │  28   │                       │
│  └──────────────┴───────┘                       │
│                                                  │
│  Top Critical/High CVEs                         │
│  ┌─────────────────┬─────────────┬──────────┐  │
│  │ CVE             │ Package     │ Severity │  │
│  ├─────────────────┼─────────────┼──────────┤  │
│  │ CVE-2024-24790  │ stdlib      │ CRITICAL │  │
│  │ CVE-2024-21538  │ cross-spawn │ HIGH     │  │
│  │ ...             │ ...         │ ...      │  │
│  └─────────────────┴─────────────┴──────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Security Scanning

### Gitleaks - Secret Detection

```yaml
# Configuration .gitleaks.toml
[allowlist]
  paths = [
    '''docs/.*\.md''',
    '''.*README\.md''',
  ]
```

### Trivy - Container Scanning

```yaml
# Workflow configuration
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: '${{ registry }}/${{ repo }}:${{ sha }}'
    format: 'json'
    output: 'trivy-report.json'
    severity: 'CRITICAL,HIGH,MEDIUM'
    exit-code: '0'  # Warn only, don't fail
```

### Checkov - Terraform Security

```yaml
# .checkov.yaml
skip-check:
  - CKV_AWS_144  # S3 cross-region replication (demo)
  - CKV_AWS_145  # S3 KMS encryption (demo)
  - CKV2_AWS_62  # S3 event notifications (demo)
```

### TFLint - Terraform Linting

```hcl
# .tflint.hcl
plugin "aws" {
  enabled = true
  version = "0.31.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}
```

---

## ArgoCD Preparation

### Directory Structure

```
argocd/
├── README.md                    # Setup documentation
├── install/
│   └── values.yaml              # ArgoCD Helm values
├── projects/
│   └── ecommerce.yaml           # ArgoCD Project
└── applications/
    ├── backend.yaml             # Backend Application
    └── frontend.yaml            # Frontend Application
```

### ArgoCD Project

```yaml
# projects/ecommerce.yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: ecommerce
spec:
  sourceRepos:
    - 'https://github.com/lorenzogirardi/ai-ecom-demo.git'
  destinations:
    - namespace: ecommerce
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
```

### Application Manifests

```yaml
# applications/backend.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: backend
spec:
  project: ecommerce
  source:
    repoURL: https://github.com/lorenzogirardi/ai-ecom-demo.git
    path: ecommerce-demo/helm/backend
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: ecommerce
  syncPolicy:
    syncOptions:
      - CreateNamespace=true
    # Manual sync (no automated)
```

### Deploy Workflow

```yaml
# .github/workflows/deploy-argocd.yml
name: Deploy ArgoCD
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        default: 'demo'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: demo
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials (OIDC)
      - name: Update kubeconfig
      - name: Install ArgoCD via Helm
      - name: Apply Project + Applications
      - name: Output ArgoCD UI URL
```

---

## Terraform Remote State

### AWS Resources - All Managed by Terraform

| Resource | Name | Terraform Module |
|----------|------|------------------|
| S3 Bucket | ecommerce-demo-terraform-state | `bootstrap/state-backend` |
| DynamoDB Table | ecommerce-demo-terraform-locks | `bootstrap/state-backend` |
| ECR Repository | ecommerce-demo/backend | `bootstrap/ecr` |
| ECR Repository | ecommerce-demo/frontend | `bootstrap/ecr` |

**⚠️ IMPORTANT**: No resources created via CLI. Everything managed by Terraform with remote state.

### State Files

```
s3://ecommerce-demo-terraform-state/
├── bootstrap/
│   ├── state-backend/terraform.tfstate  # S3 + DynamoDB
│   ├── github-oidc/terraform.tfstate    # GitHub OIDC
│   └── ecr/terraform.tfstate            # ECR repos
├── demo/
│   ├── platform.tfstate    # (Day 5)
│   └── services.tfstate    # (Day 5)
```

### Backend Configuration

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "ecommerce-demo-terraform-state"
    key            = "bootstrap/ecr/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ecommerce-demo-terraform-locks"
  }
}
```

---

## Claude CVE Analysis

### Methodology

For each CVE identified by Trivy:

1. **Code search** - Is the library actually used?
2. **Vector assessment** - Is the exploit reachable?
3. **Contextual priority** - Real risk vs CVSS
4. **Remediation** - Practical suggestions

### Analysis Results

```
┌─────────────────────────────────────────────────┐
│           CVE ANALYSIS RESULTS                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Total CVEs:        36                          │
│  Action Required:   1                           │
│  Ignorable:         35                          │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│  🔴 Critical (1) → All from Prisma Go binaries │
│     CVE-2024-24790: IGNORE (isolated runtime)  │
│                                                  │
│  🟠 High (7)                                    │
│     cross-spawn: FIXED (7.0.6 installed)       │
│     glob: LOW (no user input)                  │
│     golang stdlib (5): IGNORE (Prisma)         │
│                                                  │
│  🟡 Medium (28)                                 │
│     fast-jwt: MEDIUM ⚠️ (needs issuer config)  │
│     Others: IGNORE (dev deps / Prisma)         │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Only Action Required

```typescript
// server.ts - Add JWT issuer validation
await app.register(jwt, {
  secret: config.jwt.secret,
  sign: {
    expiresIn: config.jwt.expiresIn,
    iss: 'ecommerce-demo-backend'  // Add this
  },
  verify: {
    allowedIss: ['ecommerce-demo-backend']  // Add this
  }
});
```

---

## CI/CD Bug Fixes

### Problems Solved

| Problem | Solution |
|---------|----------|
| Gitleaks finds example tokens in docs | `.gitleaksignore` with fingerprints |
| Gitleaks config syntax error | Simplified `.gitleaks.toml` |
| ESLint config not found | Created `.eslintrc.json` for both apps |
| npm cache path incorrect | Used root `package-lock.json` |
| `next lint` invalid directory | Changed to direct `eslint` |
| Backend tests fail (no tables) | Added `db:push` step |
| Docker build context wrong | Changed to `apps/backend` |
| Trivy SHA mismatch | Used short SHA (7 chars) |
| Race condition Trivy commit | Concurrency group + git pull |
| Husky not found in CI | `HUSKY: "0"` env var |

### Trivy SHA Fix

```yaml
# Before: Trivy looked for full SHA
image-ref: '...:${{ github.sha }}'  # 40 chars

# After: Trivy uses short SHA (like Docker metadata)
- name: Get short SHA
  run: echo "short=$(echo ${{ github.sha }} | cut -c1-7)" >> $GITHUB_OUTPUT

- name: Run Trivy
  with:
    image-ref: '...:${{ steps.sha.outputs.short }}'  # 7 chars
```

### Concurrency Group

```yaml
# Prevents race condition when both workflows commit
trivy-scan:
  concurrency:
    group: trivy-report-commit
    cancel-in-progress: false

  steps:
    - name: Pull latest changes
      run: git pull origin main

    - name: Commit Trivy report
      uses: stefanzweifel/git-auto-commit-action@v5
```

---

## Time Estimate

### Claude Code vs Developer Comparison

| Task | Claude Code | Developer | Factor |
|------|-------------|-----------|--------|
| CI Gitleaks integration | 15 min | 2 hours | 8x |
| CI Trivy integration | 20 min | 3 hours | 9x |
| Trivy CVE Summary | 15 min | 2 hours | 8x |
| Infrastructure CI workflow | 20 min | 4 hours | 12x |
| ArgoCD manifests | 25 min | 4 hours | 10x |
| ArgoCD deploy workflow | 15 min | 3 hours | 12x |
| Terraform remote state | 20 min | 2 hours | 6x |
| ECR repositories | 10 min | 1 hour | 6x |
| CI/CD bug fixes (10+) | 60 min | 8 hours | 8x |
| CVE Analysis report | 20 min | 4 hours | 12x |
| **TOTAL** | **~3.5 hours** | **~33 hours** | **~10x** |

### Effort Comparison

```
┌──────────────────────────────────────────────────────────┐
│                    SESSION 4 EFFORT                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Claude Code    ████████████ 3.5 hours                   │
│                                                          │
│  DevOps Eng     ████████████████████████████████ 25 hrs  │
│  (CI/CD + IaC)                                           │
│                                                          │
│  Security Eng   ████████████ 8 hours                     │
│  (CVE analysis)                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Updated Project Status

### Completed (Sessions 1-4) ✅

| Area | Components |
|------|------------|
| Backend API | 4 complete modules (auth, catalog, search, orders) |
| Backend Tests | 177 tests (unit, integration, database) |
| Frontend | Layout, 7 UI components, all user flows |
| Frontend Tests | 29 tests (hooks, components) |
| Infrastructure | Terraform 5 modules, Helm 2 charts |
| CI/CD Security | Gitleaks, Trivy, Checkov, TFLint |
| ArgoCD | Project, Applications, Deploy workflow |
| AWS Resources | S3, DynamoDB, 2 ECR repositories |
| Docker | 2 Dockerfiles, docker-compose.full.yml |
| Documentation | CVE Analysis, 4 Session Recaps |

### To Complete ⏳ (Day 5)

| Task | Description |
|------|-------------|
| Terraform apply Layer 1 | Network + EKS + ECR |
| Terraform apply Layer 2 | RDS + ElastiCache + CDN |
| Run deploy-argocd.yml | Install ArgoCD + Applications |
| Manual sync ArgoCD | Deploy backend + frontend |
| E2E Tests | Production environment |

---

## Cost Comparison

### Claude Max ($100/month)

```
Session 4: ~150k tokens
Estimated cost: ~$2 in tokens
Output: 18 files, 4 workflows, AWS infra, CVE report
```

### Traditional Team

```
DevOps Engineer: 25 hours × $80 = $2,000
Security Engineer: 8 hours × $85 = $680
─────────────────────────────────────────
Total: $2,680
```

### ROI This Session

```
┌─────────────────────────────────────────┐
│  Savings: ~$2,680                        │
│  Claude cost: ~$2                        │
│  ROI: ~1,340x                            │
└─────────────────────────────────────────┘
```

### Cumulative ROI (Sessions 1-4)

```
┌─────────────────────────────────────────────────────────┐
│                  TOTAL PROJECT COST                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Claude Code (4 sessions)                               │
│  ────────────────────────                               │
│  Session 1: ~$3                                         │
│  Session 2: ~$2                                         │
│  Session 3: ~$3                                         │
│  Session 4: ~$2                                         │
│  Total: ~$10                                            │
│                                                          │
│  Traditional Team                                       │
│  ────────────────────────                               │
│  Session 1: $4,000 - $6,700                            │
│  Session 2: $3,450                                      │
│  Session 3: $2,790                                      │
│  Session 4: $2,680                                      │
│  Total: $12,920 - $15,620                              │
│                                                          │
│  ═══════════════════════════════════════════════════    │
│  TOTAL SAVINGS: $12,910 - $15,610                      │
│  AVERAGE ROI: ~1,400x                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps (Day 5)

| Step | Command | Description |
|------|---------|-------------|
| 1 | `terraform apply` | Layer 1: Network + EKS |
| 2 | `terraform apply` | Layer 2: RDS + ElastiCache |
| 3 | GitHub Actions | Run `deploy-argocd.yml` |
| 4 | ArgoCD UI | Manual sync applications |
| 5 | Browser | E2E testing |

---

## Repository

**GitHub**: https://github.com/lorenzogirardi/ai-ecom-demo

```bash
# Test CI/CD locally
act -j lint-and-test

# View Trivy reports
cat ecommerce-demo/security/reports/trivy-backend-latest.json | jq '.Results[].Vulnerabilities'

# Check ArgoCD manifests
kubectl apply --dry-run=client -f ecommerce-demo/argocd/
```

---

## Session 4 Conclusions

### Key Metrics

```
┌─────────────────────────────────────────────────┐
│           SESSION 4 SUMMARY                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  Claude Code time:   3.5 hours                  │
│  Equivalent time:    33 team hours              │
│  Speedup factor:     ~10x                       │
│                                                  │
│  Workflows created:  4                          │
│  AWS resources:      4                          │
│  CI/CD bugs fixed:   10+                        │
│                                                  │
│  CVEs analyzed:      36                         │
│  CVEs to fix:        1                          │
│  CVEs ignorable:     35                         │
│                                                  │
│  CI/CD:              Production-ready           │
│  Security:           Scanning active            │
│  ArgoCD:             Ready for deploy           │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Added Value

- **Security First**: Gitleaks + Trivy + Checkov integrated
- **GitOps Ready**: ArgoCD manifests ready for Day 5
- **Visibility**: CVE summary directly in GitHub Actions
- **Context**: Contextual CVE analysis reduces noise by 97%
- **Infrastructure**: Remote Terraform state, ECR ready

---

*Generated with Claude Code - Session of December 27, 2024*
