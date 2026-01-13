# Claude Code Enterprise MCP

Enterprise governance framework for Claude Code with MCP (Model Context Protocol) integrations.

## Overview

This repository provides enterprise-ready MCP servers and Claude Code skills for:

- **GitHub** - Code repository integration (read + PR-only write)
- **Jira** - Issue tracking and project management
- **Confluence** - Documentation and knowledge base
- **AWS** - Cloud infrastructure (read-only)

Plus Claude Code commands (agents) for:

- `/wds-security-review` - Automated security analysis
- `/wds-delivery-review` - Release readiness assessment
- `/wds-platform-review` - Infrastructure change review
- `/wds-portfolio-insights` - Delivery metrics and reporting

## Quick Start

```bash
# Install
git clone git@github.company.com:devtools/claude-enterprise-mcp.git ~/.claude-enterprise
cd ~/.claude-enterprise
./scripts/setup.sh

# Start Claude Code
claude
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Developer Workstation                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐     ┌─────────────────────────────────┐  │
│  │ Claude Code  │────▶│        MCP Servers (Local)       │  │
│  │   (CLI)      │     │  ┌───────┐ ┌───────┐ ┌───────┐  │  │
│  └──────────────┘     │  │GitHub │ │ Jira  │ │Conflu │  │  │
│                       │  └───────┘ └───────┘ └───────┘  │  │
│                       │           ┌───────┐              │  │
│                       │           │  AWS  │ (read-only) │  │
│                       │           └───────┘              │  │
│                       └──────────────┬──────────────────┘  │
│                                      │                      │
│  ┌───────────────────────────────────┼───────────────────┐ │
│  │            Audit Logger (to central)                   │ │
│  └───────────────────────────────────┴───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Repository Structure

```
claude-enterprise-mcp/
├── servers/                    # MCP Server implementations
│   ├── github-mcp/
│   ├── jira-mcp/
│   ├── confluence-mcp/
│   └── aws-mcp/
├── shared/                     # Shared modules
│   ├── audit-logger/          # Centralized logging
│   └── auth/                  # OAuth + token storage
├── commands/                   # Claude Code commands (agents)
│   ├── wds-security-review.md
│   ├── wds-delivery-review.md
│   ├── wds-platform-review.md
│   └── wds-portfolio-insights.md
├── scripts/                    # Setup and configuration
├── config/                     # Configuration examples
└── docs/                       # Documentation
```

## Available Tools

### GitHub

| Tool | Access | Description |
|------|--------|-------------|
| `github_search_repositories` | Read | Search repos |
| `github_get_file_contents` | Read | Read files |
| `github_list_pull_requests` | Read | List PRs |
| `github_get_pull_request` | Read | Get PR details |
| `github_create_pull_request` | Write | Create PR |
| `github_add_comment` | Write | Comment on PR |
| `github_list_commits` | Read | Commit history |

### Jira

| Tool | Access | Description |
|------|--------|-------------|
| `jira_search_issues` | Read | JQL search |
| `jira_get_issue` | Read | Get issue |
| `jira_create_issue` | Write | Create issue |
| `jira_update_issue` | Write | Update issue |
| `jira_transition_issue` | Write | Change status |
| `jira_add_comment` | Write | Add comment |
| `jira_get_project` | Read | Project info |

### Confluence

| Tool | Access | Description |
|------|--------|-------------|
| `confluence_search` | Read | CQL search |
| `confluence_get_page` | Read | Get page |
| `confluence_create_page` | Write | Create page |
| `confluence_update_page` | Write | Update page |
| `confluence_add_comment` | Write | Add comment |
| `confluence_get_space` | Read | Space info |

### AWS (READ-ONLY)

| Tool | Access | Description |
|------|--------|-------------|
| `aws_cloudwatch_get_metrics` | Read | Query metrics |
| `aws_cloudwatch_get_logs` | Read | Query logs |
| `aws_describe_instances` | Read | EC2 info |
| `aws_describe_rds` | Read | RDS info |
| `aws_describe_eks` | Read | EKS info |

## Available Commands

| Command | Description |
|---------|-------------|
| `/wds-security-review` | Security analysis of code, PRs, infrastructure |
| `/wds-delivery-review` | Release readiness and risk assessment |
| `/wds-platform-review` | IaC and platform change review |
| `/wds-portfolio-insights` | Portfolio metrics and reporting |

### Installing Commands

```bash
# Symlink to your Claude commands folder
ln -s $(pwd)/commands/*.md ~/.claude/commands/
```

## Guardrails

- **No direct production changes** - AWS is read-only
- **PR-only code changes** - No direct push to main
- **Audit logging** - All actions logged
- **Human accountability** - AI advises, humans decide

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run in development mode
npm run dev

# Run tests
npm run test

# Lint
npm run lint
```

## Configuration

### Environment Variables

Create `.env` in the root directory:

```bash
# GitHub
GITHUB_TOKEN=ghp_xxxxx

# Atlassian
JIRA_BASE_URL=https://company.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=xxxxx
CONFLUENCE_BASE_URL=https://company.atlassian.net
CONFLUENCE_EMAIL=your.email@company.com
CONFLUENCE_API_TOKEN=xxxxx

# AWS
AWS_REGION=eu-west-1

# Audit (optional)
CENTRAL_LOG_ENDPOINT=https://logs.company.com/api
```

## Documentation

- [Onboarding Guide](./docs/onboarding.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Upgrade Guide](./docs/upgrade-guide.md)

## License

Internal use only - Company confidential

---

*Version 1.0.0 - 2026-01-13*
