# CLAUDE.md Patterns: Convention vs Project-Centric

Analisi comparativa tra due approcci e come estenderli per team multi-developer.

---

## I Due Approcci

| Aspetto | agent-toolkit | ecommerce-demo |
|---------|---------------|----------------|
| **Righe** | ~150 | ~635 |
| **Focus** | Come lavorare | Cosa è stato fatto |
| **Stabilità** | Stabile (raramente cambia) | Volatile (ogni sessione) |
| **Scope** | Multi-progetto (toolkit) | Singolo progetto |

---

## agent-toolkit/claude.md

```markdown
# CLAUDE.md (150 righe)

## Repository Overview          # Cosa fa il repo
## Repository Structure         # Struttura directory
## Skill Categories             # Categorizzazione
## Development Commands         # Comandi per validare/creare
## Skill File Conventions       # REGOLE da seguire
## Validation Rules             # Criteri di validazione
## Common Patterns              # Pattern cross-skill
```

**Caratteristiche:**
- Focus su **convenzioni e regole**
- YAML frontmatter obbligatorio
- ABOUTME headers su ogni file
- Progressive disclosure (SKILL.md → references/ → scripts/)
- Quality gates per linguaggio

---

## ecommerce-demo/CLAUDE.md

```markdown
# CLAUDE.md (635 righe)

## Project Overview             # Cosa fa il progetto
## Project Structure            # Struttura dettagliata
## Development Commands         # Come avviare/testare
## Current State                # STATO ATTUALE
  ### Completed ✅ (Day 1-10)   # Cosa è FATTO
  ### NOT Completed ❌          # Cosa MANCA
## Technical Notes              # Note implementative
## Patterns and Conventions     # Pattern del codice
## Next Steps                   # PROSSIMI PASSI
## Links                        # Riferimenti
```

**Caratteristiche:**
- Focus su **stato e progresso**
- Tracking per sessione/giorno
- Checkboxes dettagliate
- Decisioni architetturali inline
- Metriche (test results, performance)

---

## Confronto Concettuale

| Dimensione | agent-toolkit | ecommerce-demo |
|------------|---------------|----------------|
| **Domanda principale** | "Come devo lavorare?" | "A che punto siamo?" |
| **Claude impara** | Regole e convenzioni | Contesto e storia |
| **Manutenzione** | Bassa (mensile) | Alta (ogni sessione) |
| **Merge conflicts** | Rari | Frequenti |
| **Riusabilità** | Alta (template) | Bassa (project-specific) |
| **Onboarding** | Veloce | Lento (molto da leggere) |

---

## Pro e Contro

### agent-toolkit Style

| Pro | Contro |
|-----|--------|
| Leggero e stabile | Claude non sa lo stato |
| Nessun merge conflict | Deve esplorare il repo |
| Template riusabile | No context storico |
| Focus su qualità | No tracking progress |

### ecommerce-demo Style

| Pro | Contro |
|-----|--------|
| Context completo | File enorme |
| Claude sa tutto | Merge conflicts |
| Storico decisioni | Manutenzione pesante |
| Progress tracking | Può diventare obsoleto |

---

## Il Problema Multi-Developer

Il file `CLAUDE.md` viene scaricato da GitHub.

```
Developer A                    Developer B
     │                              │
     ├── git pull                   ├── git pull
     │                              │
     ├── Lavora 2 ore               ├── Lavora 2 ore
     │                              │
     ├── Aggiorna CLAUDE.md         ├── Aggiorna CLAUDE.md
     │   "Day 11: Feature X done"   │   "Day 11: Feature Y done"
     │                              │
     ├── git push ✅                │
     │                              ├── git push ❌ CONFLICT!
```

**Con ecommerce-demo style:** Conflitti frequenti sulla sezione "Current State"

**Con agent-toolkit style:** Nessun conflitto (ma nessun tracking)

---

## Soluzione: Pattern Ibrido

Separare ciò che è **stabile** da ciò che **cambia**.

```
project/
├── CLAUDE.md                 # Convenzioni (da agent-toolkit)
├── .claude/
│   ├── status.md             # Progress tracking (volatile)
│   └── decisions/            # ADRs (append-only)
└── ...
```

| File | Contenuto | Chi modifica | Conflitti |
|------|-----------|--------------|-----------|
| `CLAUDE.md` | Regole, comandi, pattern | Tech Lead | Mai |
| `.claude/status.md` | Stato, progress, blockers | Tutti | Possibili |
| `.claude/decisions/` | ADRs (001-xxx.md) | Chi decide | Mai (append) |

---

## Estendere agent-toolkit

### CLAUDE.md Base (stabile, da template)

```markdown
# CLAUDE.md

This file provides guidance to Claude Code for this repository.

## Repository Overview
[2-3 righe sul progetto]

## Structure
[Tree essenziale]

## Development Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run test` | Run tests |

## Conventions
[Pattern del linguaggio/framework]

## Quality Gates
[Cosa deve passare prima di merge]

---

## Project Context

For current project status and progress:
- `.claude/status.md` - Active work, blockers, sprint info
- `.claude/decisions/` - Architecture Decision Records
```

---

## .claude/status.md (volatile, per developer)

```markdown
# Project Status

**Last Updated:** 2026-01-14
**Sprint:** 5 (ends 2026-01-20)

## Active Work

### @alice
| Task | Status | PR | Notes |
|------|--------|-----|-------|
| Auth redesign | 80% | #123 | Review pending |
| API docs | Done | #120 | Merged |

### @bob
| Task | Status | PR | Notes |
|------|--------|-----|-------|
| Search perf | 50% | - | Profiling |
| Bug #456 | WIP | #125 | Root cause found |

