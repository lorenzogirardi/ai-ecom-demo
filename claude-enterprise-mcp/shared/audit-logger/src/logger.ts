import type { AuditLog, AuditLoggerConfig } from './types';
import { LocalBuffer } from './buffer';
import { LogShipper } from './shipper';

/**
 * Central audit logger for Claude Code Enterprise
 *
 * Features:
 * - Local file buffer for durability
 * - Async shipping to central logging
 * - Tool wrapper for easy integration
 * - Sanitization of sensitive data
 */
export class AuditLogger {
  private config: AuditLoggerConfig;
  private buffer: LocalBuffer;
  private shipper?: LogShipper;

  constructor(config: AuditLoggerConfig) {
    this.config = config;
    this.buffer = new LocalBuffer(
      config.localBufferDir || './audit-logs',
      config.batchSize || 100
    );

    if (config.centralEndpoint) {
      this.shipper = new LogShipper(
        {
          endpoint: config.centralEndpoint,
          apiKey: config.centralApiKey,
          batchSize: config.batchSize || 100,
          flushIntervalMs: config.flushIntervalMs || 60000,
          retryAttempts: 3,
          retryDelayMs: 1000,
        },
        this.buffer
      );
    }
  }

  /**
   * Initialize the logger
   */
  async init(): Promise<void> {
    await this.buffer.init();
    this.shipper?.start();
  }

  /**
   * Shutdown the logger
   */
  async shutdown(): Promise<void> {
    this.shipper?.stop();
    await this.shipper?.shipAll();
  }

  /**
   * Log an audit entry
   */
  async log(entry: Omit<AuditLog, 'timestamp' | 'tool' | 'ai_context'>): Promise<void> {
    const log: AuditLog = {
      ...entry,
      timestamp: new Date().toISOString(),
      tool: this.config.tool,
      parameters: this.sanitizeParameters(entry.parameters),
      ai_context: {
        session_id: this.config.sessionId,
        model: this.config.model,
      },
    };

    // Always log locally first
    await this.buffer.add(log);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AUDIT]', JSON.stringify(log, null, 2));
    }
  }

  /**
   * Wrap a tool handler with audit logging
   */
  wrap<TArgs, TResult>(
    action: string,
    handler: (args: TArgs) => Promise<TResult>
  ): (args: TArgs, user: string) => Promise<TResult> {
    return async (args: TArgs, user: string) => {
      try {
        const result = await handler(args);
        await this.log({
          user,
          action,
          parameters: args as Record<string, unknown>,
          result: 'success',
        });
        return result;
      } catch (error) {
        await this.log({
          user,
          action,
          parameters: args as Record<string, unknown>,
          result: 'error',
          error_message: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    };
  }

  /**
   * Get buffer statistics
   */
  async getStats(): Promise<Record<string, number>> {
    return this.buffer.getStats();
  }

  /**
   * Sanitize parameters to remove sensitive data
   */
  private sanitizeParameters(params: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apikey',
      'api_key',
      'authorization',
      'credential',
    ];

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeParameters(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

/**
 * Create a configured audit logger
 */
export function createAuditLogger(config: AuditLoggerConfig): AuditLogger {
  return new AuditLogger(config);
}
