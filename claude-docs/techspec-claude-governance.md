# Technical Specification: Claude Code Enterprise Governance

## Feature Overview

Technical implementation of Claude Code enterprise governance framework with MCP (Model Context Protocol) integrations for Jira, GitHub, Confluence, and AWS.

**Related Documents:**
- [Feature Spec](./feature-claude-governance.md) - Business requirements
- [Governance Framework](../ecommerce-demo/slides/CLAUDE_CODE_GOVERNANCE_FRAMEWORK_eng.md) - Full governance document
- [Technical Guardrails](../ecommerce-demo/slides/MULTI_TEAM_GUARDRAILS_eng.md) - Implementation patterns

---

## Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Developer Workstation                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌─────────────────────────────────────────┐  │
│  │ Claude Code  │────▶│           MCP Servers (Local)            │  │
│  │   (CLI)      │     │  ┌─────────┐ ┌─────────┐ ┌───────────┐  │  │
│  └──────────────┘     │  │ GitHub  │ │  Jira   │ │ Confluence│  │  │
│                       │  │  MCP    │ │  MCP    │ │    MCP    │  │  │
│                       │  └────┬────┘ └────┬────┘ └─────┬─────┘  │  │
│                       │       │           │            │         │  │
│                       │  ┌────┴───────────┴────────────┴─────┐  │  │
│                       │  │         AWS MCP (Read-Only)       │  │  │
│                       │  └───────────────┬───────────────────┘  │  │
│                       └──────────────────┼───────────────────────┘  │
│                                          │                          │
│  ┌───────────────────────────────────────┼───────────────────────┐ │
│  │                    Audit Logger                                │ │
│  │              (sends to central logging)                        │ │
│  └───────────────────────────────────────┼───────────────────────┘ │
└──────────────────────────────────────────┼──────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      ▼                      │
                    │    ┌─────────────────────────────────┐     │
                    │    │     Enterprise Systems           │     │
                    │    │  ┌───────┐ ┌───────┐ ┌───────┐  │     │
                    │    │  │GitHub │ │ Jira  │ │Conflu │  │     │
                    │    │  │  API  │ │  API  │ │ence   │  │     │
                    │    │  └───────┘ └───────┘ └───────┘  │     │
                    │    │           ┌───────┐             │     │
                    │    │           │  AWS  │             │     │
                    │    │           │  APIs │             │     │
                    │    │           └───────┘             │     │
                    │    └─────────────────────────────────┘     │
                    │                                            │
                    │    ┌─────────────────────────────────┐     │
                    │    │     Central Audit Logging        │     │
                    │    │    (CloudWatch / Splunk / ELK)   │     │
                    │    └─────────────────────────────────┘     │
                    └────────────────────────────────────────────┘
```

### Component Overview

| Component | Location | Purpose |
|-----------|----------|---------|
| Claude Code | Local | AI assistant CLI |
| MCP Servers | Local | Tool integrations via MCP protocol |
| Audit Logger | Local → Central | Log all AI-assisted actions |
| Enterprise APIs | Remote | Jira, GitHub, Confluence, AWS |
| Central Logging | Remote | Audit trail and compliance |

---

## MCP Servers Implementation

### 1. MCP Server Sources

| Tool | Source | Customization |
|------|--------|---------------|
| **GitHub** | Community (`@modelcontextprotocol/server-github`) | Minor: add audit logging |
| **Jira** | Community + Custom | Extend for enterprise workflows |
| **Confluence** | Custom | Build from scratch |
| **AWS** | Community (`@modelcontextprotocol/server-aws`) | Restrict to read-only |

### 2. MCP Server: GitHub

**Base:** `@modelcontextprotocol/server-github`

**Tools Exposed:**

| Tool | Access | Description |
|------|--------|-------------|
| `github_search_repositories` | Read | Search repos |
| `github_get_file_contents` | Read | Read file contents |
| `github_list_pull_requests` | Read | List PRs |
| `github_get_pull_request` | Read | Get PR details |
| `github_create_pull_request` | Write | Create PR (not direct push) |
| `github_add_comment` | Write | Comment on PR/issue |
| `github_list_commits` | Read | List commit history |

**Guardrails (via IAM/RBAC backend):**
- No `github_push_files` - PRs only
- No access to repos outside user's permissions
- Write operations scoped to user's team repos

### 3. MCP Server: Jira

**Base:** Community + Custom extensions

**Tools Exposed:**

| Tool | Access | Description |
|------|--------|-------------|
| `jira_search_issues` | Read | JQL search |
| `jira_get_issue` | Read | Get issue details |
| `jira_create_issue` | Write | Create story/task/bug |
| `jira_update_issue` | Write | Update fields |
| `jira_add_comment` | Write | Add comment |
| `jira_transition_issue` | Write | Change status |
| `jira_get_project` | Read | Project info |
| `jira_get_board` | Read | Board/sprint info |

**Guardrails (via IAM/RBAC backend):**
- No delete operations exposed
- Financial fields masked for non-Portfolio roles
- Status transitions logged for audit

### 4. MCP Server: Confluence

**Base:** Custom (build from scratch)

**Tools Exposed:**

| Tool | Access | Description |
|------|--------|-------------|
| `confluence_search` | Read | Search pages |
| `confluence_get_page` | Read | Get page content |
| `confluence_create_page` | Write | Create new page |
| `confluence_update_page` | Write | Update page content |
| `confluence_get_space` | Read | Space info |
| `confluence_add_comment` | Write | Comment on page |

**Guardrails (via IAM/RBAC backend):**
- No modification of locked/approved pages
- Sensitive spaces restricted by role
- All changes versioned

### 5. MCP Server: AWS

**Base:** `@modelcontextprotocol/server-aws` (restricted)

**Tools Exposed:**

| Tool | Access | Description |
|------|--------|-------------|
| `aws_cloudwatch_get_metrics` | Read | Get metrics |
| `aws_cloudwatch_get_logs` | Read | Query logs |
| `aws_describe_instances` | Read | EC2 info |
| `aws_describe_rds` | Read | RDS info |
| `aws_describe_eks` | Read | EKS info |

**Guardrails (hardcoded in MCP server):**
- **No write operations exposed at all**
- Production account: read-only metrics/logs only
- IaC changes via GitHub MCP (PR to terraform repo)

---

## Authentication

### SSO/OAuth Flow

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   User       │     │   MCP Server    │     │  Enterprise  │
│              │     │                 │     │     IdP      │
└──────┬───────┘     └────────┬────────┘     └──────┬───────┘
       │                      │                      │
       │  1. Start MCP        │                      │
       │─────────────────────▶│                      │
       │                      │                      │
       │  2. Auth required    │                      │
       │◀─────────────────────│                      │
       │                      │                      │
       │  3. Browser OAuth    │                      │
       │──────────────────────┼─────────────────────▶│
       │                      │                      │
       │  4. OAuth callback   │                      │
       │◀─────────────────────┼──────────────────────│
       │                      │                      │
       │  5. Token to MCP     │                      │
       │─────────────────────▶│                      │
       │                      │                      │
       │  6. Token cached     │                      │
       │◀─────────────────────│                      │
       │                      │                      │
```