## Blockers
- Auth redesign: waiting security review (@charlie)
- Staging deploy: needs DevOps (@devops-team)

## Recent Completions
- 2026-01-13: Payment integration (Day 10)
- 2026-01-12: Load testing framework (Day 9)
```

**Sezioni per developer = meno conflitti**

---

## Gestire i Conflitti

### Strategia 1: Sezioni per Developer

Ogni developer modifica solo la propria sezione:

```markdown
## Active Work

### @alice       ← Alice modifica solo qui
...

### @bob         ← Bob modifica solo qui
...
```

**Pro:** Semplice, pochi conflitti
**Contro:** Richiede disciplina

---

### Strategia 2: File per Feature

```
.claude/
├── status/
│   ├── sprint.md              # Solo sprint lead modifica
│   ├── features/
│   │   ├── auth-redesign.md   # Owner: alice
│   │   ├── search-perf.md     # Owner: bob
│   │   └── payment.md         # Owner: charlie
│   └── blockers.md            # Tutti possono aggiungere
```

**Pro:** Zero conflitti (file separati)
**Contro:** Più file da gestire

---

### Strategia 3: Status Auto-Generato (CI)

```yaml
# .github/workflows/update-status.yml
name: Auto Update Status

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 8 * * *'  # Daily at 8am

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate from GitHub
        run: |
          echo "# Auto-Generated Status" > .claude/status.md
          echo "Updated: $(date -u)" >> .claude/status.md
          echo "" >> .claude/status.md

          echo "## Open PRs" >> .claude/status.md
          gh pr list --json title,author,labels --template \
            '{{range .}}- {{.title}} (@{{.author.login}}){{"\n"}}{{end}}' \
            >> .claude/status.md

          echo "" >> .claude/status.md
          echo "## Recent Commits" >> .claude/status.md
          git log --oneline -10 >> .claude/status.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .claude/status.md
          git diff --staged --quiet || git commit -m "chore: auto-update status"
          git push
```

**Pro:**
- Zero conflitti (bot unico owner)
- Sempre aggiornato
- Single source of truth

**Contro:**
- Setup CI necessario
- Info limitata a GitHub (PR, commits, issues)

---

## Raccomandazione per Scenario

| Team Size | Approccio Consigliato |
|-----------|----------------------|
| 1 developer | ecommerce-demo style (tutto in CLAUDE.md) |
| 2-3 developers | Sezioni per developer |
| 4-6 developers | File per feature |
| 7+ developers | Status auto-generato da CI |

---

## Template Finale

### Struttura Directory

```
project/
├── CLAUDE.md                     # Convenzioni (stabile)
├── .claude/
│   ├── status.md                 # Progress (volatile)
│   └── decisions/
│       ├── 001-database.md
│       └── 002-auth-provider.md
└── ...
```

### CLAUDE.md (da agent-toolkit)

```markdown
# CLAUDE.md

This file provides guidance to Claude Code for this repository.

## Repository Overview
Brief description of what the project does.

## Structure
Essential directory tree.

## Development Commands
| Command | Description |
|---------|-------------|
| ... | ... |

## Conventions
- Code style rules
- File naming
- Commit message format

## Quality Gates
- Tests must pass
- Linter must pass
- PR review required

---

## Project Context

👉 **Current status:** `.claude/status.md`
👉 **Decisions:** `.claude/decisions/`
```

### .claude/status.md (ecommerce-demo elements)

```markdown
# Project Status

> Last sync: 2026-01-14 by @alice

## Sprint Info
- **Sprint:** 5
- **End:** 2026-01-20
- **Goal:** Complete auth redesign

## Active Work by Developer

### @alice
- [x] Setup auth provider
- [ ] Implement OAuth flow (70%)
- [ ] Write tests

### @bob
- [x] Database migration
- [ ] API endpoints (50%)

## Blockers
- [ ] Waiting for design specs (@designer)
- [ ] Need AWS credentials (@devops)

## Completed This Sprint
- Payment integration (#120)
- Load testing setup (#118)
```

---

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     START SESSION                            │
├─────────────────────────────────────────────────────────────┤
│  1. git pull                                                │
│  2. Claude reads CLAUDE.md (conventions)                    │
│  3. Claude reads .claude/status.md (current state)          │
│  4. Tell Claude what you're working on today                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DURING WORK                              │
├─────────────────────────────────────────────────────────────┤
│  - Claude follows conventions from CLAUDE.md                │
│  - Important decisions → .claude/decisions/NNN-title.md     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     END SESSION                              │
├─────────────────────────────────────────────────────────────┤
│  1. Update YOUR section in .claude/status.md                │
│  2. git add .claude/                                        │
│  3. git commit -m "chore: update status @username"          │
│  4. git pull --rebase && git push                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist Implementazione

- [ ] Creare `.claude/` directory
- [ ] Creare `CLAUDE.md` da template agent-toolkit
- [ ] Creare `.claude/status.md` con sezioni per developer
- [ ] Creare `.claude/decisions/` directory
- [ ] Documentare workflow nel team wiki/README
- [ ] (Opzionale) Setup CI per auto-update status

---

## Summary

| Cosa | Da dove | Chi mantiene |
|------|---------|--------------|
| Convenzioni | agent-toolkit | Tech Lead (raro) |
| Progress tracking | ecommerce-demo | Ogni developer (daily) |
| Decisioni | ADR pattern | Chi decide (append-only) |

**Risultato:** Best of both worlds senza merge conflicts.

---

*Version: 1.0.0 - 2026-01-14*
