# GitHub MCP Server

MCP Server for GitHub integration with Claude Code Enterprise.

## Features

- **Read Operations:**
  - Search repositories
  - Get file contents
  - List pull requests
  - Get pull request details
  - List commits
  - List comments

- **Write Operations (PR-only):**
  - Create pull requests
  - Add comments to PRs/issues

## Guardrails

- No direct push to branches - all changes via PR
- All operations logged to central audit system
- Access scoped to user's GitHub permissions

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes | GitHub PAT or OAuth token |
| `AUDIT_LOG_DIR` | No | Local audit log directory (default: `./audit-logs`) |
| `SESSION_ID` | No | Session ID for audit logs |
| `MODEL` | No | Model name for audit logs |

### Claude Code Configuration

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/path/to/github-mcp/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Tools

| Tool | Access | Description |
|------|--------|-------------|
| `github_search_repositories` | Read | Search repos |
| `github_get_file_contents` | Read | Read file contents |
| `github_list_pull_requests` | Read | List PRs |
| `github_get_pull_request` | Read | Get PR details |
| `github_create_pull_request` | Write | Create PR |
| `github_add_comment` | Write | Comment on PR/issue |
| `github_list_commits` | Read | List commit history |
| `github_list_comments` | Read | List comments |

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
