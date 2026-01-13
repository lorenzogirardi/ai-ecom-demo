import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { z } from 'zod';
import type { AWSConfig, LogEvent } from '../../types';

/**
 * Schema for get logs arguments
 */
export const getLogsSchema = z.object({
  logGroupName: z.string().describe('Log group name'),
  logStreamNames: z.array(z.string()).optional().describe('Specific log streams'),
  filterPattern: z.string().optional().describe('CloudWatch Logs filter pattern'),
  startTime: z.string().describe('Start time (ISO 8601)'),
  endTime: z.string().describe('End time (ISO 8601)'),
  limit: z.number().min(1).max(10000).default(100).describe('Maximum events'),
});

export type GetLogsArgs = z.infer<typeof getLogsSchema>;

/**
 * Get CloudWatch logs (READ-ONLY)
 */
export async function getLogs(
  config: AWSConfig,
  args: GetLogsArgs
): Promise<{ events: LogEvent[]; nextToken?: string }> {
  const { logGroupName, logStreamNames, filterPattern, startTime, endTime, limit } =
    getLogsSchema.parse(args);

  const client = new CloudWatchLogsClient({ region: config.region });

  const command = new FilterLogEventsCommand({
    logGroupName,
    logStreamNames,
    filterPattern,
    startTime: new Date(startTime).getTime(),
    endTime: new Date(endTime).getTime(),
    limit,
  });

  const response = await client.send(command);

  const events: LogEvent[] = (response.events || []).map((event) => ({
    timestamp: event.timestamp || 0,
    message: event.message || '',
    logStreamName: event.logStreamName,
  }));

  return {
    events,
    nextToken: response.nextToken,
  };
}

/**
 * Tool definition for MCP
 */
export const getLogsTool = {
  name: 'aws_cloudwatch_get_logs',
  description: 'Query CloudWatch logs (READ-ONLY)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      logGroupName: { type: 'string', description: 'Log group name' },
      logStreamNames: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific log streams (optional)',
      },
      filterPattern: {
        type: 'string',
        description: 'CloudWatch Logs filter pattern (optional)',
      },
      startTime: { type: 'string', description: 'Start time (ISO 8601)' },
      endTime: { type: 'string', description: 'End time (ISO 8601)' },
      limit: { type: 'number', description: 'Max events (default: 100, max: 10000)' },
    },
    required: ['logGroupName', 'startTime', 'endTime'],
  },
};
