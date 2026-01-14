# CLAUDE.md Patterns: Lezioni dal Progetto E-commerce

Confronto tra approcci CLAUDE.md basato sull'esperienza di sviluppo ecommerce-demo (Day 1-10).

---

## Contesto: Come è nato ecommerce-demo

Il progetto ecommerce-demo è stato sviluppato in **10 sessioni** con Claude Code.

**Sfida:** Mantenere il contesto tra sessioni e tracciare il progresso.

**Soluzione adottata:** Un CLAUDE.md molto dettagliato (~635 righe) che funziona come:
- README del progetto
- Changelog delle sessioni
- Task tracker
- Runbook operativo
- Note tecniche

---

## I Due Approcci a Confronto

| Aspetto | agent-toolkit | ecommerce-demo |
|---------|---------------|----------------|
| **Righe** | ~150 | ~635 |
| **Filosofia** | "Come lavorare" | "Cosa abbiamo fatto" |
| **Stabilità** | Stabile | Cambia ogni sessione |
| **Scope** | Multi-progetto | Progetto singolo |

---

## agent-toolkit: Convention-Centric

```markdown
# CLAUDE.md (~150 righe)

## Repository Overview          # Cos'è il repo
## Repository Structure         # Directory structure
## Skill Categories             # Categorizzazione
## Development Commands         # Comandi per validare
## Skill File Conventions       # REGOLE obbligatorie
## Validation Rules             # Criteri qualità
## Common Patterns              # Pattern condivisi
```

**Focus:** Regole e convenzioni da seguire

**Quando Claude legge questo file impara:** Come deve comportarsi

---

## ecommerce-demo: Project-Centric

```markdown
# CLAUDE.md (~635 righe)

## Project Overview             # Stack tecnologico
## Project Structure            # Struttura dettagliata
## Development Commands         # Quick start
## Current State                # ⭐ STATO ATTUALE
  ### Completed ✅ (Day 1-10)   # Tutto ciò che è FATTO
  ### NOT Completed ❌          # Ciò che MANCA
## Technical Notes              # Decisioni tecniche
## Patterns and Conventions     # Come è scritto il codice
## Next Steps                   # Prossime priorità
```

**Focus:** Stato del progetto e storico

**Quando Claude legge questo file impara:** A che punto siamo

---

## Esempio Concreto: Day 7

### Con agent-toolkit style
```
User: "Migliora le performance del backend"
Claude: *deve esplorare il repo*
        *non sa cosa è stato fatto*
        *potrebbe rifare lavoro già fatto*
```

### Con ecommerce-demo style
```
User: "Migliora le performance del backend"
Claude: *legge CLAUDE.md*
        "Vedo che Day 6 hai identificato bottleneck:
         backend pod al 97% CPU, 234 RPS.
         Day 7 hai già fatto Pod Anti-Affinity e HPA.
         Risultato: 373 RPS, -46% latency.
         Prossimo step potrebbe essere..."
```

---

## Pro e Contro nel Contesto E-commerce

### agent-toolkit Style

| Pro | Contro |
|-----|--------|
| File leggero | Claude non sa che Day 6 ha scoperto il bottleneck |
| Nessun merge conflict | Non sa che HPA è già stato ottimizzato |
| Riusabile tra progetti | Deve ri-esplorare ogni sessione |
| Facile onboarding | Rischia di rifare lavoro già fatto |

### ecommerce-demo Style

| Pro | Contro |
|-----|--------|
| Claude sa esattamente dove siamo | File da 635 righe |
| Non ripete lavoro già fatto | Merge conflicts se multi-developer |
| Conosce le decisioni prese | Va aggiornato ogni sessione |
| Può suggerire next step logici | Può diventare obsoleto |

---

## Il Problema: Multi-Developer

Se ecommerce-demo fosse sviluppato da un **team**:

```
Alice (Day 11 mattina)          Bob (Day 11 pomeriggio)
     │                               │
     ├── git pull                    ├── git pull
     │                               │
     ├── Implementa Feature A        ├── Implementa Feature B
     │                               │
     ├── Aggiorna CLAUDE.md          ├── Aggiorna CLAUDE.md
     │   "Day 11: Feature A done"    │   "Day 11: Feature B done"
     │                               │
     ├── git push ✅                 │
     │                               ├── git push ❌ CONFLICT!
```

