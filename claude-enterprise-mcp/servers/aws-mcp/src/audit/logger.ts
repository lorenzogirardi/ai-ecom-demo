import type { AuditLog, AuditLoggerConfig } from '../../types';

/**
 * Audit logger wrapper for AWS MCP tools
 */
export class AWSAuditLogger {
  private config: AuditLoggerConfig;

  constructor(config: AuditLoggerConfig) {
    this.config = config;
  }

  async log(entry: Omit<AuditLog, 'timestamp' | 'tool'>): Promise<void> {
    const log: AuditLog = {
      ...entry,
      timestamp: new Date().toISOString(),
      tool: 'aws',
    };

    if (process.env.NODE_ENV === 'development') {
      console.warn('[AUDIT]', JSON.stringify(log, null, 2));
    }

    try {
      const fs = await import('fs/promises');
      const logDir = process.env.AUDIT_LOG_DIR || './audit-logs';
      await fs.mkdir(logDir, { recursive: true });
      const logFile = `${logDir}/aws-${new Date().toISOString().split('T')[0]}.jsonl`;
      await fs.appendFile(logFile, JSON.stringify(log) + '\n');
    } catch (error) {
      console.error('[AUDIT] Failed to write audit log:', error);
    }
  }

  wrapTool<TArgs, TResult>(
    action: string,
    handler: (args: TArgs, user: string) => Promise<TResult>
  ): (args: TArgs, user: string) => Promise<TResult> {
    return async (args: TArgs, user: string) => {
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

export function createAuditLogger(config: AuditLoggerConfig): AWSAuditLogger {
  return new AWSAuditLogger(config);
}
