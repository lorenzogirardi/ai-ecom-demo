# Jira MCP Server

MCP Server for Jira integration with Claude Code Enterprise.

## Features

- **Read Operations:**
  - Search issues (JQL)
  - Get issue details
  - Get available transitions
  - Get comments
  - Get project info
  - List/get boards

- **Write Operations:**
  - Create issues (Story, Task, Bug, etc.)
  - Update issue fields
  - Transition issues (status changes)
  - Add comments

## Guardrails

- No delete operations exposed
- Financial fields masked for non-Portfolio roles (configurable)
- All status transitions logged for audit trail
- All changes require human confirmation

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JIRA_BASE_URL` | Yes | Jira instance URL (e.g., https://company.atlassian.net) |
| `JIRA_EMAIL` | Yes | User email for authentication |
| `JIRA_API_TOKEN` | Yes | API token for authentication |
| `AUDIT_LOG_DIR` | No | Local audit log directory |
| `SESSION_ID` | No | Session ID for audit logs |
| `MODEL` | No | Model name for audit logs |

### Claude Code Configuration

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["/path/to/jira-mcp/dist/index.js"],
      "env": {
        "JIRA_BASE_URL": "${JIRA_BASE_URL}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      }
    }
  }
}
```

## Tools

| Tool | Access | Description |
|------|--------|-------------|
| `jira_search_issues` | Read | JQL search |
| `jira_get_issue` | Read | Get issue details |
| `jira_create_issue` | Write | Create story/task/bug |
| `jira_update_issue` | Write | Update fields |
| `jira_get_transitions` | Read | Get available transitions |
| `jira_transition_issue` | Write | Change status |
| `jira_get_comments` | Read | Get comments |
| `jira_add_comment` | Write | Add comment |
| `jira_get_project` | Read | Project info |
| `jira_list_boards` | Read | List boards |
| `jira_get_board` | Read | Board details |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev
```

## License

MIT
