/**
 * Standard audit log entry structure
 */
export interface AuditLog {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** User email or identifier */
  user: string;
  /** Tool/MCP server name */
  tool: 'github' | 'jira' | 'confluence' | 'aws';
  /** Action performed */
  action: string;
  /** Action parameters (sanitized) */
  parameters: Record<string, unknown>;
  /** Outcome */
  result: 'success' | 'error';
  /** Error message if result is error */
  error_message?: string;
  /** Additional tool-specific data */
  metadata?: Record<string, unknown>;
  /** AI context information */
  ai_context: {
    /** Claude Code session ID */
    session_id: string;
    /** Model used */
    model: string;
    /** Prompt hash for correlation */
    prompt_hash?: string;
  };
}

/**
 * Audit logger configuration
 */
export interface AuditLoggerConfig {
  /** Tool name */
  tool: 'github' | 'jira' | 'confluence' | 'aws';
  /** Session ID */
  sessionId: string;
  /** Model name */
  model: string;
  /** Local buffer directory */
  localBufferDir?: string;
  /** Central logging endpoint (optional) */
  centralEndpoint?: string;
  /** API key for central logging */
  centralApiKey?: string;
  /** Batch size for shipping */
  batchSize?: number;
  /** Flush interval in ms */
  flushIntervalMs?: number;
}

/**
 * Shipper configuration for central logging
 */
export interface ShipperConfig {
  endpoint: string;
  apiKey?: string;
  batchSize: number;
  flushIntervalMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}
