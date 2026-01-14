# CLAUDE.md Patterns: Convention vs Project-Centric

Guide per strutturare CLAUDE.md in team con multiple developers.

---

## Il Problema

Claude Code legge `CLAUDE.md` per capire il contesto del progetto.

**Due approcci comuni:**

| Approccio | Esempio | Caratteristica |
|-----------|---------|----------------|
| **Project-Centric** | ecommerce-demo | Documento vivente con stato e progress |
| **Convention-Centric** | agent-toolkit | Documento stabile con regole e pattern |

**Domanda:** Come combinare i vantaggi di entrambi?

---

## Approccio 1: Project-Centric (ecommerce-demo)

```markdown
# CLAUDE.md (~600 righe)

## Project Overview
## Structure
## Commands
## Current State (Day 1-10)
### Completed ✅
- [x] Feature A
- [x] Feature B
### In Progress
- [ ] Feature C
## Technical Notes
## Next Steps
```

### Pro
- Context completo per Claude
- Storico decisioni incluso
- Non serve esplorare il repo

### Contro
- Manutenzione pesante
- Merge conflicts frequenti con multi-developer
- Diventa obsoleto se non aggiornato
- Mix di concerns (docs + tracking)

---

## Approccio 2: Convention-Centric (agent-toolkit)

```markdown
# CLAUDE.md (~150 righe)

## Repository Overview
## Structure
## Development Commands
## Conventions
## Validation Rules
```

### Pro
- Leggero e stabile
- Nessun merge conflict
- Scalabile per N progetti
- Focus su "come" non "cosa"

### Contro
- Claude non conosce lo stato corrente
- Deve esplorare per capire cosa esiste
- Manca context storico

---

## Soluzione: Pattern Ibrido

**Principio:** Separare ciò che è stabile da ciò che cambia.

```
project/
├── CLAUDE.md                 # Convenzioni (stabile)
├── .claude/
│   └── status.md             # Progress (volatile)
└── ...
```

| File | Contenuto | Frequenza Update | Merge Conflicts |
|------|-----------|------------------|-----------------|
| `CLAUDE.md` | Convenzioni, comandi, pattern | Raro (mensile) | Quasi mai |
| `.claude/status.md` | Sprint, progress, blockers | Frequente | Possibili |

---

## Multi-Developer: Il Problema dei Conflitti

```
Developer A                    Developer B
     │                              │
     ├── git pull                   ├── git pull
     │                              │
     ├── Lavora su Feature X        ├── Lavora su Feature Y
     │                              │
     ├── Aggiorna status.md         ├── Aggiorna status.md
     │   "Feature X: 80%"           │   "Feature Y: Done"
     │                              │
     ├── git push ✅                │
     │                              ├── git push ❌ CONFLICT!
```

---

## Soluzione 1: Sezioni per Developer/Feature

```markdown
# .claude/status.md

## Active Work

### @developer-a
- Feature X: 80% complete
- Blocked on: API review

### @developer-b
- Feature Y: Done ✅
- Starting: Feature Z

## Shared Status
- Sprint: 5
- Release: v2.1.0
- Environment: staging OK
```

**Pro:** Merge conflicts rari (sezioni diverse)
**Contro:** Richiede disciplina

---

## Soluzione 2: File Separati per Area

```
.claude/
├── conventions.md           # Mai cambia (da template)
├── status/
│   ├── sprint.md            # Sprint corrente (1 owner)
│   ├── features/
│   │   ├── feature-x.md     # Owner: developer-a
│   │   └── feature-y.md     # Owner: developer-b
│   └── decisions/
│       ├── 001-database.md
│       └── 002-auth.md
```

**CLAUDE.md entry point:**
```markdown
# CLAUDE.md

## Context Files
Read these for full project context:
- `.claude/conventions.md` - Standards
- `.claude/status/sprint.md` - Current sprint
- `.claude/status/features/` - Feature status
- `.claude/status/decisions/` - ADRs
```

**Pro:** Zero merge conflicts
**Contro:** Più file da gestire

---

## Soluzione 3: Status Generato (CI/CD)

```yaml
# .github/workflows/update-status.yml
name: Update Project Status

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  update-status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate status from Issues/PRs
        run: |
          gh issue list --state open --json title,labels,assignees \
            > .claude/status/issues.json
          gh pr list --state open --json title,author,labels \
            > .claude/status/prs.json

      - name: Generate status.md
        run: |
          echo "# Auto-generated Status" > .claude/status.md
          echo "Updated: $(date)" >> .claude/status.md
          echo "" >> .claude/status.md
          echo "## Open Issues" >> .claude/status.md
          jq -r '.[] | "- \(.title) (@\(.assignees[0].login // "unassigned"))"' \
            .claude/status/issues.json >> .claude/status.md

      - name: Commit
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add .claude/status.md
          git commit -m "chore: auto-update project status" || exit 0
          git push
```

