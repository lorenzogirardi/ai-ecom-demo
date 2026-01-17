# Documentation Index - E-commerce Demo

Complete index of all project documentation.

## Video Demo

[▶️ Watch site demo video](https://res.cloudinary.com/ethzero/video/upload/v1767108038/ai/ai-ecom-demo/ai-ecom-demo_wesite_usage.mp4)

[▶️ Watch stress test with autoscaling](https://res.cloudinary.com/ethzero/video/upload/v1767120353/ai/ai-ecom-demo/stress-test-final-3x.mp4)

[▶️ Session 5 full recording - AWS Deploy (YouTube)](https://youtu.be/tNtAPNx70bc)

---

## Essential Files for Claude Code

Two files are **essential** for working effectively with Claude Code on complex projects:

### CLAUDE.md - The Project Context

```
ecommerce-demo/CLAUDE.md
```

| Aspect | Description |
|--------|-------------|
| **Purpose** | Provides Claude Code with complete project context |
| **Content** | Directory structure, commands, patterns, conventions, current state |
| **Benefit** | Claude "remembers" everything between sessions without re-explaining |

**Why it's fundamental:**
- Claude Code automatically reads `CLAUDE.md` at the start of each session
- Maintains consistency across different sessions (even days/weeks later)
- Avoids errors from lack of context (e.g., "which framework are we using?")
- Documents architectural decisions already made
- Tracks completion status (what's done, what's missing)

### EXECUTION_PLAN.md - The Design Reference

```
docs/EXECUTION_PLAN.md
```

| Aspect | Description |
|--------|-------------|
| **Purpose** | Defines the execution plan and target architecture |
| **Content** | Daily objectives, technology stack, final structure |
| **Benefit** | Claude has a "north star" to follow for every decision |

**Why it's fundamental:**
- Provides clear direction for implementation decisions
- Prevents scope creep (Claude knows what's in scope and what's not)
- Allows validation if output aligns with design
- Facilitates work division across sessions
- Serves as a contract between user and Claude

### How They Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                    EXECUTION_PLAN.md                         │
│                    (Design & Vision)                         │
│                          │                                   │
│                          ▼                                   │
│    ┌─────────────────────────────────────────────┐          │
│    │              CLAUDE.md                       │          │
│    │         (Context & State)                    │          │
│    │                   │                          │          │
│    │                   ▼                          │          │
│    │    ┌─────────────────────────────┐          │          │
│    │    │      Claude Code Session     │          │          │
│    │    │   (Guided Implementation)    │          │          │
│    │    └─────────────────────────────┘          │          │
│    │                   │                          │          │
│    │                   ▼                          │          │
│    │          Update CLAUDE.md                   │          │
│    │        (new project state)                  │          │
│    └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

> **Best Practice:** Update `CLAUDE.md` at the end of each session with the current project state.

---

## Quick Navigation

| Category | Documents |
|----------|-----------|
| [Session Recaps](#session-recaps) | 10 development sessions |
| [Architecture](#architecture) | 7 documents with diagrams |
| [Technical Documentation](#technical-documentation) | 16 specific documents |

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
| 8 | [SESSION_08_RECAP_eng.md](./SESSION_08_RECAP_eng.md) | **Deep Observability** - Container Insights, X-Ray tracing, Code optimizations, 508 RPS (+116% vs Day 6), 99.95% cache hit rate |
| 9 | [SESSION_09_RECAP_eng.md](./SESSION_09_RECAP_eng.md) | **Security Hardening** - Network Policies (Zero Trust), PSS, CSP/HSTS, Rate Limiting, OWASP ZAP scan (168 tests passed) |
| 10 | [SESSION_10_RECAP_eng.md](./SESSION_10_RECAP_eng.md) | **Operational Portal** - 14 OPS workflows for L1 Support, GitHub Environment protection, bounded parameters |

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
| [OBSERVABILITY_ARCHITECTURE_eng.md](./OBSERVABILITY_ARCHITECTURE_eng.md) | 12 | **Observability** - Logs, X-Ray tracing, Container Insights, metrics, IRSA, data flows |
| [SECURITY_ARCHITECTURE_eng.md](./SECURITY_ARCHITECTURE_eng.md) | 8 | **Security** - CI/CD pipeline security, network isolation, auth flow, rate limiting, container security, OWASP Top 10 |
| [OPERATIONAL_PORTAL_ARCHITECTURE_eng.md](./OPERATIONAL_PORTAL_ARCHITECTURE_eng.md) | 6 | **Operational Portal** - L1 Support workflows, GitHub Actions OPS, Environment protection, bounded parameters |

> **Italian versions:** Each document has an Italian version without the `_eng` suffix

---

## Technical Documentation

Specific technical documents.

| Document | Content |
|----------|---------|
| [PROMPT_ECOM_eng.md](./PROMPT_ECOM_eng.md) | **Complete Replication Prompt** - Definitive prompt to recreate the entire project with Claude Code: tech stack, structure, UI/UX, testing, infra, security, observability, operations |
| [ORIGINAL_IDEA_eng.md](./ORIGINAL_IDEA_eng.md) | **Vision & Requirements** - Original project idea, functional requirements, tech stack, execution plan |
| [FIRST_PROMPT_eng.md](./FIRST_PROMPT_eng.md) | **Initial Prompt** - The original prompt given to Claude Code to start the project, objectives, requirements, target architecture |
| [REASONING_PROMPT_UI_eng.md](./REASONING_PROMPT_UI_eng.md) | **Planning Session** - Reasoning and planning with Claude Web UI, feasibility analysis, rate limit optimization, session calendar |
| [CVE_ANALYSIS_eng.md](./CVE_ANALYSIS_eng.md) | **Security Analysis** - Contextual analysis of 36 CVEs detected by Trivy, prioritization, remediation |
| [K8S_UPGRADE_eng.md](./K8S_UPGRADE_eng.md) | **EKS Upgrade** - Upgrade from 1.29 to 1.32, AL2→AL2023 migration, downtime vs zero-downtime decision rationale |
| [CLUSTER_AUTOSCALER_eng.md](./CLUSTER_AUTOSCALER_eng.md) | **Autoscaling** - Cluster Autoscaler setup with IRSA, configuration, scale policies |
| [CLOUDWATCH_STRESS_ANALYSIS_eng.md](./CLOUDWATCH_STRESS_ANALYSIS_eng.md) | **Metrics Analysis** - k6 metrics correlation with CloudWatch, bottleneck identification (CPU 97%) |
| [LOAD_TEST_ANALYSIS_RATE_ON_eng.md](./LOAD_TEST_ANALYSIS_RATE_ON_eng.md) | **Rate Limit Testing** - Testing with rate limiting enabled, bypass header configuration |
| [MULTI_TEAM_GUARDRAILS_eng.md](./MULTI_TEAM_GUARDRAILS_eng.md) | **Enterprise Guardrails** - Multi-repo setup with Claude Code, per-team CLAUDE.md, CODEOWNERS, IAM isolation, CI/CD gates |
| [OBSERVABILITY_ANALYSIS_eng.md](./OBSERVABILITY_ANALYSIS_eng.md) | **Observability Analysis** - X-Ray traces analysis, Container Insights metrics, performance optimization post-load-test |
| [ZAP_BASELINE_REPORT_eng.md](./ZAP_BASELINE_REPORT_eng.md) | **Security Scan** - OWASP ZAP baseline scan results, 0 High/4 Medium/6 Low alerts, remediation recommendations |
| [K6_STRESS_TEST_REPORT_eng.md](./K6_STRESS_TEST_REPORT_eng.md) | **Stress Test** - k6 load test results, 216K requests, 277 RPS, p95 190ms, 0% errors |
| [LIGHTHOUSE_REPORT_eng.md](./LIGHTHOUSE_REPORT_eng.md) | **Performance Audit** - Lighthouse scores (Performance 92, Accessibility 90, Best Practices 96, SEO 100), Core Web Vitals |
| [UI_UX_HOWTO_eng.md](./UI_UX_HOWTO_eng.md) | **UI/UX How-To** - Guide for professional interfaces with Claude Code: shadcn/ui, Tailwind, globals.css template |
| [TESTING_HOWTO_eng.md](./TESTING_HOWTO_eng.md) | **Testing How-To** - Guide for quality tests: TestFactory, Testcontainers, Test Pyramid, 177+ tests |

> **Italian versions:** Each document has an Italian version without the `_eng` suffix

---

## Documentation Statistics

```
📁 slides/
├── 📄 Session Recaps    10 documents × 2 languages = 20 files
├── 📄 Architecture       7 documents × 2 languages = 14 files
├── 📄 Technical Docs    16 documents × 2 languages = 32 files
├── 📄 Index              1 document  × 2 languages =  2 files
└── ────────────────────────────────────────────────────────
    TOTAL                34 documents × 2 languages = 68 files
```

| Metric | Value |
|--------|-------|
| **Unique documents** | 34 |
| **Total files** | 68 |
| **Languages** | IT, EN |
| **Mermaid diagrams** | ~66 |
| **Total size** | ~700 KB |

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
| **Unique documents** | 34 |
| **Total files** | 68 (IT + EN) |
| **Mermaid diagrams** | ~66 |
| **Total size** | ~750 KB |

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

*Last updated: 2026-01-17*