**635 righe = molti punti di conflitto**

---

## Soluzione: Pattern Ibrido

Prendere il meglio da entrambi:

```
ecommerce-demo/
├── CLAUDE.md                 # Convenzioni (stabile, ~150 righe)
├── .claude/
│   ├── status.md             # Progress tracking (volatile)
│   └── decisions/            # ADRs
└── ...
```

| File | Contenuto | Frequenza Update |
|------|-----------|------------------|
| `CLAUDE.md` | Come lavorare | Raro (mensile) |
| `.claude/status.md` | A che punto siamo | Ogni sessione |
| `.claude/decisions/` | Perché abbiamo scelto X | Quando serve |

---

## CLAUDE.md Semplificato (da agent-toolkit)

```markdown
# CLAUDE.md

## Project Overview
E-commerce monorepo: Next.js frontend, Fastify backend,
Terraform/EKS infrastructure.

## Structure
apps/frontend/    # Next.js 16
apps/backend/     # Fastify + Prisma
infra/terraform/  # AWS EKS
helm/             # Kubernetes charts

## Development Commands
docker-compose -f docker-compose.full.yml up --build
npm run dev       # Frontend :3000 + Backend :4000
npm run test      # All tests

## Conventions
- Backend modules: src/modules/{name}/{name}.routes.ts
- Frontend: App Router, components in src/components/
- Terraform: modules/ for reusable, environments/ for config

## Quality Gates
- npm run test must pass
- npm run lint must pass
- PR review required

---

## Project Status

👉 See `.claude/status.md` for current progress
👉 See `.claude/decisions/` for architecture decisions
```

**~50 righe invece di 635**

---

## .claude/status.md (Progress Tracking)

```markdown
# E-commerce Demo Status

**Last Updated:** 2026-01-14 by @lorenzo
**Current Phase:** Day 10 complete, Day 11 planning

## Completed Sessions

| Day | Focus | Key Results |
|-----|-------|-------------|
| 1-3 | Core App | Backend + Frontend + Tests |
| 4 | CI/CD | Security scanning, ArgoCD |
| 5 | AWS Deploy | EKS, RDS, CloudFront |
| 6 | Load Testing | k6, identified 97% CPU bottleneck |
| 7 | Performance | Anti-affinity, HPA: +59% RPS |
| 8 | Observability | X-Ray, Container Insights |
| 9 | Security | Network policies, ZAP scan |
| 10 | Ops Portal | 14 GitHub Actions for L1 |

## Current Metrics
- Throughput: 508 RPS (was 234 at Day 6)
- p95 Latency: 263ms (was 380ms)
- Error Rate: 0% (was 5.33%)

## Active Work

### @lorenzo
- [ ] Day 11 planning
- [ ] Cost optimization review

## Blockers
- None currently

## Next Steps
1. TBD based on Day 11 planning
```

---

## .claude/decisions/ (ADRs)

```
.claude/decisions/
├── 001-fastify-over-express.md
├── 002-terraform-layer-separation.md
├── 003-argocd-manual-sync.md
├── 004-redis-for-sessions.md
└── 005-hpa-45-percent-threshold.md
```

**Esempio: 005-hpa-45-percent-threshold.md**

```markdown
# ADR-005: HPA CPU Threshold at 45%

**Date:** 2026-01-XX (Day 7)
**Status:** Accepted

## Context
Day 6 stress test showed backend pod hitting 97% CPU
before HPA could scale (threshold was 70%).

## Decision
Reduce HPA CPU threshold from 70% to 45% for faster scaling.

## Consequences
- Faster reaction to load spikes
- May use slightly more pods during normal load
- Trade-off accepted for better user experience
```

---

## Multi-Developer: Strategie Anti-Conflitto

### 1. Sezioni per Developer

```markdown
# .claude/status.md

## Active Work

### @alice
- [ ] Feature A (70%)

### @bob
- [ ] Feature B (50%)

### @charlie
- [x] Feature C (Done)
```

**Ogni developer modifica solo la sua sezione**

---

### 2. File per Feature (team grandi)

```
.claude/status/
├── sprint-current.md         # Sprint lead only
├── features/
│   ├── auth-redesign.md      # Owner: alice
│   ├── search-perf.md        # Owner: bob
│   └── payment.md            # Owner: charlie
└── blockers.md               # Anyone can add
```

