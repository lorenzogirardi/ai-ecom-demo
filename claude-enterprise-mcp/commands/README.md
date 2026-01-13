# Claude Code Commands

Custom slash commands for Claude Code Enterprise governance.

## Available Commands

| Command | Description |
|---------|-------------|
| `/eth0-security-review` | Security review of code changes, PRs, and infrastructure |
| `/eth0-delivery-review` | Release readiness and risk assessment |
| `/eth0-platform-review` | Infrastructure change risk assessment |
| `/eth0-portfolio-insights` | Portfolio and delivery metrics analysis |
| `/eth0-smart-review` | Intelligent orchestrator that runs appropriate reviews based on changes |

## Installation

### Option 1: Symlink to user commands (recommended)

```bash
# Create symlinks in your Claude commands folder
ln -s $(pwd)/eth0-security-review.md ~/.claude/commands/
ln -s $(pwd)/eth0-delivery-review.md ~/.claude/commands/
ln -s $(pwd)/eth0-platform-review.md ~/.claude/commands/
ln -s $(pwd)/eth0-portfolio-insights.md ~/.claude/commands/
ln -s $(pwd)/eth0-smart-review.md ~/.claude/commands/
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

Create a new command `eth0-release-pipeline.md` with:

- **name:** eth0-release-pipeline
- **description:** Full release pipeline with security, delivery, and platform review

**Steps:**
1. **Security Review** - Check for CRITICAL/HIGH findings, STOP if found
2. **Delivery Review** - Execute if security OK
3. **Platform Review** - Execute if IaC changes (*.tf, helm/, k8s/)
4. **Summary Report** - Generate combined report with GO/NO-GO recommendation

**Flow:**

1. **Security Review** → if CRITICAL/HIGH → **STOP**
2. **Delivery Review** (if security OK)
3. **Platform Review** (if IaC changes detected)
4. **Summary Report**

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

See the actual implementation in [eth0-smart-review.md](./eth0-smart-review.md).

Key steps:
1. **Context Analysis** - git diff, git log, read context-shared.md
2. **Change Classification** - categorize files by type
3. **Decision Matrix** - select appropriate reviews
4. **Execution** - run confirmed reviews
5. **Output** - generate combined summary

**Flow:**

1. **Analyze git changes** (git diff, git log)
2. **Classify by type** (IaC, security, application, dependencies)
3. **Decision matrix:**
   - IaC changes → `eth0-platform-review`
   - Security changes → `eth0-security-review`
   - Near release → `eth0-delivery-review`
4. **Execute selected reviews**
5. **Combined Summary**

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
