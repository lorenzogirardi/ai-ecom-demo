/**
 * Authentication Module for Claude Code Enterprise
 *
 * Provides:
 * - OAuth 2.0 flow for enterprise SSO
 * - Token storage in OS keychain
 * - Automatic token refresh
 */

export { OAuthClient, type OAuthConfig, type OAuthTokens } from './oauth';
export { TokenStore } from './token-store';
export { TokenRefresher } from './refresh';
