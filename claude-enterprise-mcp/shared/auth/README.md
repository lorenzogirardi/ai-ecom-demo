# Authentication Module

OAuth 2.0 authentication and secure token storage for Claude Code Enterprise.

## Features

- **OAuth 2.0 Flow:** Interactive browser-based authentication
- **Token Storage:** OS keychain integration (secure storage)
- **Auto Refresh:** Automatic token refresh before expiry

## Supported Platforms

| Platform | Storage |
|----------|---------|
| macOS | Keychain |
| Windows | Credential Manager |
| Linux | Secret Service (libsecret) |

## Usage

```typescript
import { OAuthClient, TokenStore, TokenRefresher } from '@claude-enterprise/auth';

// Configure OAuth client
const client = new OAuthClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  authorizationUrl: 'https://auth.company.com/authorize',
  tokenUrl: 'https://auth.company.com/token',
  callbackUrl: 'http://localhost:8080/callback',
  scopes: ['read', 'write'],
});

// Token storage
const store = new TokenStore('claude-enterprise-mcp');

// Check if already authenticated
const hasTokens = await store.hasTokens('github');

if (!hasTokens) {
  // Run interactive OAuth flow
  const tokens = await client.runInteractiveFlow();
  await store.storeTokens('github', tokens);
}

// Auto-refresh handler
const refresher = new TokenRefresher(client, store, 'github');
refresher.startAutoRefresh();

// Get valid token (auto-refreshes if needed)
const accessToken = await refresher.getValidToken();
```

## Configuration

### OAuth Endpoints

| Provider | Authorization URL | Token URL |
|----------|------------------|-----------|
| GitHub | `https://github.com/login/oauth/authorize` | `https://github.com/login/oauth/access_token` |
| Atlassian | `https://auth.atlassian.com/authorize` | `https://auth.atlassian.com/oauth/token` |
| Generic SSO | Company-specific | Company-specific |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OAUTH_CLIENT_ID` | OAuth client ID |
| `OAUTH_CLIENT_SECRET` | OAuth client secret |
| `OAUTH_CALLBACK_PORT` | Callback server port (default: 8080) |

## Security

- Tokens stored in OS keychain (not plaintext)
- Refresh tokens used to minimize exposure
- Auto-cleanup of expired tokens

## License

MIT
