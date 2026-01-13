# Claude Code Commands

Custom slash commands for Claude Code Enterprise governance.

## Available Commands

| Command | Description |
|---------|-------------|
| `/eth0-security-review` | Security review of code changes, PRs, and infrastructure |
| `/eth0-delivery-review` | Release readiness and risk assessment |
| `/eth0-platform-review` | Infrastructure change risk assessment |
| `/eth0-portfolio-insights` | Portfolio and delivery metrics analysis |

## Installation

### Option 1: Symlink to user commands (recommended)

```bash
# Create symlinks in your Claude commands folder
ln -s $(pwd)/eth0-security-review.md ~/.claude/commands/
ln -s $(pwd)/eth0-delivery-review.md ~/.claude/commands/
ln -s $(pwd)/eth0-platform-review.md ~/.claude/commands/
ln -s $(pwd)/eth0-portfolio-insights.md ~/.claude/commands/
```

### Option 2: Copy to user commands

```bash
cp *.md ~/.claude/commands/
```

## Usage

In any Claude Code session:

```
/eth0-security-review
```

The command will:
1. Read project context (CLAUDE.md, AGENTS.md, README.md)
2. Ask clarifying questions
3. Analyze using available tools (including MCP servers if configured)
4. Generate a report in `claude-docs/`

## Command Format

Each command is a markdown file with:

```markdown
name: command-name
description: Brief description

---

Instructions that Claude follows...
```

## Integration with MCP Servers

These commands can leverage the MCP servers in `../servers/` when configured:

- **GitHub MCP**: PR analysis, commit history, file contents
- **Jira MCP**: Issue tracking, sprint data, story status
- **Confluence MCP**: Documentation search and updates
- **AWS MCP**: Infrastructure metrics and status (read-only)

## Connecting Commands

I commands possono essere connessi tra loro in diversi modi per creare workflow più complessi.

### Pattern 1: Workflow Sequenziale

Un command ne invoca un altro in sequenza. Utile per pipeline di review complete.

**Esempio: Release Pipeline**

```
User: /eth0-release-pipeline
```

Crea un nuovo command `eth0-release-pipeline.md`:

```markdown
name: eth0-release-pipeline
description: Full release pipeline with security, delivery, and platform review

---

Esegui una pipeline completa di release seguendo questi step:

## Step 1: Security Review
Prima di tutto, esegui una security review:
- Leggi `claude-docs/security-review-*.md` più recente, se esiste
- Se non esiste o è più vecchio di 24h, chiedi all'utente: "Vuoi eseguire /eth0-security-review prima di continuare?"
- Se ci sono finding CRITICAL o HIGH, STOP e riporta i blocchi

## Step 2: Delivery Review
Se la security è OK:
- Esegui la delivery review seguendo le istruzioni di eth0-delivery-review
- Salva il report in `claude-docs/delivery-review-YYYYMMDD.md`

## Step 3: Platform Review
Se ci sono modifiche IaC (*.tf, helm/, k8s/):
- Esegui platform review seguendo le istruzioni di eth0-platform-review
- Salva il report in `claude-docs/platform-review-YYYYMMDD.md`

## Step 4: Summary Report
Genera un report finale combinato in `claude-docs/release-pipeline-YYYYMMDD.md`:
- GO / NO-GO recommendation
- Link ai singoli report
- Blockers da risolvere
```

**Flow:**
```
/eth0-release-pipeline
        │
        ▼
┌─────────────────┐
│ Security Review │──▶ CRITICAL? ──▶ STOP
└────────┬────────┘
         │ OK
         ▼
┌─────────────────┐
│ Delivery Review │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Platform Review │ (se IaC changes)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Summary Report  │
└─────────────────┘
```

---

### Pattern 2: Shared Context via Files

I commands condividono dati tramite file in `claude-docs/`. Ogni command legge gli output precedenti.

**Convenzione file:**
```
claude-docs/
├── security-review-20260113.md      # Output di /eth0-security-review
├── delivery-review-20260113.md      # Output di /eth0-delivery-review
├── platform-review-20260113.md      # Output di /eth0-platform-review
├── portfolio-insights-20260113.md   # Output di /eth0-portfolio-insights
└── context-shared.md                # Contesto condiviso tra commands
```

**Esempio: context-shared.md**

I commands possono scrivere/leggere un file di contesto condiviso:

```markdown
# Shared Context

## Current Sprint
- Sprint: 42
- End Date: 2026-01-20
- Theme: Performance improvements

## Active Risks
- [SEC-001] SQL injection in /api/search - HIGH
- [PLAT-002] Memory leak in worker pods - MEDIUM

## Blockers
- Waiting for security sign-off on auth changes

## Recent Reviews
| Date | Type | Result | Report |
|------|------|--------|--------|
| 2026-01-13 | Security | 2 HIGH | security-review-20260113.md |
| 2026-01-12 | Delivery | GO | delivery-review-20260112.md |
```

**Come usarlo nei commands:**

Aggiungi questa sezione ai tuoi commands:

```markdown
## Shared Context
Prima di iniziare:
1. Leggi `claude-docs/context-shared.md` se esiste
2. Considera i rischi attivi e blockers nella tua analisi
3. Alla fine, aggiorna `context-shared.md` con nuovi findings
```

---

### Pattern 3: Master Orchestrator

Un command intelligente che decide quali review eseguire in base al contesto del progetto.

**Esempio: eth0-smart-review.md**

```markdown
name: eth0-smart-review
description: Intelligent review orchestrator that runs appropriate reviews based on changes

---

Sei un orchestratore intelligente. Analizza il contesto e decidi quali review eseguire.

## Step 1: Analisi del Contesto

Raccogli informazioni:
1. `git diff --name-only HEAD~10` - ultimi file modificati
2. `git log --oneline -10` - ultimi commit
3. Leggi `claude-docs/context-shared.md` se esiste

## Step 2: Classificazione Modifiche

Classifica i file modificati:

| Pattern | Tipo | Review Necessaria |
|---------|------|-------------------|
| `*.tf`, `terraform/` | Infrastructure | /eth0-platform-review |
| `helm/`, `k8s/`, `*.yaml` (deploy) | Platform | /eth0-platform-review |
| `src/auth/`, `**/security/**` | Security-sensitive | /eth0-security-review |
| `src/**/*.ts`, `src/**/*.py` | Application code | /eth0-security-review (light) |
| `.github/workflows/` | CI/CD | /eth0-platform-review |
| `package.json`, `requirements.txt` | Dependencies | /eth0-security-review |

## Step 3: Decision Matrix

```
IF modifiche infrastructure OR CI/CD:
   → Esegui /eth0-platform-review

IF modifiche security-sensitive OR nuove dependencies:
   → Esegui /eth0-security-review (full)

IF solo application code:
   → Esegui /eth0-security-review (light - solo OWASP top 10)

IF prossimo a release (sprint end < 3 days):
   → Esegui /eth0-delivery-review

IF richiesto report portfolio:
   → Esegui /eth0-portfolio-insights
```

## Step 4: Esecuzione

Per ogni review identificata:
1. Comunica all'utente: "Eseguirò X review basandomi su Y modifiche"
2. Chiedi conferma o skip
3. Esegui le review confermate
4. Genera summary combinato

## Step 5: Output

Scrivi `claude-docs/smart-review-YYYYMMDD.md`:

```markdown
# Smart Review Summary

**Date:** YYYY-MM-DD
**Trigger:** [manual | CI | scheduled]

## Changes Detected
- Infrastructure: X files
- Security-sensitive: X files
- Application: X files

## Reviews Executed
| Review | Result | Findings | Report |
|--------|--------|----------|--------|
| Security | PASS | 0 HIGH | link |
| Platform | WARN | 2 MEDIUM | link |

## Recommendation
[GO | NO-GO | CONDITIONAL]

## Next Actions
1. ...
```
```

**Flow:**
```
/eth0-smart-review
        │
        ▼
┌─────────────────────┐
│ Analyze git changes │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Classify by type    │
└──────────┬──────────┘
           │
     ┌─────┴─────┬─────────────┐
     ▼           ▼             ▼
┌─────────┐ ┌─────────┐ ┌───────────┐
│ IaC?    │ │ Sec?    │ │ Release?  │
│ Platform│ │ Security│ │ Delivery  │
└────┬────┘ └────┬────┘ └─────┬─────┘
     │           │             │
     └─────┬─────┴─────────────┘
           ▼
┌─────────────────────┐
│ Combined Summary    │
└─────────────────────┘
```

---

## Creating Custom Commands

1. Create a new `.md` file in this folder
2. Add YAML front-matter with `name` and `description`
3. Add `---` separator
4. Write instructions for Claude to follow

Example:
```markdown
name: my-custom-review
description: Custom review for my team

---

Read project context first:
- CLAUDE.md
- README.md

Then [your instructions here]...
```