### Token Management

| Aspect | Implementation |
|--------|----------------|
| Storage | Local keychain (macOS Keychain, Windows Credential Manager) |
| Refresh | Automatic token refresh before expiry |
| Revocation | On logout or session timeout |
| Multi-tool | Separate tokens per tool (GitHub PAT, Jira OAuth, etc.) |

---

## Audit Logging

### Log Structure

```json
{
  "timestamp": "2026-01-13T10:30:00Z",
  "user": "john.doe@company.com",
  "tool": "jira",
  "action": "create_issue",
  "parameters": {
    "project": "PROJ",
    "type": "Story",
    "summary": "Implement feature X"
  },
  "result": "success",
  "issue_key": "PROJ-123",
  "ai_context": {
    "session_id": "uuid",
    "prompt_hash": "sha256",
    "model": "claude-opus-4-5"
  }
}
```

### Log Shipping

```
Local MCP Server
      │
      ▼
Local Log Buffer (file)
      │
      ▼ (async, batched)
Central Logging (CloudWatch/Splunk/ELK)
```

### Retention

| Log Type | Retention |
|----------|-----------|
| Local buffer | 7 days |
| Central audit | 1 year (compliance) |
| Error logs | 90 days |

---

## AI Agents (Claude Code Skills)

### Implementation Pattern

Agents implemented as Claude Code skills (prompts + tool orchestration).

**Skill Structure:**

```
claude-enterprise-skills/
├── skills/
│   ├── delivery-agent/
│   │   ├── skill.yaml          # Skill definition
│   │   └── prompt.md           # Agent prompt
│   ├── platform-agent/
│   │   ├── skill.yaml
│   │   └── prompt.md
│   ├── security-agent/
│   │   ├── skill.yaml
│   │   └── prompt.md
│   └── portfolio-agent/
│       ├── skill.yaml
│       └── prompt.md
└── README.md
```

### Example: Security Agent Skill

```yaml
# skills/security-agent/skill.yaml
name: security-review
description: Security review of code changes and PRs

triggers:
  - manual: /security-review
  - suggested:
      - when: "PR contains security-relevant files"
      - when: "IaC changes detected"

tools_required:
  - github
  - jira

output:
  - security_findings.md
  - jira_issues (optional)
```

### Agent Trigger Behavior

| Mode | Behavior |
|------|----------|
| **Manual** | User invokes via `/agent-name` command |
| **Suggested** | Claude Code suggests agent when context matches, user confirms |

---

## Distribution and Deployment

### Repository Structure

