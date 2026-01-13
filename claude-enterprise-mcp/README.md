# Claude Code Enterprise MCP

Enterprise governance framework for Claude Code with MCP (Model Context Protocol) integrations.

## Overview

This repository provides enterprise-ready MCP servers and Claude Code skills for:

- **GitHub** - Code repository integration (read + PR-only write)
- **Jira** - Issue tracking and project management
- **Confluence** - Documentation and knowledge base
- **AWS** - Cloud infrastructure (read-only)

Plus AI agents (skills) for:

- **Security Review** - Automated security analysis
- **Delivery Review** - Release readiness assessment
- **Platform Review** - Infrastructure change review
- **Portfolio Insights** - Delivery metrics and reporting

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
├── skills/                     # Claude Code skills (agents)
│   ├── security-agent/
│   ├── delivery-agent/
│   ├── platform-agent/
│   └── portfolio-agent/
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

## Available Skills

| Skill | Command | Description |
|-------|---------|-------------|
| Security Review | `/security-review` | Security analysis of PRs |
| Delivery Review | `/delivery-review` | Release readiness check |
| Platform Review | `/platform-review` | IaC change review |
| Portfolio Insights | `/portfolio-insights` | Metrics and reporting |

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
