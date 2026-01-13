import axios from 'axios';
import { z } from 'zod';
import type { ConfluenceConfig, ConfluenceSearchResult } from '../../types';

/**
 * Schema for search arguments
 */
export const searchSchema = z.object({
  cql: z.string().describe('Confluence Query Language (CQL) query'),
  start: z.number().min(0).default(0).describe('Starting index'),
  limit: z.number().min(1).max(100).default(25).describe('Maximum results'),
});

export type SearchArgs = z.infer<typeof searchSchema>;

/**
 * Search Confluence using CQL
 */
export async function search(
  config: ConfluenceConfig,
  args: SearchArgs
): Promise<ConfluenceSearchResult> {
  const { cql, start, limit } = searchSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.get(`${config.baseUrl}/wiki/rest/api/search`, {
    params: {
      cql,
      start,
      limit,
    },
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

/**
 * Tool definition for MCP
 */
export const searchTool = {
  name: 'confluence_search',
  description: 'Search Confluence using CQL (Confluence Query Language)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      cql: {
        type: 'string',
        description: 'CQL query (e.g., "space = DEV AND type = page AND text ~ \'kubernetes\'")',
      },
      start: {
        type: 'number',
        description: 'Starting index (default: 0)',
        default: 0,
      },
      limit: {
        type: 'number',
        description: 'Maximum results (default: 25, max: 100)',
        default: 25,
      },
    },
    required: ['cql'],
  },
};
