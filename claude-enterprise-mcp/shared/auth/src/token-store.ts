import type { OAuthTokens } from './oauth';

/**
 * Token storage interface
 */
interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: string;
  scope?: string;
}

/**
 * Secure token storage using OS keychain
 *
 * Uses:
 * - macOS Keychain
 * - Windows Credential Manager
 * - Linux Secret Service (libsecret)
 */
export class TokenStore {
  private serviceName: string;
  private keytar: typeof import('keytar') | null = null;

  constructor(serviceName = 'claude-enterprise-mcp') {
    this.serviceName = serviceName;
  }

  /**
   * Initialize keytar (lazy load to avoid issues if not installed)
   */
  private async getKeytar(): Promise<typeof import('keytar')> {
    if (!this.keytar) {
      try {
        this.keytar = await import('keytar');
      } catch {
        throw new Error(
          'keytar not available. Install with: npm install keytar'
        );
      }
    }
    return this.keytar;
  }

  /**
   * Store tokens for a tool
   */
  async storeTokens(tool: string, tokens: OAuthTokens): Promise<void> {
    const keytar = await this.getKeytar();
    const data: TokenData = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: tokens.tokenType,
      expiresAt: tokens.expiresAt.toISOString(),
      scope: tokens.scope,
    };

    await keytar.setPassword(this.serviceName, tool, JSON.stringify(data));
  }

  /**
   * Retrieve tokens for a tool
   */
  async getTokens(tool: string): Promise<OAuthTokens | null> {
    const keytar = await this.getKeytar();
    const data = await keytar.getPassword(this.serviceName, tool);

    if (!data) {
      return null;
    }

    try {
      const parsed: TokenData = JSON.parse(data);
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        tokenType: parsed.tokenType,
        expiresIn: 0, // Not stored
        expiresAt: new Date(parsed.expiresAt),
        scope: parsed.scope,
      };
    } catch {
      return null;
    }
  }

  /**
   * Delete tokens for a tool
   */
  async deleteTokens(tool: string): Promise<boolean> {
    const keytar = await this.getKeytar();
    return keytar.deletePassword(this.serviceName, tool);
  }

  /**
   * Check if tokens exist for a tool
   */
  async hasTokens(tool: string): Promise<boolean> {
    const tokens = await this.getTokens(tool);
    return tokens !== null;
  }

  /**
   * Check if tokens are expired
   */
  async isExpired(tool: string, bufferSeconds = 60): Promise<boolean> {
    const tokens = await this.getTokens(tool);
    if (!tokens) {
      return true;
    }

    const now = new Date();
    const expiry = new Date(tokens.expiresAt.getTime() - bufferSeconds * 1000);
    return now >= expiry;
  }

  /**
   * List all stored tools
   */
  async listTools(): Promise<string[]> {
    const keytar = await this.getKeytar();
    const credentials = await keytar.findCredentials(this.serviceName);
    return credentials.map((c) => c.account);
  }
}
