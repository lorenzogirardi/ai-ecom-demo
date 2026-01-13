import axios from 'axios';
import * as http from 'http';
import * as url from 'url';

/**
 * OAuth configuration
 */
export interface OAuthConfig {
  /** OAuth client ID */
  clientId: string;
  /** OAuth client secret */
  clientSecret: string;
  /** Authorization endpoint */
  authorizationUrl: string;
  /** Token endpoint */
  tokenUrl: string;
  /** Callback URL for OAuth redirect */
  callbackUrl: string;
  /** OAuth scopes */
  scopes: string[];
}

/**
 * OAuth tokens
 */
export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: Date;
  scope?: string;
}

/**
 * OAuth 2.0 client for enterprise SSO
 */
export class OAuthClient {
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Generate authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      state,
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Start local server to handle OAuth callback
   */
  async startCallbackServer(
    port: number,
    onCode: (code: string) => void
  ): Promise<http.Server> {
    return new Promise((resolve) => {
      const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url || '', true);

        if (parsedUrl.pathname === '/callback') {
          const code = parsedUrl.query.code as string;
          const error = parsedUrl.query.error as string;

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`<h1>Authentication Error</h1><p>${error}</p>`);
          } else if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Authentication Successful</h1><p>You can close this window.</p>');
            onCode(code);
          }
        } else {
          res.writeHead(404);
          res.end();
        }
      });

      server.listen(port, () => {
        resolve(server);
      });
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const response = await axios.post(
      this.config.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.callbackUrl,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const data = response.data;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scope: data.scope,
    };
  }

  /**
   * Refresh tokens using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<OAuthTokens> {
    const response = await axios.post(
      this.config.tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const data = response.data;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scope: data.scope,
    };
  }

  /**
   * Run interactive OAuth flow
   */
  async runInteractiveFlow(): Promise<OAuthTokens> {
    const state = Math.random().toString(36).substring(7);
    const authUrl = this.getAuthorizationUrl(state);

    console.error('Opening browser for authentication...');
    console.error(`If browser doesn't open, visit: ${authUrl}`);

    // Open browser
    const open = await import('open').catch(() => null);
    if (open) {
      await open.default(authUrl);
    }

    // Start callback server
    return new Promise((resolve, reject) => {
      const port = new URL(this.config.callbackUrl).port || '8080';

      this.startCallbackServer(parseInt(port), async (code) => {
        try {
          const tokens = await this.exchangeCodeForTokens(code);
          resolve(tokens);
        } catch (error) {
          reject(error);
        }
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        reject(new Error('OAuth flow timed out'));
      }, 5 * 60 * 1000);
    });
  }
}
