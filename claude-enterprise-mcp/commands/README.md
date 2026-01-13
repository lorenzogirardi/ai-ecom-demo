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