```
company/claude-enterprise-mcp/
├── servers/
│   ├── github-mcp/
│   │   ├── package.json
│   │   ├── src/
│   │   └── Dockerfile
│   ├── jira-mcp/
│   │   ├── package.json
│   │   ├── src/
│   │   └── Dockerfile
│   ├── confluence-mcp/
│   │   ├── package.json
│   │   ├── src/
│   │   └── Dockerfile
│   └── aws-mcp/
│       ├── package.json
│       ├── src/
│       └── Dockerfile
├── skills/
│   └── (agent skills)
├── scripts/
│   ├── setup.sh              # Full setup script
│   ├── update.sh             # Update to latest version
│   └── configure-claude.sh   # Configure Claude Code
├── config/
│   ├── claude-code-config.example.json
│   └── mcp-servers.example.json
└── README.md
```

### Setup Script

```bash
#!/bin/bash
# scripts/setup.sh

# 1. Clone repo
git clone git@github.company.com:devtools/claude-enterprise-mcp.git ~/.claude-enterprise

# 2. Install dependencies
cd ~/.claude-enterprise
npm install --workspaces

# 3. Build MCP servers
npm run build --workspaces

# 4. Configure Claude Code
./scripts/configure-claude.sh

# 5. Setup authentication
./scripts/auth-setup.sh

echo "Setup complete. Run 'claude' to start."
```

### Versioning

| Version | Meaning |
|---------|---------|
| `1.0.0` | Initial release |
| `1.1.0` | New features (backward compatible) |
| `2.0.0` | Breaking changes (migration guide required) |

**Update Notifications:**
- Slack notification on new release
- Claude Code shows update available message
- Breaking changes require explicit `--upgrade` flag

---

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Integration approach | MCP Servers | Standard Anthropic protocol, extensible |
| MCP source | Community + Custom | Leverage existing, customize where needed |
| Hosting | Local (all) | Simplicity, no infra overhead for pilot |
| Authentication | SSO/OAuth | Enterprise standard, per-user identity |
| Guardrails | IAM/RBAC backend | Leverage existing permissions, no duplication |
| Audit logging | Centralized | Compliance requirement, single source of truth |
| Agents | Claude Code Skills | Native integration, manual + suggested triggers |
| Distribution | Repo + script | Simple, controlled, auditable |
| Versioning | SemVer + alerts | Clear upgrade path, breaking change visibility |

---

## Questions & Answers Log

| # | Question | Answer |
|---|----------|--------|
| 1 | Integration approach (MCP, API, middleware)? | MCP Servers (Anthropic standard) |
| 2 | MCP source (community, custom, both)? | Community + Custom |
| 3 | Hosting (EKS, Lambda, local, hybrid)? | Hybrid → All local |
| 4 | Hybrid separation? | All local |
| 5 | Authentication method? | SSO/OAuth aziendale |
| 6 | Audit logging? | Centralizzato |
| 7 | Guardrails implementation? | IAM/RBAC backend |
| 8 | Agents implementation? | Claude Code Skills |
| 9 | Agent triggers? | Manuale + suggeriti |
| 10 | Pilot scope? | Tutte le integrazioni |
| 11 | Distribution method? | Repo aziendale + script |
| 12 | Versioning strategy? | SemVer + breaking change alerts |

---

## Ticket JIRAs

### Epic: GOV-001 - Claude Code Enterprise Governance

| Ticket | Title | Type | Priority | Dev Estimate | Claude Code |
|--------|-------|------|----------|--------------|-------------|
| GOV-002 | Setup enterprise MCP monorepo | Task | High | M | 30 min |
| GOV-003 | GitHub MCP server customization | Task | High | M | 45 min |
| GOV-004 | Jira MCP server (community + extensions) | Task | High | L | 2 hours |
| GOV-005 | Confluence MCP server (custom) | Task | High | L | 3 hours |
| GOV-006 | AWS MCP server (read-only restriction) | Task | High | M | 1 hour |
| GOV-007 | Centralized audit logging integration | Task | High | M | 1 hour |
| GOV-008 | SSO/OAuth authentication flow | Task | High | L | 2 hours |
| GOV-009 | Setup script for developers | Task | Medium | S | 30 min |
| GOV-010 | Claude Code configuration automation | Task | Medium | S | 20 min |
| GOV-011 | Security Agent skill | Task | Medium | M | 1 hour |
| GOV-012 | Delivery Agent skill | Task | Medium | M | 1 hour |
| GOV-013 | Platform Agent skill | Task | Medium | M | 1 hour |
| GOV-014 | Portfolio Agent skill | Task | Low | M | 1 hour |
| GOV-015 | Version update notification system | Task | Medium | S | 30 min |
| GOV-016 | Documentation and onboarding guide | Task | Medium | M | 1 hour |
| GOV-017 | Pilot team setup and training | Task | High | L | 2 hours |

**Dev Estimate Legend:** S = Small (1-2h), M = Medium (3-5h), L = Large (6-8h)

**Totals:**
- Developer: ~40-60 hours (2-3 weeks)
- Claude Code: ~17 hours (2-3 sessions)

---

*Document created: 2026-01-13*
*Status: Ready for Implementation Planning*