**Pro:**
- Zero conflitti (generato da CI)
- Sempre aggiornato
- Single source of truth (GitHub Issues/PRs)

**Contro:**
- Richiede setup CI
- Status limitato a ciò che è in Issues/PRs

---

## Soluzione 4: .gitignore + Template

```
.claude/
├── conventions.md           # Tracked (shared)
├── status.md                # .gitignore (local only)
└── status.md.template       # Tracked (template)
```

**.gitignore:**
```
.claude/status.md
```

**setup script:**
```bash
#!/bin/bash
if [ ! -f .claude/status.md ]; then
  cp .claude/status.md.template .claude/status.md
  echo "Created local status.md from template"
fi
```

**Pro:** Zero conflitti (file locale)
**Contro:** Status non condiviso tra developers

---

## Raccomandazione per Scenario

| Scenario | Soluzione | Motivo |
|----------|-----------|--------|
| 1-2 developers | Sezioni per developer | Semplice, poco overhead |
| 3-5 developers | File separati per feature | Isola i conflitti |
| Team grande | Status generato da CI | Automatico, scalabile |
| Progetto personale | File singolo | Non serve complessità |

---

## Template Completo

### CLAUDE.md (stabile)

```markdown
# CLAUDE.md

This file provides guidance to Claude Code for this repository.

## Repository Overview

[Breve descrizione del progetto - 2-3 righe]

## Structure

[Tree essenziale delle directory principali]

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run test` | Run tests |
| `npm run build` | Production build |

## Conventions

### Code Style
- [Linguaggio]: [linter/formatter]
- Commit messages: Conventional Commits

### File Naming
- Components: PascalCase
- Utilities: camelCase
- Constants: UPPER_SNAKE_CASE

## Quality Gates

Before merge:
- [ ] Tests pass
- [ ] Linter passes
- [ ] PR reviewed

---

## Project Context

For current status, see:
- `.claude/status.md` - Sprint status, active work
- `.claude/decisions/` - Architecture decisions

For feature-specific context:
- `.claude/status/features/` - Per-feature status
```

### .claude/status.md (volatile)

```markdown
# Project Status

> ⚠️ This file is updated frequently. Pull before editing.

**Last Updated:** 2026-01-14
**Sprint:** 5 (ends 2026-01-20)
**Release Target:** v2.1.0

## Active Work

### @alice
| Feature | Status | Notes |
|---------|--------|-------|
| Auth redesign | 80% | Waiting code review |
| API docs | Done | Merged #123 |

### @bob
| Feature | Status | Notes |
|---------|--------|-------|
| Search optimization | 50% | Perf testing |
| Bug #456 | In Progress | Root cause found |

## Blockers

- [ ] Auth redesign blocked on security review
- [ ] Need DevOps for staging deploy

## Recent Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-12 | Use Redis for sessions | Performance + horizontal scale |
| 2026-01-10 | Switch to Vite | Faster builds, better DX |

## Next Sprint Planning

1. Complete Auth redesign
2. Search optimization
3. Mobile responsive fixes
```

---

## Workflow Consigliato

```
┌─────────────────────────────────────────────────────────────────┐
│                        INIZIO SESSIONE                          │
├─────────────────────────────────────────────────────────────────┤
│  1. git pull                                                    │
│  2. Claude legge CLAUDE.md + .claude/status.md                  │
│  3. Developer comunica su cosa lavorerà                         │
│  4. Claude ha context completo                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DURANTE LAVORO                           │
├─────────────────────────────────────────────────────────────────┤
│  - Claude usa convenzioni da CLAUDE.md                          │
│  - Developer aggiorna propria sezione in status.md              │
│  - Decisioni importanti → .claude/decisions/NNN-title.md        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FINE SESSIONE                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Aggiorna status.md con progressi                            │
│  2. git add .claude/status.md                                   │
│  3. git commit -m "chore: update project status"                │
│  4. git push                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklist Implementazione

- [ ] Creare struttura `.claude/`
- [ ] Copiare template CLAUDE.md
- [ ] Creare status.md con sezioni per developer
- [ ] Documentare workflow nel team
- [ ] (Opzionale) Setup CI per auto-generate status

---

## Links

- [agent-toolkit](https://github.com/anthropics/agent-toolkit) - Skill-based conventions
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Architecture Decision Records](https://adr.github.io/)

---

*Document version: 1.0.0 - 2026-01-14*
