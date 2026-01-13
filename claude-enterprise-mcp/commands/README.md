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

Commands can be connected together in different ways to create more complex workflows.

### Pattern 1: Sequential Workflow

One command invokes another in sequence. Useful for complete review pipelines.

**Example: Release Pipeline**

```
User: /eth0-release-pipeline
```

Create a new command `eth0-release-pipeline.md`:

```markdown
name: eth0-release-pipeline
description: Full release pipeline with security, delivery, and platform review

---

Execute a complete release pipeline following these steps:

## Step 1: Security Review
First, execute a security review:
- Read most recent `claude-docs/security-review-*.md` if exists
- If not exists or older than 24h, ask user: "Do you want to run /eth0-security-review before continuing?"
- If there are CRITICAL or HIGH findings, STOP and report blockers

## Step 2: Delivery Review
If security is OK:
- Execute delivery review following eth0-delivery-review instructions
- Save report to `claude-docs/delivery-review-YYYYMMDD.md`

## Step 3: Platform Review
If there are IaC changes (*.tf, helm/, k8s/):
- Execute platform review following eth0-platform-review instructions
- Save report to `claude-docs/platform-review-YYYYMMDD.md`

## Step 4: Summary Report
Generate a combined final report in `claude-docs/release-pipeline-YYYYMMDD.md`:
- GO / NO-GO recommendation
- Links to individual reports
- Blockers to resolve
```

**Flow:**

```
/eth0-release-pipeline
         |
         v
  [Security Review] ---> CRITICAL? ---> STOP
         |
         | OK
         v
  [Delivery Review]
         |
         v
  [Platform Review] (if IaC changes)
         |
         v
  [Summary Report]
```

---

### Pattern 2: Shared Context via Files

Commands share data via files in `claude-docs/`. Each command reads previous outputs.

**File convention:**
```
claude-docs/
├── security-review-20260113.md      # Output from /eth0-security-review
├── delivery-review-20260113.md      # Output from /eth0-delivery-review
├── platform-review-20260113.md      # Output from /eth0-platform-review
├── portfolio-insights-20260113.md   # Output from /eth0-portfolio-insights
└── context-shared.md                # Shared context between commands
```

**Example: context-shared.md**

Commands can read/write a shared context file:

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

**How to use in commands:**

Add this section to your commands:

```markdown
## Shared Context
Before starting:
1. Read `claude-docs/context-shared.md` if exists
2. Consider active risks and blockers in your analysis
3. At the end, update `context-shared.md` with new findings
```

---

### Pattern 3: Master Orchestrator

An intelligent command that decides which reviews to run based on project context.

**Example: eth0-smart-review.md**

```markdown
name: eth0-smart-review
description: Intelligent review orchestrator that runs appropriate reviews based on changes

---

You are an intelligent orchestrator. Analyze context and decide which reviews to run.

## Step 1: Context Analysis

Gather information:
1. `git diff --name-only HEAD~10` - recently modified files
2. `git log --oneline -10` - recent commits
3. Read `claude-docs/context-shared.md` if exists

## Step 2: Change Classification

Classify modified files:

| Pattern | Type | Required Review |
|---------|------|-----------------|
| `*.tf`, `terraform/` | Infrastructure | /eth0-platform-review |
| `helm/`, `k8s/`, `*.yaml` (deploy) | Platform | /eth0-platform-review |
| `src/auth/`, `**/security/**` | Security-sensitive | /eth0-security-review |
| `src/**/*.ts`, `src/**/*.py` | Application code | /eth0-security-review (light) |
| `.github/workflows/` | CI/CD | /eth0-platform-review |
| `package.json`, `requirements.txt` | Dependencies | /eth0-security-review |

## Step 3: Decision Matrix

```
IF infrastructure changes OR CI/CD:
   → Run /eth0-platform-review

IF security-sensitive changes OR new dependencies:
   → Run /eth0-security-review (full)

IF only application code:
   → Run /eth0-security-review (light - OWASP top 10 only)

IF close to release (sprint end < 3 days):
   → Run /eth0-delivery-review

IF portfolio report requested:
   → Run /eth0-portfolio-insights
```

## Step 4: Execution

For each identified review:
1. Inform user: "I will run X review based on Y changes"
2. Ask for confirmation or skip
3. Execute confirmed reviews
4. Generate combined summary

## Step 5: Output

Write `claude-docs/smart-review-YYYYMMDD.md`:

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
         |
         v
  [Analyze git changes]
         |
         v
  [Classify by type]
         |
         +--------+--------+
         |        |        |
         v        v        v
      [IaC?]   [Sec?]  [Release?]
     Platform  Security  Delivery
         |        |        |
         +--------+--------+
                  |
                  v
        [Combined Summary]
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
