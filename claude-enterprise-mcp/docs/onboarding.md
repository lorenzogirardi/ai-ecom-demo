# Onboarding Guide

Welcome to Claude Code Enterprise! This guide will help you get started with the enterprise MCP servers and skills.

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Git access to the company repository
- [ ] GitHub Personal Access Token
- [ ] Atlassian API token (for Jira/Confluence)
- [ ] AWS credentials (for read-only access)

## Quick Start

### 1. Installation

```bash
# Clone and setup
git clone git@github.company.com:devtools/claude-enterprise-mcp.git ~/.claude-enterprise
cd ~/.claude-enterprise
./scripts/setup.sh
```

### 2. Authentication

Run the interactive auth setup:

```bash
./scripts/auth-setup.sh
```

Or manually edit `~/.claude-enterprise/.env`:

```bash
# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx

# Atlassian
JIRA_BASE_URL=https://company.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=xxxxxxxxxxxxxxxxxxxxx

# AWS (uses IAM role or profile)
AWS_REGION=eu-west-1
```

### 3. Verify Setup

Start Claude Code and test the tools:

```bash
claude
```

Try these commands:
- "Search for repositories with 'api' in the name"
- "List my open Jira issues"
- "Get the latest page in the Engineering space"

## Available Tools

### GitHub (github-mcp)

| Tool | Description |
|------|-------------|
| `github_search_repositories` | Search repos |
| `github_get_file_contents` | Read files |
| `github_list_pull_requests` | List PRs |
| `github_create_pull_request` | Create PR |
| `github_add_comment` | Comment on PR |

### Jira (jira-mcp)

| Tool | Description |
|------|-------------|
| `jira_search_issues` | JQL search |
| `jira_get_issue` | Get issue |
| `jira_create_issue` | Create issue |
| `jira_update_issue` | Update issue |
| `jira_transition_issue` | Change status |

### Confluence (confluence-mcp)

| Tool | Description |
|------|-------------|
| `confluence_search` | CQL search |
| `confluence_get_page` | Get page |
| `confluence_create_page` | Create page |
| `confluence_update_page` | Update page |

### AWS (aws-mcp) - READ-ONLY

| Tool | Description |
|------|-------------|
| `aws_cloudwatch_get_metrics` | Query metrics |
| `aws_cloudwatch_get_logs` | Query logs |
| `aws_describe_instances` | EC2 info |
| `aws_describe_rds` | RDS info |
| `aws_describe_eks` | EKS info |

## Available Skills (Agents)

### /security-review

Security review of code changes and PRs.

```
/security-review
```

Triggers automatically when:
- PR contains security-relevant files
- IaC changes detected
- Dependency updates

### /delivery-review

Release readiness and risk assessment.

```
/delivery-review
```

Use before releases to:
- Verify story completion
- Check test coverage
- Identify risks

### /platform-review

Infrastructure change risk assessment.

```
/platform-review
```

Use for:
- Terraform changes
- Helm chart updates
- Kubernetes manifest changes

### /portfolio-insights

Portfolio and delivery metrics analysis.

```
/portfolio-insights
```

Use for:
- Quarterly reviews
- Capacity planning
- Executive reporting

## Guardrails

### What You CAN Do

- Read all accessible repositories
- Create pull requests (never direct push)
- Create and update Jira issues
- Create and update Confluence pages
- Read AWS metrics and logs

### What You CANNOT Do

- Push directly to protected branches
- Delete Jira issues or Confluence pages
- Modify AWS resources (read-only)
- Access data outside your permissions

## Troubleshooting

### MCP Server Not Starting

```bash
# Check if servers built
ls ~/.claude-enterprise/servers/*/dist/index.js

# Rebuild if needed
cd ~/.claude-enterprise
npm run build
```

### Authentication Errors

```bash
# Re-run auth setup
./scripts/auth-setup.sh

# Check credentials
cat ~/.claude-enterprise/.env
```

### Audit Logs

Logs are stored in `~/.claude-enterprise/audit-logs/`:

```bash
# View recent logs
tail -f ~/.claude-enterprise/audit-logs/*.jsonl
```

## Getting Help

- **Documentation:** `~/.claude-enterprise/docs/`
- **Slack:** #claude-code-support
- **Issues:** https://github.company.com/devtools/claude-enterprise-mcp/issues

## Updates

```bash
# Check for updates
cd ~/.claude-enterprise
./scripts/update.sh
```
