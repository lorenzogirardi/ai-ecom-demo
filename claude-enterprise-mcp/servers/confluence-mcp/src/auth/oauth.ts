/**
 * Confluence OAuth authentication module
 *
 * Uses same OAuth flow as Jira (Atlassian Cloud).
 * For now, we use basic auth with API token.
 */

export interface ConfluenceOAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes: string[];
}

export interface ConfluenceOAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export function getAuthorizationUrl(config: ConfluenceOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    audience: 'api.atlassian.com',
    client_id: config.clientId,
    scope: config.scopes.join(' '),
    redirect_uri: config.callbackUrl,
    state,
    response_type: 'code',
    prompt: 'consent',
  });

  return `https://auth.atlassian.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  _config: ConfluenceOAuthConfig,
  _code: string
): Promise<ConfluenceOAuthTokens> {
  throw new Error('OAuth flow not implemented - use API token authentication');
}

export async function refreshTokens(
  _config: ConfluenceOAuthConfig,
  _refreshToken: string
): Promise<ConfluenceOAuthTokens> {
  throw new Error('OAuth flow not implemented - use API token authentication');
}
