# Confluence MCP Server

Custom MCP Server for Confluence integration with Claude Code Enterprise.

## Features

- **Read Operations:**
  - Search pages (CQL)
  - Get page content
  - List/get spaces
  - Get comments

- **Write Operations:**
  - Create pages
  - Update pages
  - Add comments

## Guardrails

- No modification of approved/locked pages (handled by Confluence permissions)
- Version history preserved for all changes
- Sensitive spaces restricted by role
- AI-generated content marked for review

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CONFLUENCE_BASE_URL` | Yes | Confluence URL (e.g., https://company.atlassian.net) |
| `CONFLUENCE_EMAIL` | Yes | User email for authentication |
| `CONFLUENCE_API_TOKEN` | Yes | API token for authentication |
| `AUDIT_LOG_DIR` | No | Local audit log directory |
| `SESSION_ID` | No | Session ID for audit logs |
| `MODEL` | No | Model name for audit logs |

### Claude Code Configuration

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "confluence": {
      "command": "node",
      "args": ["/path/to/confluence-mcp/dist/index.js"],
      "env": {
        "CONFLUENCE_BASE_URL": "${CONFLUENCE_BASE_URL}",
        "CONFLUENCE_EMAIL": "${CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "${CONFLUENCE_API_TOKEN}"
      }
    }
  }
}
```

## Tools

| Tool | Access | Description |
|------|--------|-------------|
| `confluence_search` | Read | CQL search |
| `confluence_get_page` | Read | Get page content |
| `confluence_create_page` | Write | Create new page |
| `confluence_update_page` | Write | Update page |
| `confluence_get_space` | Read | Space info |
| `confluence_list_spaces` | Read | List spaces |
| `confluence_get_comments` | Read | Get comments |
| `confluence_add_comment` | Write | Add comment |

## Development

```bash
npm install
npm run build
npm run dev
```

## License

MIT
