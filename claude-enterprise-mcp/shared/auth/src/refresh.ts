import type { OAuthClient, OAuthTokens } from './oauth';
import type { TokenStore } from './token-store';

/**
 * Automatic token refresh handler
 */
export class TokenRefresher {
  private client: OAuthClient;
  private store: TokenStore;
  private tool: string;
  private refreshHandle?: NodeJS.Timer;

  constructor(client: OAuthClient, store: TokenStore, tool: string) {
    this.client = client;
    this.store = store;
    this.tool = tool;
  }

  /**
   * Get valid access token, refreshing if needed
   */
  async getValidToken(): Promise<string> {
    const isExpired = await this.store.isExpired(this.tool, 300); // 5 min buffer

    if (isExpired) {
      await this.refresh();
    }

    const tokens = await this.store.getTokens(this.tool);
    if (!tokens) {
      throw new Error(`No tokens found for ${this.tool}. Run authentication first.`);
    }

    return tokens.accessToken;
  }

  /**
   * Refresh tokens and store new ones
   */
  async refresh(): Promise<OAuthTokens> {
    const currentTokens = await this.store.getTokens(this.tool);
    if (!currentTokens?.refreshToken) {
      throw new Error(`No refresh token for ${this.tool}. Run authentication first.`);
    }

    try {
      const newTokens = await this.client.refreshTokens(currentTokens.refreshToken);
      await this.store.storeTokens(this.tool, newTokens);
      return newTokens;
    } catch (error) {
      // If refresh fails, delete invalid tokens
      await this.store.deleteTokens(this.tool);
      throw new Error(`Token refresh failed for ${this.tool}. Re-authentication required.`);
    }
  }

  /**
   * Start automatic refresh before expiry
   */
  startAutoRefresh(checkIntervalMs = 60000): void {
    if (this.refreshHandle) {
      return;
    }

    this.refreshHandle = setInterval(async () => {
      try {
        const isExpired = await this.store.isExpired(this.tool, 600); // 10 min buffer
        if (isExpired) {
          await this.refresh();
          console.error(`[AUTH] Refreshed tokens for ${this.tool}`);
        }
      } catch (error) {
        console.error(`[AUTH] Auto-refresh failed for ${this.tool}:`, error);
      }
    }, checkIntervalMs);
  }

  /**
   * Stop automatic refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshHandle) {
      clearInterval(this.refreshHandle);
      this.refreshHandle = undefined;
    }
  }
}
