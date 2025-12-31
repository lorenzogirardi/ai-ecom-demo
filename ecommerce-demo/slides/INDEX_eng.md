# Documentation Index - E-commerce Demo

Complete index of all project documentation.

---

## Quick Navigation

| Category | Documents |
|----------|-----------|
| [Session Recaps](#session-recaps) | 7 development sessions |
| [Architecture](#architecture) | 4 documents with diagrams |
| [Technical Documentation](#technical-documentation) | 6 specific documents |

---

## Session Recaps

Summaries of project development sessions.

| # | Document | Content |
|---|----------|---------|
| 1 | [SESSION_01_RECAP_eng.md](./SESSION_01_RECAP_eng.md) | **Backend Foundation** - Fastify setup, Prisma schema, auth/catalog/search/orders modules, middleware, Docker |
| 2 | [SESSION_02_RECAP_eng.md](./SESSION_02_RECAP_eng.md) | **Frontend Development** - Next.js 16, React components, hooks, API client, auth context, product/cart pages |
| 3 | [SESSION_03_RECAP_eng.md](./SESSION_03_RECAP_eng.md) | **Testing & Infrastructure** - 206 tests (Vitest), Dockerfile, Helm charts, GitHub Actions CI/CD base |
| 4 | [SESSION_04_RECAP_eng.md](./SESSION_04_RECAP_eng.md) | **Security & GitOps** - Gitleaks, Trivy, Checkov, ArgoCD config, Terraform layers, CVE analysis |
| 5 | [SESSION_05_RECAP_eng.md](./SESSION_05_RECAP_eng.md) | **AWS Deployment** - EKS cluster, RDS, ElastiCache, CloudFront, External Secrets, ArgoCD deploy |
| 6 | [SESSION_06_RECAP_eng.md](./SESSION_06_RECAP_eng.md) | **Load Testing** - k6 scenarios, Cluster Autoscaler, CloudWatch metrics, bottleneck analysis |
| 7 | [SESSION_07_RECAP_eng.md](./SESSION_07_RECAP_eng.md) | **Performance Optimization** - Pod Anti-Affinity, HPA tuning, +134% throughput, -42% latency |

> **Italian versions:** Each document has an Italian version without the `_eng` suffix

---

## Architecture

System architecture diagrams.

| Document | Diagrams | Content |
|----------|----------|---------|
| [ENTERPRISE_ARCHITECTURE_eng.md](./ENTERPRISE_ARCHITECTURE_eng.md) | 14 | **Enterprise View** - C4 model, DevOps pipeline, layered architecture, security, scalability, monitoring, cost breakdown, technology stack |
| [AWS_ARCHITECTURE_eng.md](./AWS_ARCHITECTURE_eng.md) | 10 | **AWS Infrastructure** - Network topology, traffic flow, EKS architecture, security groups, IAM/IRSA, secrets management, Terraform layers |
| [GITHUB_PIPELINES_eng.md](./GITHUB_PIPELINES_eng.md) | 6 | **CI/CD Pipelines** - Backend CI, Frontend CI, Infra CI, ArgoCD deploy, Load test workflow, job dependencies |
| [SEQUENCE_DIAGRAMS_eng.md](./SEQUENCE_DIAGRAMS_eng.md) | 10 | **Application Flows** - Login, registration, products, categories, cart, checkout, orders, search, autocomplete, proxy pattern |

> **Italian versions:** Each document has an Italian version without the `_eng` suffix

---

## Technical Documentation

Specific technical documents.

| Document | Content |
|----------|---------|
| [ORIGINAL_IDEA_eng.md](./ORIGINAL_IDEA_eng.md) | **Vision & Requirements** - Original project idea, functional requirements, tech stack, execution plan |
| [CVE_ANALYSIS_eng.md](./CVE_ANALYSIS_eng.md) | **Security Analysis** - Contextual analysis of 36 CVEs detected by Trivy, prioritization, remediation |
| [K8S_UPGRADE_eng.md](./K8S_UPGRADE_eng.md) | **EKS Upgrade** - Upgrade from 1.29 to 1.32, AL2→AL2023 migration, downtime vs zero-downtime decision rationale |
| [CLUSTER_AUTOSCALER_eng.md](./CLUSTER_AUTOSCALER_eng.md) | **Autoscaling** - Cluster Autoscaler setup with IRSA, configuration, scale policies |
| [CLOUDWATCH_STRESS_ANALYSIS_eng.md](./CLOUDWATCH_STRESS_ANALYSIS_eng.md) | **Metrics Analysis** - k6 metrics correlation with CloudWatch, bottleneck identification (CPU 97%) |
| [LOAD_TEST_ANALYSIS_RATE_ON_eng.md](./LOAD_TEST_ANALYSIS_RATE_ON_eng.md) | **Rate Limit Testing** - Testing with rate limiting enabled, bypass header configuration |

> **Italian versions:** Each document has an Italian version without the `_eng` suffix

---

## Documentation Statistics

```
📁 slides/
├── 📄 Session Recaps     7 documents × 2 languages = 14 files
├── 📄 Architecture       4 documents × 2 languages =  8 files
├── 📄 Technical Docs     6 documents × 2 languages = 12 files
├── 📄 Index              1 document  × 2 languages =  2 files
└── ────────────────────────────────────────────────────────
    TOTAL                18 documents × 2 languages = 36 files
```

| Metric | Value |
|--------|-------|
| **Unique documents** | 18 |
| **Total files** | 36 |
| **Languages** | IT, EN |
| **Mermaid diagrams** | ~40 |
| **Total size** | ~530 KB |

---

## Diagrams by Type

| Type | Count | Documents |
|------|-------|-----------|
| Flowchart | ~20 | Enterprise, AWS, Pipelines |
| Sequence Diagram | ~15 | Sequence Diagrams, Pipelines |
| Pie Chart | 1 | Enterprise (cost) |
| Mindmap | 1 | Enterprise (tech stack) |
| Table | ~30 | All documents |

---

## Quick Links

### By Role

| Role | Recommended Documents |
|------|----------------------|
| **Developer** | Sequence Diagrams, Session 01-03 |
| **DevOps/SRE** | GitHub Pipelines, AWS Architecture, K8S Upgrade |
| **Security** | CVE Analysis, Enterprise (Security section) |
| **Architect** | Enterprise Architecture, Original Idea |
| **Manager** | Enterprise Architecture, Session Recaps |

### By Topic

| Topic | Documents |
|-------|-----------|
| **How the app works** | Sequence Diagrams |
| **How to deploy** | GitHub Pipelines, AWS Architecture |
| **How to scale** | Cluster Autoscaler, CloudWatch Analysis |
| **AWS Costs** | AWS Architecture, Enterprise Architecture |
| **Security** | CVE Analysis, Enterprise Architecture |

---

## Italian Version

All documents are available in Italian without the `_eng` suffix:

- [INDEX.md](./INDEX.md) - Questo indice in italiano

---

## Appendix: Documentation Statistics

### Content Metrics

| Metric | Value |
|--------|-------|
| **Unique documents** | 18 |
| **Total files** | 36 (IT + EN) |
| **Mermaid diagrams** | ~40 |
| **Total size** | ~530 KB |

### Time Comparison: Manual vs Claude

| Activity | Manual | Claude |
|----------|--------|--------|
| Diagram design (40×) | 10-15 hrs | - |
| Mermaid syntax writing | 6-8 hrs | - |
| Render testing & fixes | 3-4 hrs | - |
| Descriptive text & tables | 4-6 hrs | - |
| Translation IT ↔ EN | 3-4 hrs | - |
| Review & consistency | 2-3 hrs | ~30 min |
| Interaction & prompts | - | ~1-2 hrs |
| **Total** | **28-40 hrs** | **~2 hrs** |

### Efficiency Gain

| | Manual | Claude | Savings |
|--|--------|--------|---------|
| **Time** | 28-40 hours | ~2 hours | **~15-20x faster** |
| **Days** | 4-5 days | 1 session | - |

> **Key advantage:** Claude generates correct Mermaid syntax on first attempt and maintains stylistic consistency across all 40 diagrams - difficult to achieve manually.

---

*Last updated: 2025-12-31*
