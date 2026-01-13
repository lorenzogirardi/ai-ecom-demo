import {
  CloudWatchClient,
  GetMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import { z } from 'zod';
import type { AWSConfig, MetricResult } from '../../types';

/**
 * Schema for get metrics arguments
 */
export const getMetricsSchema = z.object({
  namespace: z.string().describe('CloudWatch namespace (e.g., AWS/EC2, AWS/RDS)'),
  metricName: z.string().describe('Metric name (e.g., CPUUtilization)'),
  dimensions: z
    .record(z.string())
    .optional()
    .describe('Dimensions (e.g., {"InstanceId": "i-xxx"})'),
  startTime: z.string().describe('Start time (ISO 8601)'),
  endTime: z.string().describe('End time (ISO 8601)'),
  period: z.number().min(60).default(300).describe('Period in seconds (min 60)'),
  statistic: z
    .enum(['Average', 'Sum', 'Minimum', 'Maximum', 'SampleCount'])
    .default('Average')
    .describe('Statistic type'),
});

export type GetMetricsArgs = z.infer<typeof getMetricsSchema>;

/**
 * Get CloudWatch metrics (READ-ONLY)
 */
export async function getMetrics(
  config: AWSConfig,
  args: GetMetricsArgs
): Promise<MetricResult> {
  const { namespace, metricName, dimensions, startTime, endTime, period, statistic } =
    getMetricsSchema.parse(args);

  const client = new CloudWatchClient({ region: config.region });

  const metricDimensions = dimensions
    ? Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value }))
    : undefined;

  const command = new GetMetricDataCommand({
    StartTime: new Date(startTime),
    EndTime: new Date(endTime),
    MetricDataQueries: [
      {
        Id: 'm1',
        MetricStat: {
          Metric: {
            Namespace: namespace,
            MetricName: metricName,
            Dimensions: metricDimensions,
          },
          Period: period,
          Stat: statistic,
        },
        ReturnData: true,
      },
    ],
  });

  const response = await client.send(command);

  const timestamps = response.MetricDataResults?.[0]?.Timestamps || [];
  const values = response.MetricDataResults?.[0]?.Values || [];

  const datapoints = timestamps.map((ts, i) => ({
    timestamp: ts,
    value: values[i] || 0,
    unit: 'Count',
  }));

  return {
    namespace,
    metricName,
    dimensions: dimensions || {},
    datapoints,
  };
}

/**
 * Tool definition for MCP
 */
export const getMetricsTool = {
  name: 'aws_cloudwatch_get_metrics',
  description: 'Get CloudWatch metrics (READ-ONLY)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      namespace: {
        type: 'string',
        description: 'CloudWatch namespace (e.g., AWS/EC2, AWS/RDS, AWS/EKS)',
      },
      metricName: {
        type: 'string',
        description: 'Metric name (e.g., CPUUtilization, DatabaseConnections)',
      },
      dimensions: {
        type: 'object',
        description: 'Dimensions (e.g., {"InstanceId": "i-xxx"})',
        additionalProperties: { type: 'string' },
      },
      startTime: { type: 'string', description: 'Start time (ISO 8601)' },
      endTime: { type: 'string', description: 'End time (ISO 8601)' },
      period: { type: 'number', description: 'Period in seconds (default: 300)' },
      statistic: {
        type: 'string',
        enum: ['Average', 'Sum', 'Minimum', 'Maximum', 'SampleCount'],
        description: 'Statistic type (default: Average)',
      },
    },
    required: ['namespace', 'metricName', 'startTime', 'endTime'],
  },
};
