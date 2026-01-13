import * as fs from 'fs/promises';
import * as path from 'path';
import type { AuditLog } from './types';

/**
 * Local file buffer for audit logs
 *
 * Writes logs to JSONL files locally before shipping to central.
 * Provides durability in case of network issues.
 */
export class LocalBuffer {
  private bufferDir: string;
  private buffer: AuditLog[] = [];
  private maxBufferSize: number;

  constructor(bufferDir: string, maxBufferSize = 100) {
    this.bufferDir = bufferDir;
    this.maxBufferSize = maxBufferSize;
  }

  /**
   * Initialize buffer directory
   */
  async init(): Promise<void> {
    await fs.mkdir(this.bufferDir, { recursive: true });
  }

  /**
   * Add a log entry to the buffer
   */
  async add(log: AuditLog): Promise<void> {
    this.buffer.push(log);

    // Write to file immediately for durability
    const filename = this.getFilename(log.tool);
    const filepath = path.join(this.bufferDir, filename);
    await fs.appendFile(filepath, JSON.stringify(log) + '\n');

    // Flush in-memory buffer if too large
    if (this.buffer.length >= this.maxBufferSize) {
      this.buffer = [];
    }
  }

  /**
   * Get all buffered logs for a tool (for shipping)
   */
  async getBufferedLogs(tool: string): Promise<AuditLog[]> {
    const filename = this.getFilename(tool);
    const filepath = path.join(this.bufferDir, filename);

    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      return lines.map((line) => JSON.parse(line) as AuditLog);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Clear shipped logs
   */
  async clearShippedLogs(tool: string, count: number): Promise<void> {
    const filename = this.getFilename(tool);
    const filepath = path.join(this.bufferDir, filename);

    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      const remaining = lines.slice(count);

      if (remaining.length === 0) {
        await fs.unlink(filepath);
      } else {
        await fs.writeFile(filepath, remaining.join('\n') + '\n');
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Get buffer statistics
   */
  async getStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};

    try {
      const files = await fs.readdir(this.bufferDir);
      for (const file of files) {
        if (file.endsWith('.jsonl')) {
          const filepath = path.join(this.bufferDir, file);
          const content = await fs.readFile(filepath, 'utf-8');
          const count = content.trim().split('\n').filter(Boolean).length;
          stats[file] = count;
        }
      }
    } catch (error) {
      // Directory might not exist yet
    }

    return stats;
  }

  /**
   * Generate filename for a tool's logs
   */
  private getFilename(tool: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `${tool}-${date}.jsonl`;
  }
}