**Zero conflitti: file separati**

---

### 3. Status Auto-Generato (CI)

```yaml
# .github/workflows/update-status.yml
on:
  push:
    branches: [main]

jobs:
  update-status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate status
        run: |
          echo "# Auto-Generated Status" > .claude/status.md
          echo "Last updated: $(date)" >> .claude/status.md
          gh pr list --json title,author >> .claude/status.md
          git log --oneline -20 >> .claude/status.md
      - name: Commit
        run: |
          git add .claude/status.md
          git commit -m "chore: auto-update status" || true
          git push
```

**Il bot è l'unico che scrive = zero conflitti**

---

## Quale Approccio per E-commerce-demo?

**Situazione attuale:**
- 1 developer (Lorenzo)
- Sessioni sequenziali (Day 1, 2, 3...)
- Nessun conflitto possibile

**ecommerce-demo style funziona perfettamente** per questo caso.

**Se diventasse un progetto team:**

| Team Size | Approccio |
|-----------|-----------|
| 1-2 dev | Mantieni CLAUDE.md attuale |
| 3-5 dev | Split in CLAUDE.md + .claude/status.md |
| 6+ dev | Status auto-generato da CI |

---

## Workflow Consigliato (Team)

```
┌─────────────────────────────────────────────────────────────┐
│                     INIZIO SESSIONE                          │
├─────────────────────────────────────────────────────────────┤
│  1. git pull                                                │
│  2. Claude legge CLAUDE.md (convenzioni)                    │
│  3. Claude legge .claude/status.md (stato attuale)          │
│  4. Comunica a Claude su cosa lavorerai                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DURANTE LAVORO                           │
├─────────────────────────────────────────────────────────────┤
│  - Claude usa convenzioni da CLAUDE.md                      │
│  - Decisioni importanti → .claude/decisions/NNN-xxx.md      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     FINE SESSIONE                            │
├─────────────────────────────────────────────────────────────┤
│  1. Aggiorna TUA sezione in .claude/status.md               │
│  2. git add .claude/                                        │
│  3. git commit -m "chore: update status @username"          │
│  4. git pull --rebase && git push                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

| Cosa prendere | Da quale approccio |
|---------------|-------------------|
| Convenzioni stabili | agent-toolkit |
| Progress tracking | ecommerce-demo |
| Decisioni documentate | ADR pattern |
| Anti-conflitto | Sezioni per developer |

**Best of both worlds:**
- Claude sa come lavorare (convenzioni)
- Claude sa dove siamo (status)
- Nessun merge conflict (sezioni separate)

---

## Lezioni Apprese da E-commerce-demo

1. **CLAUDE.md dettagliato = Claude efficace**
   - Non ha mai rifatto lavoro già completato
   - Suggerimenti sempre contestualizzati

2. **Ma non scala per team**
   - 635 righe = troppi punti di conflitto
   - Split necessario se multi-developer

3. **Progress tracking è essenziale**
   - "Day 6: bottleneck CPU 97%" → Day 7 sapeva cosa fixare
   - Senza questo, avrebbe dovuto ri-analizzare

4. **Convenzioni separabili da stato**
   - Convenzioni = raramente cambiano
   - Stato = ogni sessione

---

## Enterprise Integration: agent-toolkit Analysis

Analysis of `/agent-toolkit/` for enterprise multi-repo, multi-team adoption.

### Key Components from agent-toolkit

| Component | Purpose | Enterprise Value |
|-----------|---------|------------------|
| **Skills System** | Domain-specific prompts (.md with YAML) | Standardize practices across teams |
| **Decision Framework** | Autonomy tiers (🟢🟡🔴) | Governance and risk management |
| **CLAUDE.md-example** | Full user config template | Onboarding new developers |

### Skills Worth Adopting

**1. Infrastructure Skills**
- `terraform/SKILL.md` - IaC patterns, Atlantis integration
- `trivy/SKILL.md` - Security scanning pre-commit

**2. Development Workflow**
- `scm/SKILL.md` - Git conventions, branching strategies
- `spec-driven-dev/SKILL.md` - Feature specs → tasks → TDD

**3. TypeScript Skill (To Create)**
```markdown
# skills/typescript/SKILL.md
---
name: typescript
description: TypeScript conventions for ecommerce monorepo
triggers: ["*.ts", "*.tsx", "typescript", "type error"]
---

