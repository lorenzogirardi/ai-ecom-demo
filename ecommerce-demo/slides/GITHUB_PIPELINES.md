# GitHub Actions Pipelines - E-commerce Demo

Diagrammi delle pipeline CI/CD implementate nel progetto.

---

## Panoramica Workflows

| Workflow | Trigger | Scopo |
|----------|---------|-------|
| **Backend CI/CD** | Push/PR su `apps/backend/**` | Build, test, security scan |
| **Frontend CI/CD** | Push/PR su `apps/frontend/**` | Build, test, Lighthouse, security scan |
| **Infrastructure CI** | Push/PR su `infra/terraform/**`, `helm/**` | Lint, validate, security scan |
| **Deploy ArgoCD** | Manuale (workflow_dispatch) | Deploy ArgoCD + Applications |
| **Load Test** | Manuale (workflow_dispatch) | k6 performance testing |

---

## 1. Backend CI/CD Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant GH as GitHub
    participant GA as GitHub Actions
    participant ECR as Amazon ECR
    participant Repo as Repository

    Note over Dev,Repo: Trigger: Push/PR su apps/backend/**

    Dev->>GH: git push / PR
    GH->>GA: Trigger backend-ci-cd.yml

    par Jobs Paralleli (Stage 1)
        GA->>GA: Gitleaks<br/>Secret Detection
    and
        GA->>GA: Lint & Test
        Note over GA: PostgreSQL + Redis<br/>(services container)
        GA->>GA: npm ci
        GA->>GA: Prisma generate + push
        GA->>GA: ESLint + TypeScript
        GA->>GA: Vitest (177 tests)
    end

    alt Tutti i job passati
        Note over GA,ECR: Solo su push (non PR)
        GA->>GA: Docker Build
        GA->>ECR: Login via OIDC
        GA->>ECR: Push image<br/>:sha, :branch, :latest

        GA->>ECR: Pull image for scan
        GA->>GA: Trivy Scan<br/>(CRITICAL, HIGH, MEDIUM)
        Note over GA: exit-code: 0<br/>(warn only, no block)

        GA->>Repo: Commit trivy-backend-*.json
        GA->>GH: Upload artifact<br/>(30 days retention)
        GA->>GH: Generate Summary<br/>(CVE table)
    else Job fallito
        GA-->>Dev: Notifica failure
    end
```

---

## 2. Frontend CI/CD Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant GH as GitHub
    participant GA as GitHub Actions
    participant ECR as Amazon ECR
    participant Repo as Repository

    Note over Dev,Repo: Trigger: Push/PR su apps/frontend/**

    Dev->>GH: git push / PR
    GH->>GA: Trigger frontend-ci-cd.yml

    par Jobs Paralleli (Stage 1)
        GA->>GA: Gitleaks<br/>Secret Detection
    and
        GA->>GA: Lint & Test
        GA->>GA: npm ci
        GA->>GA: ESLint + TypeScript
        GA->>GA: Vitest (29 tests)
    end

    GA->>GA: Lighthouse Audit
    Note over GA: Build Next.js app
    GA->>GA: Performance score
    GA->>GA: Accessibility score
    GA->>GA: Best Practices score
    GA->>GA: SEO score
    GA->>GH: Upload lighthouse reports

    alt Tutti i job passati
        Note over GA,ECR: Solo su push (non PR)
        GA->>GA: Docker Build
        GA->>ECR: Login via OIDC
        GA->>ECR: Push image<br/>:sha, :branch, :latest

        GA->>ECR: Pull image for scan
        GA->>GA: Trivy Scan<br/>(CRITICAL, HIGH, MEDIUM)

        GA->>Repo: Commit trivy-frontend-*.json
        GA->>GH: Upload artifact
        GA->>GH: Generate Summary
    else Job fallito
        GA-->>Dev: Notifica failure
    end
```

---

## 3. Infrastructure CI Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant GH as GitHub
    participant GA as GitHub Actions
    participant Repo as Repository

    Note over Dev,Repo: Trigger: Push/PR su infra/terraform/**, helm/**

    Dev->>GH: git push / PR
    GH->>GA: Trigger infra-ci.yml

    par Jobs Paralleli (Stage 1)
        GA->>GA: Gitleaks<br/>Secret Detection
    and
        GA->>GA: TFLint
        Note over GA: Lint modules/<br/>platform/<br/>services/
    and
        GA->>GA: Checkov Security
        Note over GA: Terraform scan<br/>Helm scan
        GA->>GH: Upload SARIF
    and
        GA->>GA: Helm Lint
        GA->>GA: helm lint backend
        GA->>GA: helm lint frontend
        GA->>GA: helm template (validate)
    end

    alt Push event (non PR)
        GA->>GA: Terraform Format
        GA->>GA: terraform fmt -recursive
        GA->>Repo: Auto-commit<br/>formatted files
    end

    GA->>GA: Terraform Validate
    Note over GA: terraform init<br/>terraform validate<br/>per ogni modulo
```

---

## 4. Deploy ArgoCD Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Op as Operator
    participant GH as GitHub
    participant GA as GitHub Actions
    participant AWS as AWS (OIDC)
    participant EKS as EKS Cluster
    participant Argo as ArgoCD

    Note over Op,Argo: Trigger: Manuale (workflow_dispatch)

    Op->>GH: Run workflow<br/>action: install/upgrade/uninstall
    GH->>GA: Trigger deploy-argocd.yml

    Note over GA: Environment: demo<br/>(requires approval)

    GA->>AWS: Assume Role via OIDC
    AWS-->>GA: Temporary credentials
    GA->>EKS: aws eks update-kubeconfig

    alt action = install/upgrade
        GA->>EKS: Create namespace argocd
        GA->>EKS: helm upgrade --install<br/>argo/argo-cd v7.3.3
        GA->>EKS: Wait for argocd-server

        GA->>EKS: Apply Project<br/>ecommerce.yaml
        GA->>EKS: Apply Applications<br/>backend.yaml<br/>frontend.yaml

        GA->>EKS: Get admin password
        GA->>EKS: Get Ingress URL

        alt sync_apps = true
            GA->>Argo: argocd app sync backend
            GA->>Argo: argocd app sync frontend
        else sync_apps = false
            Note over GA,Argo: Manual sync required
        end

        GA->>GH: Generate Summary<br/>(URL, credentials)
    else action = uninstall
        GA->>EKS: Delete Applications
        GA->>EKS: Delete Project
        GA->>EKS: helm uninstall argocd
        GA->>EKS: Delete namespace
    end
```

---

## 5. Load Test Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Op as Operator
    participant GH as GitHub
    participant GA as GitHub Actions
    participant App as Application<br/>(CloudFront)

    Note over Op,App: Trigger: Manuale (workflow_dispatch)

    Op->>GH: Run workflow
    Note over Op: test_type: quick/load/stress/smoke<br/>vus: 20<br/>base_url: CloudFront

    GH->>GA: Trigger load-test.yml
    GA->>GA: Install k6 v0.49.0

    alt test_type = smoke
        GA->>App: Health check (30s)
        Note over GA,App: 5 VUs, basic endpoints
    else test_type = quick
        GA->>App: Quick load test (3.5 min)
        Note over GA,App: Configurable VUs
    else test_type = load
        GA->>App: Standard load test (9 min)
        Note over GA,App: Ramp up/down pattern
    else test_type = stress
        GA->>App: Stress test (13 min)
        Note over GA,App: Up to MAX_VUS<br/>Find breaking point
    end

    App-->>GA: Response metrics

    GA->>GA: Generate HTML report
    GA->>GH: Upload artifact<br/>(30 days retention)
    GA->>GH: Generate Summary
```

---

## 6. Architettura Completa CI/CD

```mermaid
flowchart TB
    subgraph Triggers["Trigger Events"]
        Push[Push to main/develop]
        PR[Pull Request]
        Manual[Manual Dispatch]
    end

    subgraph CI["Continuous Integration"]
        subgraph Security["Security Scanning"]
            Gitleaks[Gitleaks<br/>Secret Detection]
            Trivy[Trivy<br/>Container Scan]
            Checkov[Checkov<br/>IaC Security]
        end

        subgraph Quality["Code Quality"]
            Lint[ESLint + TypeScript]
            Test[Vitest Tests]
            TFLint[TFLint]
            HelmLint[Helm Lint]
            Lighthouse[Lighthouse<br/>Audit]
        end

        subgraph Build["Build"]
            Docker[Docker Build]
            TFValidate[Terraform Validate]
        end
    end

    subgraph Registry["Container Registry"]
        ECR[(Amazon ECR)]
    end

    subgraph CD["Continuous Deployment"]
        ArgoCD[ArgoCD]
        K8s[Kubernetes/EKS]
    end

    subgraph Testing["Performance Testing"]
        K6[k6 Load Tests]
    end

    Push --> CI
    PR --> CI
    Manual --> ArgoCD
    Manual --> K6

    Gitleaks --> Docker
    Lint --> Docker
    Test --> Docker
    Docker --> ECR
    ECR --> Trivy
    Trivy --> ArgoCD

    TFLint --> TFValidate
    Checkov --> TFValidate
    HelmLint --> ArgoCD

    ArgoCD --> K8s
    K6 --> K8s
```

---

## Job Dependencies

### Backend CI/CD
```
gitleaks ─────┐
              ├──> build ──> trivy-scan
lint-and-test ┘
```

### Frontend CI/CD
```
gitleaks ─────┐
              ├──> build ──> trivy-scan
lint-and-test ┘
      │
      └──> lighthouse
```

### Infrastructure CI
```
gitleaks ────┐
tflint ──────┤ (parallel)
checkov ─────┤
helm-lint ───┘
      │
terraform-fmt ──> terraform-validate
```

---

## Secrets e Variabili

| Nome | Tipo | Uso |
|------|------|-----|
| `AWS_ROLE_ARN` | Secret | OIDC role per AWS |
| `GITHUB_TOKEN` | Auto | Commit, artifacts |
| `NEXT_PUBLIC_API_URL` | Variable | Frontend build arg |

---

## Artifacts Prodotti

| Workflow | Artifact | Retention |
|----------|----------|-----------|
| Backend CI | `trivy-backend-report` | 30 giorni |
| Frontend CI | `trivy-frontend-report` | 30 giorni |
| Frontend CI | `lighthouse-reports` | 30 giorni |
| Load Test | `k6-reports-*` | 30 giorni |

---

## File di Configurazione

| File | Scopo |
|------|-------|
| `.checkov.yaml` | Skip rules per Checkov |
| `.tflint.hcl` | Plugin AWS per TFLint |
| `.gitleaks.toml` | Allowlist per Gitleaks |
| `lighthouserc.json` | Configurazione Lighthouse |

---

*Documento generato: 2025-12-31*
