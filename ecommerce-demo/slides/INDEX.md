# Indice Documentazione - E-commerce Demo

Indice completo di tutta la documentazione del progetto.

---

## Navigazione Rapida

| Categoria | Documenti |
|-----------|-----------|
| [Session Recaps](#session-recaps) | 7 sessioni di sviluppo |
| [Architettura](#architettura) | 4 documenti con diagrammi |
| [Documentazione Tecnica](#documentazione-tecnica) | 6 documenti specifici |

---

## Session Recaps

Riepiloghi delle sessioni di sviluppo del progetto.

| # | Documento | Contenuto |
|---|-----------|-----------|
| 1 | [SESSION_01_RECAP.md](./SESSION_01_RECAP.md) | **Backend Foundation** - Setup Fastify, Prisma schema, moduli auth/catalog/search/orders, middleware, Docker |
| 2 | [SESSION_02_RECAP.md](./SESSION_02_RECAP.md) | **Frontend Development** - Next.js 16, componenti React, hooks, API client, auth context, pagine prodotti/carrello |
| 3 | [SESSION_03_RECAP.md](./SESSION_03_RECAP.md) | **Testing & Infrastructure** - 206 test (Vitest), Dockerfile, Helm charts, GitHub Actions CI/CD base |
| 4 | [SESSION_04_RECAP.md](./SESSION_04_RECAP.md) | **Security & GitOps** - Gitleaks, Trivy, Checkov, ArgoCD config, Terraform layers, CVE analysis |
| 5 | [SESSION_05_RECAP.md](./SESSION_05_RECAP.md) | **AWS Deployment** - EKS cluster, RDS, ElastiCache, CloudFront, External Secrets, ArgoCD deploy |
| 6 | [SESSION_06_RECAP.md](./SESSION_06_RECAP.md) | **Load Testing** - k6 scenarios, Cluster Autoscaler, CloudWatch metrics, bottleneck analysis |
| 7 | [SESSION_07_RECAP.md](./SESSION_07_RECAP.md) | **Performance Optimization** - Pod Anti-Affinity, HPA tuning, +134% throughput, -42% latency |

> **English versions:** Ogni documento ha una versione inglese con suffisso `_eng.md`

---

## Architettura

Diagrammi architetturali del sistema.

| Documento | Diagrammi | Contenuto |
|-----------|-----------|-----------|
| [ENTERPRISE_ARCHITECTURE.md](./ENTERPRISE_ARCHITECTURE.md) | 14 | **Vista Enterprise** - C4 model, DevOps pipeline, layered architecture, security, scalability, monitoring, cost breakdown, technology stack |
| [AWS_ARCHITECTURE.md](./AWS_ARCHITECTURE.md) | 10 | **Infrastruttura AWS** - Network topology, traffic flow, EKS architecture, security groups, IAM/IRSA, secrets management, Terraform layers |
| [GITHUB_PIPELINES.md](./GITHUB_PIPELINES.md) | 6 | **CI/CD Pipelines** - Backend CI, Frontend CI, Infra CI, ArgoCD deploy, Load test workflow, job dependencies |
| [SEQUENCE_DIAGRAMS.md](./SEQUENCE_DIAGRAMS.md) | 10 | **Flussi Applicativi** - Login, registration, products, categories, cart, checkout, orders, search, autocomplete, proxy pattern |

> **English versions:** Ogni documento ha una versione inglese con suffisso `_eng.md`

---

## Documentazione Tecnica

Documenti tecnici specifici.

| Documento | Contenuto |
|-----------|-----------|
| [ORIGINAL_IDEA.md](./ORIGINAL_IDEA.md) | **Vision & Requirements** - Idea originale del progetto, requisiti funzionali, stack tecnologico, piano di esecuzione |
| [CVE_ANALYSIS.md](./CVE_ANALYSIS.md) | **Security Analysis** - Analisi contestuale delle 36 CVE rilevate da Trivy, prioritizzazione, remediation |
| [K8S_UPGRADE.md](./K8S_UPGRADE.md) | **EKS Upgrade** - Upgrade da 1.29 a 1.32, migrazione AL2→AL2023, decision rationale downtime vs zero-downtime |
| [CLUSTER_AUTOSCALER.md](./CLUSTER_AUTOSCALER.md) | **Autoscaling** - Setup Cluster Autoscaler con IRSA, configurazione, scale policies |
| [CLOUDWATCH_STRESS_ANALYSIS.md](./CLOUDWATCH_STRESS_ANALYSIS.md) | **Metrics Analysis** - Correlazione metriche k6 con CloudWatch, identificazione bottleneck (CPU 97%) |
| [LOAD_TEST_ANALYSIS_RATE_ON.md](./LOAD_TEST_ANALYSIS_RATE_ON.md) | **Rate Limit Testing** - Test con rate limiting attivo, bypass header configuration |

> **English versions:** Ogni documento ha una versione inglese con suffisso `_eng.md`

---

## Statistiche Documentazione

```
📁 slides/
├── 📄 Session Recaps     7 documenti × 2 lingue = 14 file
├── 📄 Architettura       4 documenti × 2 lingue =  8 file
├── 📄 Technical Docs     6 documenti × 2 lingue = 12 file
├── 📄 Index              1 documento × 2 lingue =  2 file
└── ────────────────────────────────────────────────────
    TOTALE               18 documenti × 2 lingue = 36 file
```

| Metrica | Valore |
|---------|--------|
| **Documenti unici** | 18 |
| **File totali** | 36 |
| **Lingue** | IT, EN |
| **Diagrammi Mermaid** | ~40 |
| **Dimensione totale** | ~530 KB |

---

## Diagrammi per Tipo

| Tipo | Quantità | Documenti |
|------|----------|-----------|
| Flowchart | ~20 | Enterprise, AWS, Pipelines |
| Sequence Diagram | ~15 | Sequence Diagrams, Pipelines |
| Pie Chart | 1 | Enterprise (cost) |
| Mindmap | 1 | Enterprise (tech stack) |
| Table | ~30 | Tutti i documenti |

---

## Quick Links

### Per Ruolo

| Ruolo | Documenti Consigliati |
|-------|----------------------|
| **Developer** | Sequence Diagrams, Session 01-03 |
| **DevOps/SRE** | GitHub Pipelines, AWS Architecture, K8S Upgrade |
| **Security** | CVE Analysis, Enterprise (Security section) |
| **Architect** | Enterprise Architecture, Original Idea |
| **Manager** | Enterprise Architecture, Session Recaps |

### Per Argomento

| Argomento | Documenti |
|-----------|-----------|
| **Come funziona l'app** | Sequence Diagrams |
| **Come fare deploy** | GitHub Pipelines, AWS Architecture |
| **Come scalare** | Cluster Autoscaler, CloudWatch Analysis |
| **Costi AWS** | AWS Architecture, Enterprise Architecture |
| **Security** | CVE Analysis, Enterprise Architecture |

---

## Versione Inglese

Tutti i documenti sono disponibili in inglese con il suffisso `_eng.md`:

- [INDEX_eng.md](./INDEX_eng.md) - This index in English

---

## Appendice: Statistiche Documentazione

### Metriche Contenuto

| Metrica | Valore |
|---------|--------|
| **Documenti unici** | 18 |
| **File totali** | 36 (IT + EN) |
| **Diagrammi Mermaid** | ~40 |
| **Dimensione totale** | ~530 KB |

### Confronto Tempi: Manuale vs Claude

| Attività | Manuale | Claude |
|----------|---------|--------|
| Progettazione diagrammi (40×) | 10-15 ore | - |
| Scrittura Mermaid syntax | 6-8 ore | - |
| Test rendering e fix | 3-4 ore | - |
| Testo descrittivo e tabelle | 4-6 ore | - |
| Traduzione IT ↔ EN | 3-4 ore | - |
| Review e consistenza | 2-3 ore | ~30 min |
| Interazione e prompt | - | ~1-2 ore |
| **Totale** | **28-40 ore** | **~2 ore** |

### Guadagno Efficienza

| | Manuale | Claude | Risparmio |
|--|---------|--------|-----------|
| **Tempo** | 28-40 ore | ~2 ore | **~15-20x più veloce** |
| **Giorni** | 4-5 giorni | 1 sessione | - |

> **Vantaggio chiave:** Claude genera Mermaid syntax corretta al primo tentativo e mantiene consistenza stilistica su tutti i 40 diagrammi - difficile da ottenere manualmente.

---

*Ultimo aggiornamento: 2025-12-31*
