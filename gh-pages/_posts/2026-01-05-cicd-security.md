---
layout: post
title: "CI/CD Enterprise-Grade: Security by Design"
date: 2026-01-05
category: Security
reading_time: 10
tags: [github-actions, security, trivy, argocd, gitops]
excerpt: "Building enterprise-grade CI/CD pipelines with security scanning baked in. Trivy, Checkov, Gitleaks, and contextual CVE analysis with AI."
takeaway: "Security is not an afterthought. With AI, CVE analysis becomes contextual and actionable in minutes, not days."
---

## Day 4: Security-First CI/CD

Most teams bolt security onto the end of their pipeline. We built it in from the start.

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE CI                         │
│  Trigger: infra/terraform/** changes                        │
├─────────────────────────────────────────────────────────────┤
│  TFLint → Checkov → Gitleaks → Helm Lint  (parallel)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    APP CI/CD (Backend/Frontend)              │
├─────────────────────────────────────────────────────────────┤
│  Gitleaks → Lint → Test → Build → Trivy → Push ECR          │
│                                      ↓                       │
│                          security/reports/trivy-*.json       │
│                          (for AI CVE analysis)               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ARGOCD (GitOps CD)                        │
├─────────────────────────────────────────────────────────────┤
│  Helm charts → ArgoCD sync → Kubernetes deployment           │
└─────────────────────────────────────────────────────────────┘
```

## Security Scanners

### 1. Gitleaks - Secret Detection

```yaml
# .github/workflows/backend-ci.yml
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What it catches:**
- API keys in code
- Hardcoded passwords
- Private keys
- AWS credentials

### 2. Trivy - Container Vulnerability Scanning

```yaml
- name: Scan container image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.IMAGE }}:${{ github.sha }}
    format: 'json'
    output: 'trivy-report.json'
    severity: 'CRITICAL,HIGH,MEDIUM'

- name: Upload Trivy report
  uses: actions/upload-artifact@v4
  with:
    name: trivy-report
    path: trivy-report.json
```

### 3. Checkov - Infrastructure as Code Scanning

```yaml
# .github/workflows/infra-ci.yml
- name: Run Checkov
  uses: bridgecrewio/checkov-action@master
  with:
    directory: infra/terraform
    framework: terraform
    config_file: .checkov.yaml
```

**Checkov configuration:**

```yaml
# .checkov.yaml
skip-check:
  - CKV_AWS_144  # S3 cross-region replication (not needed for demo)
  - CKV_AWS_145  # S3 KMS encryption (using AES256)
  - CKV_AWS_79   # EBS encryption (handled by EKS)
```

### 4. TFLint - Terraform Linting

```yaml
- name: Setup TFLint
  uses: terraform-linters/setup-tflint@v4

- name: Run TFLint
  run: |
    tflint --init
    tflint --recursive --format compact
```

## CVE Analysis with AI

### The Traditional Approach

1. Scanner reports 36 CVEs
2. Security team spends days reviewing
3. Most are false positives or unexploitable
4. Real issues get buried in noise

### The AI-Augmented Approach

After Trivy runs, we use Claude Code for **contextual analysis**:

```
Analyze security/reports/trivy-backend-latest.json

For each CVE:
1. Search the codebase for usage of the affected library
2. Determine if the attack vector is exposed
3. Assess exploitability in our context
4. Prioritize based on actual risk
5. Suggest specific remediation
```

### Real Example: 36 CVEs → 1 Action

From our backend scan:

| Severity | Count | After Analysis |
|----------|-------|----------------|
| Critical | 2 | 0 actionable |
| High | 8 | 1 actionable |
| Medium | 26 | 0 actionable |

**The one actionable issue:**

```
CVE-2024-XXXX in fast-jwt
Severity: HIGH
Issue: JWT issuer validation can be bypassed

Analysis: We use fast-jwt for JWT validation.
The issuer validation bypass IS exploitable in our code.

Remediation:
1. Update fast-jwt to 4.0.1+
2. Add explicit issuer check in auth middleware
```

**Why others weren't actionable:**

- CVE in unused transitive dependency
- Attack vector requires local access (we're containerized)
- Vulnerable function not called in our code
- Already mitigated by our configuration

## GitHub Actions Workflows

### Backend CI

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI

on:
  push:
    paths:
      - 'apps/backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    paths:
      - 'apps/backend/**'

concurrency:
  group: backend-${{ github.ref }}
  cancel-in-progress: true

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  test:
    runs-on: ubuntu-latest
    needs: security
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    needs: test
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push
        run: |
          docker build -t $ECR_REGISTRY/backend:${{ github.sha }} .
          docker push $ECR_REGISTRY/backend:${{ github.sha }}

      - name: Scan with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.ECR_REGISTRY }}/backend:${{ github.sha }}
          format: 'json'
          output: 'trivy-report.json'

      - name: Upload security report
        uses: actions/upload-artifact@v4
        with:
          name: trivy-backend-${{ github.sha }}
          path: trivy-report.json
```

### Infrastructure CI

```yaml
# .github/workflows/infra-ci.yml
name: Infrastructure CI

on:
  push:
    paths:
      - 'infra/terraform/**'
  pull_request:
    paths:
      - 'infra/terraform/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Setup TFLint
        uses: terraform-linters/setup-tflint@v4

      - name: Terraform Init
        run: terraform init -backend=false
        working-directory: infra/terraform/environments/demo/platform

      - name: TFLint
        run: tflint --recursive

      - name: Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: infra/terraform
          config_file: .checkov.yaml
          output_format: cli
          soft_fail: false

      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Helm Lint
        run: |
          helm lint helm/backend
          helm lint helm/frontend
```

## ArgoCD GitOps

### Project Definition

```yaml
# argocd/projects/ecommerce.yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: ecommerce
  namespace: argocd
spec:
  description: E-commerce application project

  sourceRepos:
    - 'https://github.com/lorenzogirardi/ai-ecom-demo.git'

  destinations:
    - namespace: ecommerce
      server: https://kubernetes.default.svc

  clusterResourceWhitelist:
    - group: ''
      kind: Namespace

  namespaceResourceWhitelist:
    - group: ''
      kind: '*'
    - group: apps
      kind: '*'
    - group: networking.k8s.io
      kind: '*'
```

### Application Manifests

```yaml
# argocd/applications/backend.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: backend
  namespace: argocd
spec:
  project: ecommerce

  source:
    repoURL: https://github.com/lorenzogirardi/ai-ecom-demo.git
    targetRevision: main
    path: helm/backend
    helm:
      valueFiles:
        - values-demo.yaml

  destination:
    server: https://kubernetes.default.svc
    namespace: ecommerce

  syncPolicy:
    syncOptions:
      - CreateNamespace=true
    # Manual sync - no automated deployment
```

## Results

| Metric | Value |
|--------|-------|
| Workflows | 4 (backend, frontend, infra, argocd) |
| Security Scanners | 4 (Gitleaks, Trivy, Checkov, TFLint) |
| CVE Analysis Time | ~10 minutes (vs days) |
| False Positive Rate | 97% filtered by AI |

---

*Next: [AWS Production Deploy: Terraform Layers](/blog/aws-deploy/)*