## Patterns
- Zod schemas in `schemas/`
- Strict null checks enabled
- Prisma types auto-generated

## Commands
npm run typecheck     # Check all
npm run lint:fix      # Auto-fix
```

---

## Enterprise Multi-Repo Architecture

For teams of 4-5 developers across multiple repositories:

```
company-root/
├── .claude/                          # Company-wide
│   ├── architecture.md               # Shared patterns
│   └── skills/                       # Shared skills
│
├── ecommerce-api/                    # Team Alpha (4 devs)
│   ├── CLAUDE.md                     # Repo-specific conventions
│   └── .claude/
│       ├── status.md                 # Team Alpha progress
│       └── decisions/                # Repo ADRs
│
├── ecommerce-web/                    # Team Beta (5 devs)
│   ├── CLAUDE.md
│   └── .claude/
│       ├── status.md
│       └── decisions/
│
└── infra/                            # Platform Team (3 devs)
    ├── CLAUDE.md
    └── .claude/
        ├── status.md
        └── decisions/
```

### Hierarchy

| Level | File | Content | Update Frequency |
|-------|------|---------|------------------|
| Company | `.claude/architecture.md` | Tech stack, auth patterns, API contracts | Quarterly |
| Repo | `CLAUDE.md` | Module conventions, commands | Monthly |
| Team | `.claude/status.md` | Sprint progress, blockers | Daily/Weekly |
| Decision | `.claude/decisions/*.md` | ADRs | As needed |

---

## Decision Framework (from agent-toolkit)

Implement autonomy tiers for enterprise governance:

```markdown
## Decision Framework

### 🟢 GREEN - Claude proceeds autonomously
- Code formatting, linting fixes
- Test file updates matching code changes
- Documentation typo fixes
- Dependency minor version updates

### 🟡 YELLOW - Claude asks before proceeding
- New dependencies
- Database schema changes
- API contract changes
- Configuration changes

### 🔴 RED - Always require approval
- Production deployments
- Security-related changes
- Infrastructure modifications
- Data migrations
```

**Benefit:** Reduces friction on safe operations while maintaining control on risky ones.

---

## Recommended Adoption Path

### Phase 1: Single Repo (Current)
Keep ecommerce-demo CLAUDE.md as-is. It works well for single developer.

### Phase 2: Team (3-5 devs)
```
ecommerce-demo/
├── CLAUDE.md                 # Slim down to conventions (~150 lines)
├── .claude/
│   ├── status.md             # Progress tracking (per-developer sections)
│   └── decisions/            # ADRs
└── ...
```

### Phase 3: Multi-Repo (6+ devs)
```
company/
├── .claude/architecture.md   # Shared standards
├── ecommerce-api/           # Own CLAUDE.md + .claude/status.md
├── ecommerce-web/           # Own CLAUDE.md + .claude/status.md
└── infra/                   # Own CLAUDE.md + .claude/status.md
```

### Phase 4: CI Auto-Generated Status
```yaml
# .github/workflows/update-status.yml
on:
  push:
    branches: [main]

jobs:
  update-status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate status from git/PRs
        run: |
          echo "# Auto-Generated Status" > .claude/status.md
          echo "Last updated: $(date)" >> .claude/status.md
          gh pr list --json title,author,state >> .claude/status.md
          git log --oneline -20 >> .claude/status.md
      - name: Commit
        run: |
          git add .claude/status.md
          git commit -m "chore: auto-update status" || true
          git push
```

**Benefit:** Zero merge conflicts, always up-to-date.

---

## Summary: Best Practices

| Practice | Source | Why |
|----------|--------|-----|
| Conventions in CLAUDE.md | agent-toolkit | Stable, rarely changes |
| Progress in .claude/status.md | ecommerce-demo | Volatile, per-session |
| ADRs in .claude/decisions/ | ADR pattern | Capture "why" for future |
| Decision Framework (🟢🟡🔴) | agent-toolkit | Enterprise governance |
| Skills for domain knowledge | agent-toolkit | Standardize practices |
| CI auto-update | Hybrid | Zero conflicts at scale |

---

*Document based on 10 development sessions of ecommerce-demo with Claude Code*
*Enhanced with agent-toolkit enterprise patterns*
*Version: 2.0.0 - 2026-01-14*
