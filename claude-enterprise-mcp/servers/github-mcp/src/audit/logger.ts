import type { AuditLog, AuditLoggerConfig } from '../../types';

/**
 * Audit logger wrapper for GitHub MCP tools
 * Logs all tool invocations to central audit system
 */
export class GitHubAuditLogger {
  private config: AuditLoggerConfig;

  constructor(config: AuditLoggerConfig) {
    this.config = config;
  }

  /**
   * Log a tool invocation
   */
  async log(entry: Omit<AuditLog, 'timestamp' | 'tool'>): Promise<void> {
    const log: AuditLog = {
      ...entry,
      timestamp: new Date().toISOString(),
      tool: 'github',
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AUDIT]', JSON.stringify(log, null, 2));
    }

    // In production, this would ship to central logging
    // For now, write to local buffer file
    try {
      const fs = await import('fs/promises');
      const logDir = process.env.AUDIT_LOG_DIR || './audit-logs';
      await fs.mkdir(logDir, { recursive: true });
      const logFile = `${logDir}/github-${new Date().toISOString().split('T')[0]}.jsonl`;
      await fs.appendFile(logFile, JSON.stringify(log) + '\n');
    } catch (error) {
      console.error('[AUDIT] Failed to write audit log:', error);
    }
  }

  /**
   * Wrap a tool handler with audit logging
   */
  wrapTool<TArgs, TResult>(
    action: string,
    handler: (args: TArgs, user: string) => Promise<TResult>
  ): (args: TArgs, user: string) => Promise<TResult> {
    return async (args: TArgs, user: string) => {
      const startTime = Date.now();
      try {
        const result = await handler(args, user);
        await this.log({
          user,
          action,
          parameters: args as Record<string, unknown>,
          result: 'success',
          ai_context: {
            session_id: this.config.sessionId,
            model: this.config.model,
          },
        });
        return result;
      } catch (error) {
        await this.log({
          user,
          action,
          parameters: args as Record<string, unknown>,
          result: 'error',
          error_message: error instanceof Error ? error.message : String(error),
          ai_context: {
            session_id: this.config.sessionId,
            model: this.config.model,
          },
        });
        throw error;
      }
    };
  }
}

export function createAuditLogger(config: AuditLoggerConfig): GitHubAuditLogger {
  return new GitHubAuditLogger(config);
}
