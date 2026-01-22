# AI-First Development Pilot Playbook

**Versione:** 1.0.0
**Data:** 2026-01-22
**Durata Pilot:** 30 giorni (3 sprint)
**Team:** 5 persone (1 SM, 1 PO, 1 Platform, 2 Dev)

---

## Indice

1. [Executive Summary](#1-executive-summary)
2. [Obiettivi e Metriche](#2-obiettivi-e-metriche)
3. [Struttura del Pilot](#3-struttura-del-pilot)
4. [Setup Tecnico](#4-setup-tecnico)
5. [CLAUDE.md Template](#5-claudemd-template)
6. [Ruoli e Workflow](#6-ruoli-e-workflow)
7. [Prompt Templates](#7-prompt-templates)
8. [Checklist Operative](#8-checklist-operative)
9. [Ceremony Templates](#9-ceremony-templates)
10. [Metrics Dashboard](#10-metrics-dashboard)
11. [Risk Management](#11-risk-management)
12. [Training Materials](#12-training-materials)
13. [Governance](#13-governance)
14. [Appendici](#14-appendici)

---

## 1. Executive Summary

### Contesto
- 11 team di sviluppo + 2 team di piattaforma
- Metodologia: Sprint-based (Scrum)
- Obiettivo: Validare l'integrazione di AI nel ciclo di sviluppo completo

### Scope del Pilot
- **IN SCOPE:** Discovery, Development, Testing, Documentation
- **OUT OF SCOPE:** Deploy in produzione (solo staging), decisioni architetturali critiche senza review umana

### Team Pilot
| Ruolo | Responsabilità AI-First |
|-------|------------------------|
| Scrum Master | Facilitazione AI nelle ceremony, metriche |
| Product Owner | Discovery AI-assisted, prioritizzazione |
| Platform Engineer | Setup tooling, governance, sicurezza |
| Developer 1 | Sviluppo AI-first, pair programming con AI |
| Developer 2 | Sviluppo AI-first, testing AI-assisted |

### Deliverable Attesi
1. 3-4 nuove feature sviluppate AI-first
2. Documentazione processo replicabile
3. Metriche comparative (con/senza AI)
4. Raccomandazioni per rollout aziendale

---

## 2. Obiettivi e Metriche

### 2.1 Obiettivi Primari

| Obiettivo | Target | Come Misurare |
|-----------|--------|---------------|
| Riduzione tempo discovery | -40% | Ore dedicate vs baseline storico |
| Riduzione tempo sviluppo | -30% | Story points/giorno vs baseline |
| Qualità codice | = o > baseline | Bug in staging, code review findings |
| Soddisfazione team | > 7/10 | Survey settimanale |

### 2.2 Metriche di Processo

```
METRICHE GIORNALIERE
├── Prompt count per persona
├── AI acceptance rate (% suggerimenti accettati)
├── Time saved estimate (self-reported)
└── Blockers AI-related

METRICHE SETTIMANALI
├── Story points completati
├── Bug introdotti
├── Code review iterations
├── Documentation coverage
└── Team NPS (Net Promoter Score)

METRICHE DI SPRINT
├── Velocity comparison
├── Quality gates pass rate
├── Feature completeness
└── Technical debt introdotto
```

### 2.3 Anti-Metriche (cosa NON ottimizzare)

- Lines of code (non indica qualità)
- Numero di prompt (più prompt non = meglio)
- Velocità a scapito della comprensione

---

## 3. Struttura del Pilot

### 3.1 Timeline 30 Giorni

```
SPRINT 0: SETUP & TRAINING (Giorni 1-5)
├── Day 1: Kickoff, tool setup
├── Day 2-3: Training Claude Code
├── Day 4: Training prompt engineering
└── Day 5: Dry run, refinement backlog

SPRINT 1: PRIMI PASSI (Giorni 6-15)
├── Day 6: Sprint Planning AI-assisted
├── Day 7-13: Development (2 feature target)
├── Day 14: Sprint Review
└── Day 15: Retrospettiva + Adattamento

SPRINT 2: OTTIMIZZAZIONE (Giorni 16-25)
├── Day 16: Sprint Planning
├── Day 17-23: Development (2 feature target)
├── Day 24: Sprint Review
└── Day 25: Retrospettiva

SPRINT 3: CONSOLIDAMENTO (Giorni 26-30)
├── Day 26-28: Polish, documentazione
├── Day 29: Demo stakeholder
└── Day 30: Report finale, raccomandazioni
```

### 3.2 Giornata Tipo

> **Reality Check:** I developer tipicamente subiscono ~40% di interruzioni (incidenti produzione, richieste supporto, meeting, Slack). La giornata ideale sotto raramente accade. Scegli il modello che si adatta al pattern di interruzioni del tuo team.

#### Modello A: Giornata Ideale (Interruzioni basse <20%)

```
09:00 - 09:15  Daily Standup (AI-enhanced)
09:15 - 12:30  Development Block 1
               └── AI pair programming
12:30 - 13:30  Pranzo
13:30 - 17:00  Development Block 2
               └── Code review, testing
17:00 - 17:30  Raccolta metriche + journaling
```

**Quando usarlo:** Team pilot dedicato con protezione dalle interruzioni, o durante Sprint 0 training.

---

#### Modello B: Rotazione Shield (Interruzioni alte ~40%)

Un developer assorbe TUTTE le interruzioni mentre gli altri si concentrano. Rotazione giornaliera.

```
DEVELOPER FOCALIZZATO (4 giorni/settimana)
09:00 - 09:15  Daily Standup
09:15 - 12:30  Blocco Deep Work (NO interruzioni)
               └── AI pair programming, task complessi
12:30 - 13:30  Pranzo
13:30 - 16:30  Blocco Deep Work (NO interruzioni)
               └── Sviluppo feature
16:30 - 17:30  Sync + Metriche

DEVELOPER SHIELD (1 giorno/settimana per dev)
09:00 - 09:15  Daily Standup
09:15 - 17:00  Gestione interruzioni:
               ├── Incidenti produzione
               ├── Escalation supporto
               ├── Richieste code review
               ├── Domande Slack/Teams
               └── Bug fix piccoli (usa AI per triage rapido)
17:00 - 17:30  Note handover per prossimo shield
```

**Tip AI per Shield:** Usa Claude per triage rapido:
- "Analizza questo error log e suggerisci la root cause"
- "Scrivi una fix rapida per questo bug, la revisiono in 5 min"

**Calcolo:** Con 2 dev, ognuno ha 4 giorni focalizzati = 80% efficacia vs 60% con interruzioni costanti.

---

#### Modello C: Split Mattina/Pomeriggio (Interruzioni moderate ~30%)

Interruzioni permesse solo in metà giornata.

```
MATTINA: TEMPO FOCUS (Accordo Team: No Interruzioni)
09:00 - 09:15  Daily Standup
09:15 - 12:30  Blocco Sviluppo Protetto
               ├── Feature complesse
               ├── AI pair programming
               └── Richiede concentrazione
               ⛔ Slack in DND, no meeting permessi

12:30 - 13:30  Pranzo

POMERIGGIO: COLLABORATIVO + INTERRUZIONI
13:30 - 14:00  Buffer Interruzioni
               └── Check Slack, rispondi a richieste mattutine
14:00 - 15:30  Lavoro Collaborativo
               ├── Code review
               ├── Pair programming (umano)
               ├── Richieste supporto
               └── Task piccoli con AI
15:30 - 16:30  Meeting (se necessario)
16:30 - 17:30  Wrap-up
               ├── Sottomissione PR
               ├── Raccolta metriche
               └── Prepara blocco focus di domani
```

**Tip AI:** Usa AI nel pomeriggio per lavoro guidato da interruzioni:
- Code review rapide con pre-analisi AI
- Investigazione bug veloce
- Aggiornamenti documentazione

---

#### Modello D: Pomodoro + Slot Interruzioni (Interruzioni variabili)

Cicli strutturati di 90 minuti con finestre interruzioni integrate.

```
CICLO 1 (09:00 - 10:30)
├── 09:00-09:15  Standup
├── 09:15-10:15  Blocco Focus (60 min)
│                └── Un task, AI-assistito
└── 10:15-10:30  Finestra Interruzioni (15 min)
                 └── Check Slack, risposte rapide

CICLO 2 (10:30 - 12:00)
├── 10:30-11:30  Blocco Focus (60 min)
└── 11:30-12:00  Finestra Interruzioni (30 min)
                 └── Interruzioni più lunghe, task piccoli

12:00 - 13:00   Pranzo

CICLO 3 (13:00 - 14:30)
├── 13:00-14:00  Blocco Focus (60 min)
└── 14:00-14:30  Finestra Interruzioni (30 min)

CICLO 4 (14:30 - 16:00)
├── 14:30-15:30  Blocco Focus (60 min)
└── 15:30-16:00  Finestra Interruzioni (30 min)

CICLO 5 (16:00 - 17:30)
├── 16:00-17:00  Blocco Flessibile
│                └── Interruzioni O focus, in base alla coda
└── 17:00-17:30  Metriche + Wrap-up
```

**Calcolo:** 4 ore focus + 2 ore interruzioni = 67% tempo focalizzato (vs tipico 40-50% con interruzioni non strutturate).

---

#### Modello E: Async-First (Team Remoti/Distribuiti)

Minimizza interruzioni sincrone, massimizza leva AI.

```
RITMO GIORNALIERO ASYNC

Inizio Giornata (Flessibile)
├── Leggi standup async (scritto, non meeting)
├── Rivedi suggerimenti AI notturni
└── Pianifica 2-3 task focus per la giornata

Blocchi Focus (Autogestiti, 4-5 ore totali)
├── Deep work con AI
├── Slack in DND
└── Rispondi a richieste async in batch

Batch Interruzioni (2-3 volte/giorno, 30 min ciascuno)
├── Processa coda Slack
├── Revisiona PR (pre-revisionate da AI)
├── Risposte rapide
└── Escala bloccanti

Fine Giornata
├── Update standup async (scritto)
├── Sottomissione PR
└── Raccolta metriche

UN MEETING SYNC/GIORNO (Opzionale)
├── 30 min sync team
└── OPPURE salta se no bloccanti
```

**Tip AI per Async:** Claude può aiutare a scrivere update async:
- "Riassumi cosa ho fatto oggi per l'update standup"
- "Bozza una risposta a questo thread Slack su [issue]"

---

#### Scegliere il Modello

| Situazione Team | Modello Consigliato |
|-----------------|---------------------|
| Team pilot dedicato, minime responsabilità supporto | Modello A (Ideale) |
| Rotazione on-call esistente, supporto produzione | Modello B (Shield) |
| Stesso team gestisce feature + supporto | Modello C (Split AM/PM) |
| Interruzioni imprevedibili, alta variabilità | Modello D (Pomodoro) |
| Team remoto, fusi orari diversi | Modello E (Async-First) |

#### Tracking Interruzioni (Prima Settimana)

Prima di scegliere un modello, traccia le interruzioni effettive per 1 settimana:

```
| Giorno | Focus Pianificato (h) | Focus Effettivo (h) | Interruzioni | Tipo |
|--------|----------------------|---------------------|--------------|------|
| Lun | 6 | 3.5 | 8 | Slack(5), Supporto(2), Meeting(1) |
| Mar | 6 | 2 | 12 | Incidente produzione |
| ... | ... | ... | ... | ... |
```

Calcola il tuo **Tasso di Interruzione:**
- **<20%:** Modello A funziona
- **20-35%:** Modello C o D
- **35-50%:** Modello B o D
- **>50%:** Prima risolvi problemi organizzativi, il pilot fallirà

---

## 4. Setup Tecnico

### 4.1 Prerequisiti

```bash
# Software necessario
- Claude Code CLI (ultima versione)
- VS Code / Cursor
- Git
- Node.js 18+
- Docker Desktop

# Account necessari
- Anthropic API key (team license)
- GitHub access
- Jira access
```

### 4.2 Installazione Claude Code

```bash
# macOS/Linux
npm install -g @anthropic-ai/claude-code

# Verifica installazione
claude --version

# Login
claude auth login

# Configurazione iniziale
claude config set --global preferredModel claude-sonnet-4-20250514
claude config set --global autoApprove "read,glob,grep"
```

### 4.3 Configurazione Progetto

```bash
# Nel repository esistente
cd /path/to/ecommerce-project

# Crea struttura Claude
mkdir -p .claude/{status,decisions}

# Copia template CLAUDE.md (vedi sezione 5)
cp templates/CLAUDE.md ./CLAUDE.md

# Inizializza status
echo "# Project Status\n\n**Last Updated:** $(date)\n**Phase:** Sprint 0" > .claude/status.md

# Commit setup
git add CLAUDE.md .claude/
git commit -m "chore: setup Claude Code AI-first pilot"
```

### 4.4 VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "anthropic.claude-code",
    "github.copilot",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

---

## 5. CLAUDE.md Template

> **Nota:** Copia questo template nel tuo progetto come `CLAUDE.md`

---

**File: CLAUDE.md**

```
# CLAUDE.md

## Project Overview

E-commerce platform monorepo.

**Tech Stack:**
- Frontend: Next.js 16, TypeScript, Tailwind CSS
- Backend: Fastify, Prisma, PostgreSQL
- Infra: AWS EKS, Terraform, ArgoCD

## Repository Structure

apps/
├── frontend/          # Next.js App Router
│   ├── src/
│   │   ├── app/       # Pages
│   │   ├── components/
│   │   └── hooks/
│   └── package.json
├── backend/           # Fastify REST API
│   ├── src/
│   │   ├── modules/   # Feature modules
│   │   └── lib/       # Shared utilities
│   └── package.json
infra/
├── terraform/         # IaC
└── helm/              # Kubernetes charts

## Development Commands

    # Start all services
    docker-compose -f docker-compose.full.yml up --build

    # Frontend only
    cd apps/frontend && npm run dev

    # Backend only
    cd apps/backend && npm run dev

    # Run all tests
    npm run test

    # Type check
    npm run typecheck

    # Lint
    npm run lint

## Code Conventions

### Backend Modules

    // Pattern: src/modules/{name}/{name}.routes.ts
    export async function productRoutes(app: FastifyInstance) {
      app.get('/', { schema: getProductsSchema }, getProductsHandler);
      app.post('/', { schema: createProductSchema }, createProductHandler);
    }

### Frontend Components

    // Pattern: src/components/{Name}/{Name}.tsx
    interface Props {
      // typed props
    }

    export function ComponentName({ prop1, prop2 }: Props) {
      // implementation
    }

### Money Handling (CRITICAL)

    // ALWAYS use integer cents internally
    // ALWAYS use Prisma Decimal for DB operations
    // NEVER use floating point for money calculations

    // Frontend display
    const displayPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

    // Backend calculation
    const total = new Prisma.Decimal(subtotalCents).div(100);

## Business Rules

| Rule | Value | Notes |
|------|-------|-------|
| Free shipping threshold | $50 | Before tax |
| Tax rate | 10% | Fixed for demo |
| Max cart items | 99 | Per SKU |
| Session timeout | 24h | JWT expiry |

## Quality Gates

Before committing:
- [ ] npm run test passes
- [ ] npm run lint passes
- [ ] npm run typecheck passes
- [ ] No console.log in production code
- [ ] API changes documented in OpenAPI

## Decision Framework

### GREEN - Proceed autonomously
- Code formatting, linting fixes
- Test updates matching code changes
- Documentation updates
- Dependency patch updates

### YELLOW - Ask before proceeding
- New dependencies
- Database schema changes
- API contract changes
- New environment variables

### RED - Always require approval
- Security-related changes
- Authentication/authorization changes
- Payment flow changes
- Data deletion operations

## Project Status

See .claude/status.md for current sprint progress
See .claude/decisions/ for architecture decisions

## Known Issues

1. Cart uses floating-point (fix planned Sprint 2)
2. No rate limiting on auth endpoints (fix planned)
3. Search is basic substring match (acceptable for demo)

## Contacts

- Tech Lead: [name]
- Product Owner: [name]
- On-call: #team-channel
```

---

## 6. Ruoli e Workflow

### 6.1 Product Owner Workflow

```
PO DAILY WORKFLOW
─────────────────
Morning (30 min)
├── Review overnight AI suggestions
├── Prioritize backlog with AI analysis
└── Prepare stories for refinement

During Day
├── AI-assisted user story writing
├── Acceptance criteria generation
└── Stakeholder communication

End of Day (15 min)
├── Review completed work
└── Update priorities
```

**AI Use Cases per PO:**
1. User story generation from requirements
2. Acceptance criteria drafting
3. Competitor analysis
4. Documentation generation
5. Release notes writing

### 6.2 Scrum Master Workflow

```
SM DAILY WORKFLOW
─────────────────
Pre-Daily (10 min)
├── Review team metrics dashboard
└── Prepare daily agenda

Daily Standup (15 min)
├── AI-generated summary of yesterday
├── Blocker identification
└── Focus areas

During Day
├── AI-assisted impediment research
├── Process improvement ideas
└── Metrics tracking

End of Sprint
├── AI-generated retrospective insights
└── Velocity analysis
```

**AI Use Cases per SM:**
1. Standup summaries
2. Retrospective facilitation
3. Metrics analysis
4. Process documentation
5. Team health monitoring

### 6.3 Developer Workflow

```
DEV DAILY WORKFLOW
──────────────────
Morning (15 min)
├── Review assigned stories
├── Plan approach with AI
└── Setup development context

Development Blocks
├── AI pair programming
├── Code generation
├── Test writing
└── Documentation

Code Review
├── AI pre-review
├── Human review
└── Iteration

End of Day (15 min)
├── Commit clean code
├── Update status
└── Log metrics
```

**AI Use Cases per Dev:**
1. Code generation
2. Test writing
3. Bug investigation
4. Refactoring
5. Documentation
6. Code review preparation

### 6.4 Platform Engineer Workflow

```
PLATFORM DAILY WORKFLOW
───────────────────────
Morning
├── Review security alerts
├── Check AI usage metrics
└── Governance compliance

Support
├── AI tool troubleshooting
├── Access management
└── Best practices guidance

Improvement
├── Tooling enhancements
├── Automation opportunities
└── Security hardening
```

**AI Use Cases per Platform:**
1. Infrastructure as Code
2. Security scanning
3. Monitoring setup
4. CI/CD optimization
5. Cost analysis

---

## 7. Prompt Templates

### 7.1 Product Owner Prompts

#### User Story Generation

```markdown
# PROMPT: Generate User Story

Context: [descrizione feature]

Generate a user story following this format:

**As a** [user type]
**I want to** [action]
**So that** [benefit]

Include:
1. 5-7 acceptance criteria (Given/When/Then)
2. Edge cases to consider
3. Out of scope items
4. Dependencies
5. Suggested story points (1-13 scale)

Consider our existing e-commerce platform with:
- Product catalog
- Shopping cart
- User accounts
- Order history
```

#### Acceptance Criteria Refinement

```markdown
# PROMPT: Refine Acceptance Criteria

User Story: [incolla user story]

Current AC:
[incolla acceptance criteria]

Please:
1. Identify gaps in the acceptance criteria
2. Add missing edge cases
3. Clarify ambiguous requirements
4. Suggest testable criteria
5. Identify potential technical constraints
```

#### Competitive Analysis

```markdown
# PROMPT: Feature Competitive Analysis

Feature: [nome feature]

Analyze how these competitors implement this feature:
- Amazon
- Shopify stores
- [competitor specifico]

Focus on:
1. UX patterns used
2. Edge case handling
3. Mobile vs desktop differences
4. Accessibility considerations
5. What we could do better
```

### 7.2 Scrum Master Prompts

#### Daily Standup Summary

```markdown
# PROMPT: Generate Standup Summary

Based on yesterday's commits and PR activity:
[incolla git log o link PR]

Generate a standup summary for each team member:
1. What they completed
2. What's in progress
3. Potential blockers

Keep it concise (2-3 bullets per person).
```

#### Retrospective Facilitation

```markdown
# PROMPT: Retrospective Insights

Sprint metrics:
- Planned: X story points
- Completed: Y story points
- Bugs found: Z
- AI acceptance rate: W%

Team feedback themes:
[incolla feedback raccolto]

Generate:
1. Top 3 things that went well (with evidence)
2. Top 3 areas for improvement
3. Suggested action items (SMART format)
4. Questions to explore in retro
```

#### Process Improvement

```markdown
# PROMPT: Process Improvement Analysis

Current challenge: [descrizione problema]

Our current process:
[descrizione processo attuale]

Suggest:
1. Root cause analysis
2. 3 potential solutions
3. Pros/cons of each
4. Recommended approach
5. How to measure improvement
```

### 7.3 Developer Prompts

#### Feature Implementation

```markdown
# PROMPT: Implement Feature

User Story: [incolla story]

Technical context:
- This is a [Next.js/Fastify] project
- We use [relevant libraries]
- Related code is in [file paths]

Please:
1. Read the existing code in [files]
2. Propose an implementation approach
3. Implement the feature
4. Write tests
5. Update relevant documentation

Follow our conventions in CLAUDE.md.
Do not modify unrelated code.
Ask if you need clarification.
```

#### Bug Investigation

```markdown
# PROMPT: Investigate Bug

Bug description: [descrizione]

Steps to reproduce:
1. [step 1]
2. [step 2]
3. ...

Expected: [expected behavior]
Actual: [actual behavior]

Please:
1. Analyze the relevant code
2. Identify the root cause
3. Propose a fix
4. Consider side effects
5. Suggest regression tests
```

#### Code Review Preparation

```markdown
# PROMPT: Pre-Review Code

Files changed:
[lista file o git diff]

Please review for:
1. Logic errors
2. Edge cases not handled
3. Security vulnerabilities
4. Performance issues
5. Code style violations
6. Missing tests
7. Documentation gaps

Be specific with line numbers and suggestions.
```

#### Test Generation

```markdown
# PROMPT: Generate Tests

Code to test:
[incolla codice]

Generate comprehensive tests covering:
1. Happy path
2. Edge cases
3. Error conditions
4. Boundary values

Use our testing framework: [Jest/Vitest]
Follow AAA pattern (Arrange, Act, Assert)
Mock external dependencies appropriately
```

### 7.4 Platform Engineer Prompts

#### Infrastructure Review

```markdown
# PROMPT: Review Terraform Changes

Changes:
[incolla terraform plan o diff]

Review for:
1. Security implications
2. Cost impact
3. Downtime requirements
4. Rollback strategy
5. Missing resources
6. Best practices violations
```

#### Security Scan Analysis

```markdown
# PROMPT: Analyze Security Findings

Scan results:
[incolla risultati scan]

For each finding:
1. Severity assessment
2. Exploitation difficulty
3. Recommended fix
4. False positive likelihood
5. Priority for remediation
```

#### Monitoring Setup

```markdown
# PROMPT: Design Monitoring

Service: [nome servizio]
SLOs: [SLO targets]

Design monitoring for:
1. Key metrics to track
2. Alert thresholds
3. Dashboard layout
4. Runbook triggers
5. Escalation paths
```

---

## 8. Checklist Operative

### 8.1 PO Checklist - Story Ready

```markdown
## Story Readiness Checklist

### Before Refinement
- [ ] User story follows format (As a/I want/So that)
- [ ] Business value articulated
- [ ] Acceptance criteria drafted
- [ ] AI-generated edge cases reviewed

### After Refinement
- [ ] Team understands the story
- [ ] Technical approach discussed
- [ ] Dependencies identified
- [ ] Story sized (story points)
- [ ] Acceptance criteria finalized
- [ ] AI suggestions incorporated

### Definition of Ready
- [ ] All acceptance criteria are testable
- [ ] No blocking dependencies
- [ ] UX mockups available (if UI change)
- [ ] API contract defined (if API change)
```

### 8.2 SM Checklist - Sprint Ceremonies

```markdown
## Sprint Planning Checklist

### Preparation (Day before)
- [ ] Backlog groomed and prioritized
- [ ] Velocity calculated (AI-assisted)
- [ ] Capacity confirmed with team
- [ ] Technical dependencies mapped

### During Planning
- [ ] Sprint goal defined
- [ ] Stories selected match capacity
- [ ] Tasks broken down
- [ ] AI pair assignments discussed
- [ ] Risks identified

### Post Planning
- [ ] Sprint board setup
- [ ] Team aligned on priorities
- [ ] Blockers escalated
- [ ] Calendar blocked for focus time
```

```markdown
## Daily Standup Checklist

### Preparation (5 min before)
- [ ] AI summary generated
- [ ] Blockers from yesterday reviewed
- [ ] Board status checked

### During Standup
- [ ] Timeboxed to 15 min
- [ ] Each person: done/doing/blockers
- [ ] AI insights shared (if relevant)
- [ ] Action items captured

### Post Standup
- [ ] Blockers assigned owners
- [ ] Parking lot scheduled
- [ ] Board updated
```

```markdown
## Retrospective Checklist

### Preparation
- [ ] Sprint metrics compiled
- [ ] AI insights generated
- [ ] Anonymous feedback collected
- [ ] Room/tools ready

### During Retro
- [ ] Safety check completed
- [ ] What went well discussed
- [ ] What to improve discussed
- [ ] Action items defined (max 3)
- [ ] AI usage specific discussion

### Post Retro
- [ ] Action items assigned
- [ ] Previous action items reviewed
- [ ] Summary shared with team
- [ ] Process adjustments documented
```

### 8.3 Dev Checklist - Feature Development

```markdown
## Feature Development Checklist

### Before Starting
- [ ] Story understood
- [ ] Acceptance criteria clear
- [ ] CLAUDE.md reviewed
- [ ] Related code explored
- [ ] Approach discussed with AI

### During Development
- [ ] Tests written first (TDD) or alongside
- [ ] Code follows conventions
- [ ] No hardcoded values
- [ ] Error handling implemented
- [ ] Edge cases covered
- [ ] AI suggestions reviewed (not blindly accepted)

### Before PR
- [ ] All tests pass locally
- [ ] Linting passes
- [ ] Type check passes
- [ ] Self-review completed
- [ ] AI pre-review done
- [ ] Documentation updated
- [ ] No console.log or debug code

### PR Description
- [ ] Links to story/ticket
- [ ] Summary of changes
- [ ] Testing instructions
- [ ] Screenshots (if UI)
- [ ] Breaking changes noted
```

### 8.4 Platform Checklist - AI Governance

```markdown
## AI Governance Daily Checklist

### Security
- [ ] No secrets in AI prompts
- [ ] No PII in AI interactions
- [ ] Audit logs reviewed
- [ ] Access permissions correct

### Quality
- [ ] AI-generated code reviewed
- [ ] Tests exist for AI code
- [ ] No obvious AI artifacts (comments, TODOs)
- [ ] Code ownership clear

### Compliance
- [ ] License compliance checked
- [ ] Data handling appropriate
- [ ] Audit trail maintained
- [ ] Escalation paths clear
```

---

## 9. Ceremony Templates

### 9.1 Sprint Planning Template

```markdown
# Sprint Planning - Sprint [N]

**Date:** YYYY-MM-DD
**Attendees:** [names]
**Duration:** 2 hours

## Sprint Goal
[One sentence describing sprint objective]

## Capacity
| Team Member | Days Available | Estimated Capacity |
|-------------|----------------|-------------------|
| Dev 1       | 8              | 24 pts            |
| Dev 2       | 10             | 30 pts            |
| Total       | -              | 54 pts            |

## Selected Stories

| ID | Story | Points | Assignee | AI Strategy |
|----|-------|--------|----------|-------------|
| 123 | [title] | 5 | Dev 1 | Pair programming |
| 124 | [title] | 8 | Dev 2 | Code generation |

## AI Focus Areas
- [ ] Area 1: [description]
- [ ] Area 2: [description]

## Risks & Dependencies
| Risk | Mitigation |
|------|------------|
| [risk] | [mitigation] |

## Action Items
- [ ] [action] - Owner: [name]
```

### 9.2 Daily Standup Template

```markdown
# Daily Standup - YYYY-MM-DD

## AI-Generated Summary
[Paste AI summary here]

## Updates

### [Name 1]
- **Yesterday:**
- **Today:**
- **Blockers:**

### [Name 2]
- **Yesterday:**
- **Today:**
- **Blockers:**

## Blockers
| Blocker | Owner | ETA |
|---------|-------|-----|
| [blocker] | [name] | [date] |

## AI Insights
- [relevant AI observation]

## Parking Lot
- [topic for later discussion]
```

### 9.3 Sprint Review Template

```markdown
# Sprint Review - Sprint [N]

**Date:** YYYY-MM-DD
**Attendees:** [names]

## Sprint Goal Achievement
**Goal:** [sprint goal]
**Status:** ✅ Achieved / ⚠️ Partially / ❌ Not achieved

## Completed Stories

| Story | Demo Notes | AI Contribution |
|-------|------------|-----------------|
| [story] | [notes] | [how AI helped] |

## Demo Script
1. [Demo step 1]
2. [Demo step 2]
3. ...

## Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Story Points | 40 | 38 |
| AI Acceptance Rate | 70% | 75% |
| Bugs Found | <5 | 3 |

## Stakeholder Feedback
- [feedback 1]
- [feedback 2]

## Not Completed
| Story | Reason | Plan |
|-------|--------|------|
| [story] | [reason] | [plan] |
```

### 9.4 Retrospective Template

```markdown
# Sprint Retrospective - Sprint [N]

**Date:** YYYY-MM-DD
**Facilitator:** [SM name]

## Safety Check
Scale 1-5 (5 = fully safe to speak)
Average: [X.X]

## AI-Generated Insights
[Paste AI analysis here]

## What Went Well 🎉
- [item 1]
- [item 2]

## What Could Improve 🔧
- [item 1]
- [item 2]

## AI-Specific Feedback
### What worked with AI
- [item]

### What didn't work with AI
- [item]

### AI tool suggestions
- [suggestion]

## Action Items
| Action | Owner | Due |
|--------|-------|-----|
| [action] | [name] | [date] |

## Previous Action Items Status
| Action | Status |
|--------|--------|
| [action] | ✅/⚠️/❌ |
```

---

## 10. Metrics Dashboard

### 10.1 Daily Metrics Tracker

```markdown
# Daily Metrics - YYYY-MM-DD

## Per Person

| Name | Prompts | Accept Rate | Time Saved (est) | Blockers |
|------|---------|-------------|------------------|----------|
| Dev 1 | 45 | 72% | 2h | 0 |
| Dev 2 | 38 | 68% | 1.5h | 1 |
| PO | 12 | 85% | 1h | 0 |
| SM | 8 | 90% | 30m | 0 |
| Platform | 15 | 60% | 45m | 0 |

## Team Totals
- Total prompts: 118
- Average acceptance: 73%
- Estimated time saved: 5.75h
- Active blockers: 1

## Qualitative Notes
- [Notable success]
- [Challenge encountered]
- [Learning of the day]
```

### 10.2 Weekly Metrics Summary

```markdown
# Weekly Metrics Summary - Week [N]

## Velocity
| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| Story Points | 35 | 30 | ↑ 17% |
| Bugs Introduced | 2 | 4 | ↓ 50% |
| PR Cycle Time | 4h | 6h | ↓ 33% |

## AI Usage
| Metric | Value | Target |
|--------|-------|--------|
| Total Prompts | 580 | - |
| Acceptance Rate | 71% | 70% |
| Time Saved (est) | 28h | 25h |

## Quality
| Metric | Value | Target |
|--------|-------|--------|
| Test Coverage | 78% | 75% |
| Lint Issues | 0 | 0 |
| Security Findings | 1 (low) | 0 |

## Team Health
- NPS Score: 8.2/10
- Top positive: [feedback]
- Top concern: [feedback]

## Highlights
1. [Achievement 1]
2. [Achievement 2]

## Concerns
1. [Concern 1]
2. [Concern 2]
```

### 10.3 Sprint Metrics Report

> **Template:** Copia questo template per il report di fine sprint

---

**File: sprint-N-metrics.md**

```
# Sprint [N] Metrics Report

## Executive Summary
[2-3 sentence summary]

## Velocity Analysis

    Planned: ████████████████████ 40 pts
    Actual:  ██████████████████   38 pts (95%)

### Historical Comparison
| Sprint | Planned | Actual | AI Usage |
|--------|---------|--------|----------|
| N-2 | 35 | 32 | Baseline |
| N-1 | 38 | 35 | 50% |
| N | 40 | 38 | 80% |

## Quality Metrics

### Bugs
- Found in sprint: 3
- Escaped to staging: 1
- Root causes: [analysis]

### Code Quality
- New technical debt: Low
- Refactoring completed: [items]
- Test coverage delta: +3%

## AI Metrics

### Usage by Role
| Role | Prompts | Accept Rate | Value Rating |
|------|---------|-------------|--------------|
| Dev | 850 | 70% | 8/10 |
| PO | 120 | 85% | 9/10 |
| SM | 80 | 90% | 7/10 |
| Platform | 150 | 65% | 8/10 |

### Top AI Use Cases
1. Code generation (35%)
2. Test writing (25%)
3. Documentation (20%)
4. Bug investigation (15%)
5. Other (5%)

### AI Challenges
| Challenge | Frequency | Mitigation |
|-----------|-----------|------------|
| [challenge] | [count] | [action] |

## Time Savings Estimate

| Activity | Without AI | With AI | Savings |
|----------|------------|---------|---------|
| Feature dev | 80h | 55h | 31% |
| Testing | 20h | 12h | 40% |
| Documentation | 10h | 4h | 60% |
| Total | 110h | 71h | 35% |

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]
```

---

## 11. Risk Management

### 11.1 Risk Register

| ID | Risk | Probability | Impact | Mitigation | Owner |
|----|------|-------------|--------|------------|-------|
| R1 | AI generates insecure code | Medium | High | Mandatory security review, SAST scanning | Platform |
| R2 | Over-reliance on AI | Medium | Medium | Require understanding of generated code | SM |
| R3 | Context loss between sessions | High | Medium | Robust CLAUDE.md, status tracking | Dev |
| R4 | Team resistance | Low | High | Training, quick wins, celebrate success | SM |
| R5 | Scope creep with AI | Medium | Medium | Strict acceptance criteria, timeboxing | PO |
| R6 | Inconsistent AI usage | Medium | Low | Daily standups, pairing, templates | SM |
| R7 | API costs exceed budget | Low | Medium | Monitor usage, set limits | Platform |
| R8 | Data leakage via prompts | Low | High | Training, automated scanning, audit | Platform |

### 11.2 Escalation Matrix

| Issue Type | First Response | Escalation | Final Decision |
|------------|----------------|------------|----------------|
| Security vulnerability | Platform | Tech Lead | Security Team |
| AI quality issue | Dev pair | Tech Lead | Team consensus |
| Process blocker | SM | Manager | Director |
| Scope change | PO | Product Manager | Stakeholder |
| Tool failure | Platform | Vendor support | Fallback plan |

### 11.3 Contingency Plans

#### AI Tool Unavailable
1. Continue with traditional development
2. Document work for later AI review
3. Reduce sprint commitment by 20%

#### Quality Issues
1. Pause AI usage for affected area
2. Conduct root cause analysis
3. Implement additional safeguards
4. Resume with increased review

#### Team Member Unavailable
1. Redistribute stories
2. Leverage AI for knowledge transfer
3. Pair programming with remaining members

---

## 12. Training Materials

### 12.1 Day 1: Claude Code Fundamentals

**Duration:** 4 hours

**Agenda:**
1. Introduction to AI-assisted development (30 min)
2. Claude Code installation and setup (30 min)
3. Basic commands and navigation (1 hour)
4. Hands-on: Simple code generation (1 hour)
5. Q&A and troubleshooting (1 hour)

**Exercises:**
1. Generate a utility function
2. Write tests for existing code
3. Document a complex function
4. Debug a simple issue

**Materials:**
- Claude Code documentation
- Cheat sheet (see Appendix)
- Practice repository

### 12.2 Day 2: Prompt Engineering

**Duration:** 4 hours

**Agenda:**
1. Principles of effective prompts (1 hour)
2. Context management (1 hour)
3. Role-specific prompting (1 hour)
4. Advanced techniques (1 hour)

**Key Concepts:**
- Be specific and explicit
- Provide relevant context
- Break complex tasks into steps
- Iterate and refine
- Verify outputs

**Exercises:**
1. Improve a vague prompt
2. Write a feature implementation prompt
3. Create a debugging prompt
4. Build a documentation prompt

### 12.3 Day 3: AI-First Workflow

**Duration:** 4 hours

**Agenda:**
1. Daily workflow integration (1 hour)
2. Code review with AI (1 hour)
3. Testing strategies (1 hour)
4. Documentation automation (1 hour)

**Best Practices:**
1. Start with understanding, then generate
2. Review all AI output critically
3. Use AI for tedious tasks
4. Keep human judgment for decisions
5. Document AI contributions

### 12.4 Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│           CLAUDE CODE QUICK REFERENCE                    │
├─────────────────────────────────────────────────────────┤
│ STARTING A SESSION                                       │
│ $ cd /path/to/project                                   │
│ $ claude                                                │
│                                                         │
│ BASIC COMMANDS                                          │
│ /help          Show available commands                  │
│ /clear         Clear conversation                       │
│ /status        Show current state                       │
│                                                         │
│ GOOD PROMPTS                                            │
│ ✅ "Read src/cart/useCart.ts and explain the           │
│    getTotal function, then add tax calculation"         │
│ ✅ "Write tests for the checkout flow covering          │
│    empty cart, single item, and discount scenarios"     │
│                                                         │
│ BAD PROMPTS                                             │
│ ❌ "Fix the bug" (too vague)                            │
│ ❌ "Make it better" (undefined goal)                    │
│ ❌ "Write all the code" (too broad)                     │
│                                                         │
│ CONTEXT TIPS                                            │
│ • Reference specific files                              │
│ • Mention related code                                  │
│ • State constraints explicitly                          │
│ • Break large tasks into steps                          │
│                                                         │
│ REVIEW CHECKLIST                                        │
│ □ Does the code do what I asked?                        │
│ □ Do I understand the code?                             │
│ □ Are edge cases handled?                               │
│ □ Are there security issues?                            │
│ □ Does it follow our conventions?                       │
└─────────────────────────────────────────────────────────┘
```

---

## 13. Governance

### 13.1 Decision Authority Matrix

| Decision Type | Authority | Approval Required |
|--------------|-----------|-------------------|
| Code style changes | Dev | None |
| New dependency (<1k stars) | Dev | Tech Lead |
| New dependency (>1k stars) | Dev | None |
| API contract change | Dev | PO + Tech Lead |
| Database schema change | Dev | Tech Lead |
| Security configuration | Platform | Security Team |
| Infrastructure change | Platform | Tech Lead |
| Process change | SM | Team consensus |
| Scope change | PO | Stakeholder |

### 13.2 AI Usage Policies

**DO:**
- Use AI for code generation, testing, documentation
- Review all AI output before committing
- Share useful prompts with team
- Report AI failures and successes
- Keep CLAUDE.md updated

**DON'T:**
- Share secrets or PII in prompts
- Blindly accept AI suggestions
- Use AI for final security decisions
- Skip code review for AI code
- Ignore licensing concerns

### 13.3 Audit Requirements

**Daily:**
- Prompt count per user
- Acceptance rate
- Flagged interactions

**Weekly:**
- Sensitive data scan
- License compliance check
- Cost analysis

**Sprint:**
- Full audit report
- Security review
- Compliance attestation

---

## 14. Appendici

### 14.1 Glossary

| Term | Definition |
|------|------------|
| AI-First | Development approach prioritizing AI assistance |
| Acceptance Rate | % of AI suggestions accepted by developer |
| CLAUDE.md | Configuration file for Claude Code context |
| Prompt | Input text/instruction given to AI |
| Context Window | Amount of information AI can process at once |

### 14.2 Tool Comparison

| Tool | Use Case | When to Use |
|------|----------|-------------|
| Claude Code | Development | Primary AI tool |
| GitHub Copilot | Inline completion | Quick suggestions |
| ChatGPT | Research | General questions |
| Cursor | IDE integration | VS Code alternative |

### 14.3 Troubleshooting

| Issue | Solution |
|-------|----------|
| Claude slow | Check network, reduce context |
| Wrong context | Clear and restart session |
| Bad suggestions | Improve prompt specificity |
| API errors | Check auth, rate limits |
| Cost concerns | Review usage, optimize prompts |

### 14.4 Resources

**Documentation:**
- Claude Code: https://docs.anthropic.com/claude-code
- Prompt Engineering: https://docs.anthropic.com/prompting

**Internal:**
- CLAUDE_CODE_LIMITATIONS_ANALYSIS.md
- CLAUDE_MD_PATTERNS_eng.md
- Team Slack: #ai-pilot

### 14.5 Feedback Form

```markdown
# Weekly AI Feedback

**Name:** ___________
**Week:** ___________

## Usage Rating (1-10)
- Productivity: ___
- Quality: ___
- Learning: ___
- Satisfaction: ___

## Best AI Moment This Week
[describe]

## Worst AI Moment This Week
[describe]

## Suggestions for Improvement
[describe]

## Would You Recommend AI-First? (Y/N)
___
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-22 | Initial playbook |

---

*Documento creato per il pilot AI-First Development*
*Team: [Team Name]*
*Sponsor: [Sponsor Name]*
