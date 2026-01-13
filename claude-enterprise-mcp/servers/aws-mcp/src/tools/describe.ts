import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { EKSClient, DescribeClustersCommand, ListClustersCommand } from '@aws-sdk/client-eks';
import { z } from 'zod';
import type { AWSConfig, EC2Instance, RDSInstance, EKSCluster } from '../../types';

/**
 * Schema for describe instances arguments
 */
export const describeInstancesSchema = z.object({
  instanceIds: z.array(z.string()).optional().describe('Specific instance IDs'),
  filters: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.string()),
      })
    )
    .optional()
    .describe('Filters (e.g., tag:Name)'),
});

export type DescribeInstancesArgs = z.infer<typeof describeInstancesSchema>;

/**
 * Schema for describe RDS arguments
 */
export const describeRDSSchema = z.object({
  dbInstanceIdentifier: z.string().optional().describe('Specific DB instance ID'),
});

export type DescribeRDSArgs = z.infer<typeof describeRDSSchema>;

/**
 * Schema for describe EKS arguments
 */
export const describeEKSSchema = z.object({
  clusterName: z.string().optional().describe('Specific cluster name'),
});

export type DescribeEKSArgs = z.infer<typeof describeEKSSchema>;

/**
 * Describe EC2 instances (READ-ONLY)
 */
export async function describeInstances(
  config: AWSConfig,
  args: DescribeInstancesArgs
): Promise<EC2Instance[]> {
  const { instanceIds, filters } = describeInstancesSchema.parse(args);

  const client = new EC2Client({ region: config.region });

  const command = new DescribeInstancesCommand({
    InstanceIds: instanceIds,
    Filters: filters?.map((f) => ({ Name: f.name, Values: f.values })),
  });

  const response = await client.send(command);

  const instances: EC2Instance[] = [];
  for (const reservation of response.Reservations || []) {
    for (const instance of reservation.Instances || []) {
      const tags: Record<string, string> = {};
      for (const tag of instance.Tags || []) {
        if (tag.Key && tag.Value) {
          tags[tag.Key] = tag.Value;
        }
      }

      instances.push({
        instanceId: instance.InstanceId || '',
        instanceType: instance.InstanceType || '',
        state: instance.State?.Name || '',
        privateIpAddress: instance.PrivateIpAddress,
        publicIpAddress: instance.PublicIpAddress,
        tags,
        launchTime: instance.LaunchTime,
      });
    }
  }

  return instances;
}

/**
 * Describe RDS instances (READ-ONLY)
 */
export async function describeRDS(
  config: AWSConfig,
  args: DescribeRDSArgs
): Promise<RDSInstance[]> {
  const { dbInstanceIdentifier } = describeRDSSchema.parse(args);

  const client = new RDSClient({ region: config.region });

  const command = new DescribeDBInstancesCommand({
    DBInstanceIdentifier: dbInstanceIdentifier,
  });

  const response = await client.send(command);

  return (response.DBInstances || []).map((db) => ({
    dbInstanceIdentifier: db.DBInstanceIdentifier || '',
    dbInstanceClass: db.DBInstanceClass || '',
    engine: db.Engine || '',
    engineVersion: db.EngineVersion || '',
    status: db.DBInstanceStatus || '',
    endpoint: db.Endpoint
      ? {
          address: db.Endpoint.Address || '',
          port: db.Endpoint.Port || 0,
        }
      : undefined,
    allocatedStorage: db.AllocatedStorage || 0,
  }));
}

/**
 * Describe EKS clusters (READ-ONLY)
 */
export async function describeEKS(
  config: AWSConfig,
  args: DescribeEKSArgs
): Promise<EKSCluster[]> {
  const { clusterName } = describeEKSSchema.parse(args);

  const client = new EKSClient({ region: config.region });

  // If no cluster name specified, list all clusters first
  let clusterNames: string[] = [];
  if (clusterName) {
    clusterNames = [clusterName];
  } else {
    const listCommand = new ListClustersCommand({});
    const listResponse = await client.send(listCommand);
    clusterNames = listResponse.clusters || [];
  }

  if (clusterNames.length === 0) {
    return [];
  }

  const command = new DescribeClustersCommand({
    name: clusterNames,
  });

  const response = await client.send(command);

  return (response.clusters || []).map((cluster) => ({
    name: cluster.name || '',
    arn: cluster.arn || '',
    status: cluster.status || '',
    version: cluster.version || '',
    endpoint: cluster.endpoint,
    createdAt: cluster.createdAt,
  }));
}

/**
 * Tool definitions for MCP
 */
export const describeInstancesTool = {
  name: 'aws_describe_instances',
  description: 'Describe EC2 instances (READ-ONLY)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      instanceIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific instance IDs (optional)',
      },
      filters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            values: { type: 'array', items: { type: 'string' } },
          },
          required: ['name', 'values'],
        },
        description: 'Filters (e.g., tag:Name)',
      },
    },
    required: [],
  },
};

export const describeRDSTool = {
  name: 'aws_describe_rds',
  description: 'Describe RDS instances (READ-ONLY)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      dbInstanceIdentifier: {
        type: 'string',
        description: 'Specific DB instance ID (optional)',
      },
    },
    required: [],
  },
};

export const describeEKSTool = {
  name: 'aws_describe_eks',
  description: 'Describe EKS clusters (READ-ONLY)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      clusterName: {
        type: 'string',
        description: 'Specific cluster name (optional)',
      },
    },
    required: [],
  },
};
