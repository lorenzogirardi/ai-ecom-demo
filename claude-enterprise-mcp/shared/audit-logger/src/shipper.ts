import axios from 'axios';
import type { AuditLog, ShipperConfig } from './types';
import type { LocalBuffer } from './buffer';

/**
 * Ships audit logs to central logging system
 *
 * Supports:
 * - CloudWatch Logs
 * - Splunk HEC
 * - ELK Stack
 * - Generic HTTP endpoint
 */
export class LogShipper {
  private config: ShipperConfig;
  private buffer: LocalBuffer;
  private intervalHandle?: NodeJS.Timer;
  private isShipping = false;

  constructor(config: ShipperConfig, buffer: LocalBuffer) {
    this.config = config;
    this.buffer = buffer;
  }

  /**
   * Start automatic shipping
   */
  start(): void {
    if (this.intervalHandle) {
      return;
    }

    this.intervalHandle = setInterval(() => {
      this.shipAll().catch(console.error);
    }, this.config.flushIntervalMs);
  }

  /**
   * Stop automatic shipping
   */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }
  }

  /**
   * Ship all buffered logs
   */
  async shipAll(): Promise<void> {
    if (this.isShipping) {
      return;
    }

    this.isShipping = true;

    try {
      const stats = await this.buffer.getStats();

      for (const [filename, count] of Object.entries(stats)) {
        if (count === 0) continue;

        const tool = filename.split('-')[0];
        const logs = await this.buffer.getBufferedLogs(tool);

        if (logs.length === 0) continue;

        // Ship in batches
        for (let i = 0; i < logs.length; i += this.config.batchSize) {
          const batch = logs.slice(i, i + this.config.batchSize);
          await this.shipBatch(batch);
          await this.buffer.clearShippedLogs(tool, batch.length);
        }
      }
    } finally {
      this.isShipping = false;
    }
  }

  /**
   * Ship a batch of logs
   */
  private async shipBatch(logs: AuditLog[]): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        await this.sendToEndpoint(logs);
        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.retryAttempts - 1) {
          await this.delay(this.config.retryDelayMs * (attempt + 1));
        }
      }
    }

    console.error('[SHIPPER] Failed to ship logs after retries:', lastError?.message);
  }

  /**
   * Send logs to the configured endpoint
   */
  private async sendToEndpoint(logs: AuditLog[]): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    // Detect endpoint type and format accordingly
    if (this.config.endpoint.includes('splunk')) {
      // Splunk HEC format
      const events = logs.map((log) => ({
        event: log,
        time: new Date(log.timestamp).getTime() / 1000,
        sourcetype: 'claude-code-audit',
      }));

      await axios.post(this.config.endpoint, events, { headers });
    } else {
      // Generic format (works with most HTTP endpoints)
      await axios.post(this.config.endpoint, { logs }, { headers });
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
