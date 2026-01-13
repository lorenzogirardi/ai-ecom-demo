import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getMetrics, getMetricsTool } from './tools/cloudwatch-metrics.js';
import { getLogs, getLogsTool } from './tools/cloudwatch-logs.js';
import {
  describeInstances,
  describeInstancesTool,
  describeRDS,
  describeRDSTool,
  describeEKS,
  describeEKSTool,
} from './tools/describe.js';
import { createAuditLogger } from './audit/logger.js';
import type { AWSConfig } from '../types';

/**
 * AWS MCP Server for Claude Code Enterprise
 *
 * ⚠️ READ-ONLY ACCESS ONLY
 *
 * This server provides read-only access to AWS resources.
 * NO write operations are exposed.
 *
 * For infrastructure changes, use GitHub MCP to create PRs
 * to the Terraform repository.
 *
 * Environment variables:
 * - AWS_REGION: AWS region (default: us-east-1)
 * - AWS_ACCESS_KEY_ID: AWS access key (or use IAM role)
 * - AWS_SECRET_ACCESS_KEY: AWS secret key (or use IAM role)
 * - AUDIT_LOG_DIR: Directory for local audit logs
 */

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_USER = process.env.AWS_USER || process.env.USER || 'anonymous';

const awsConfig: AWSConfig = {
  region: AWS_REGION,
};

const auditLogger = createAuditLogger({
  sessionId: process.env.SESSION_ID || 'unknown',
  model: process.env.MODEL || 'claude-opus-4-5',
});

function getCurrentUser(): string {
  return AWS_USER;
}

const server = new Server(
  {
    name: 'aws-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      getMetricsTool,
      getLogsTool,
      describeInstancesTool,
      describeRDSTool,
      describeEKSTool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const user = getCurrentUser();

  try {
    let result: unknown;

    switch (name) {
      case 'aws_cloudwatch_get_metrics':
        result = await auditLogger.wrapTool('cloudwatch_get_metrics', async (a) =>
          getMetrics(awsConfig, a)
        )(args, user);
        break;

      case 'aws_cloudwatch_get_logs':
        result = await auditLogger.wrapTool('cloudwatch_get_logs', async (a) =>
          getLogs(awsConfig, a)
        )(args, user);
        break;

      case 'aws_describe_instances':
        result = await auditLogger.wrapTool('describe_instances', async (a) =>
          describeInstances(awsConfig, a)
        )(args, user);
        break;

      case 'aws_describe_rds':
        result = await auditLogger.wrapTool('describe_rds', async (a) =>
          describeRDS(awsConfig, a)
        )(args, user);
        break;

      case 'aws_describe_eks':
        result = await auditLogger.wrapTool('describe_eks', async (a) =>
          describeEKS(awsConfig, a)
        )(args, user);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AWS MCP Server started (READ-ONLY)');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
