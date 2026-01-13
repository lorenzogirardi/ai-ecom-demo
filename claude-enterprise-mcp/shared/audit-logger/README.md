# Audit Logger

Centralized audit logging module for Claude Code Enterprise MCP servers.

## Features

- **Consistent Format:** Standard log structure across all tools
- **Local Buffer:** JSONL files for durability
- **Central Shipping:** Async batch shipping to CloudWatch/Splunk/ELK
- **Sensitive Data:** Automatic sanitization of credentials
- **Tool Wrapper:** Easy integration with MCP handlers

## Installation

```bash
npm install @claude-enterprise/audit-logger
```

## Usage

```typescript
import { createAuditLogger } from '@claude-enterprise/audit-logger';

const logger = createAuditLogger({
  tool: 'github',
  sessionId: process.env.SESSION_ID,
  model: 'claude-opus-4-5',
  localBufferDir: './audit-logs',
  centralEndpoint: 'https://logs.company.com/api/logs',
  centralApiKey: process.env.LOG_API_KEY,
});

await logger.init();

// Direct logging
await logger.log({
  user: 'john@company.com',
  action: 'create_pr',
  parameters: { repo: 'my-repo', title: 'Fix bug' },
  result: 'success',
});

// Wrap a handler
const wrappedHandler = logger.wrap('search', async (args) => {
  return searchRepositories(args);
});

const result = await wrappedHandler({ query: 'react' }, 'john@company.com');
```

## Log Format

```json
{
  "timestamp": "2026-01-13T10:30:00Z",
  "user": "john@company.com",
  "tool": "github",
  "action": "create_pr",
  "parameters": {
    "repo": "my-repo",
    "title": "Fix bug"
  },
  "result": "success",
  "ai_context": {
    "session_id": "uuid",
    "model": "claude-opus-4-5"
  }
}
```

## Configuration

| Option | Required | Description |
|--------|----------|-------------|
| `tool` | Yes | Tool name (github, jira, confluence, aws) |
| `sessionId` | Yes | Claude Code session ID |
| `model` | Yes | Model name |
| `localBufferDir` | No | Local log directory (default: ./audit-logs) |
| `centralEndpoint` | No | Central logging endpoint |
| `centralApiKey` | No | API key for central logging |
| `batchSize` | No | Batch size for shipping (default: 100) |
| `flushIntervalMs` | No | Flush interval (default: 60000) |

## Retention

| Location | Retention |
|----------|-----------|
| Local buffer | 7 days (auto-cleanup) |
| Central logs | Per compliance policy |

## License

MIT
