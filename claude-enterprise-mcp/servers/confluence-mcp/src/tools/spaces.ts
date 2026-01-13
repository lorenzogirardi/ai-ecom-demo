import axios from 'axios';
import { z } from 'zod';
import type { ConfluenceConfig, ConfluenceSpace } from '../../types';

/**
 * Schema for get space arguments
 */
export const getSpaceSchema = z.object({
  spaceId: z.string().describe('Space ID'),
});

export type GetSpaceArgs = z.infer<typeof getSpaceSchema>;

/**
 * Schema for list spaces arguments
 */
export const listSpacesSchema = z.object({
  type: z.enum(['global', 'personal']).optional().describe('Space type filter'),
  status: z.enum(['current', 'archived']).default('current').describe('Space status'),
  start: z.number().min(0).default(0).describe('Starting index'),
  limit: z.number().min(1).max(100).default(25).describe('Maximum results'),
});

export type ListSpacesArgs = z.infer<typeof listSpacesSchema>;

/**
 * Get a Confluence space by ID
 */
export async function getSpace(
  config: ConfluenceConfig,
  args: GetSpaceArgs
): Promise<ConfluenceSpace> {
  const { spaceId } = getSpaceSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.get(
    `${config.baseUrl}/wiki/api/v2/spaces/${spaceId}`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

/**
 * List Confluence spaces
 */
export async function listSpaces(
  config: ConfluenceConfig,
  args: ListSpacesArgs
): Promise<{ spaces: ConfluenceSpace[]; total: number }> {
  const { type, status, start, limit } = listSpacesSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const params: Record<string, string | number> = {
    status,
    start,
    limit,
  };

  if (type) {
    params.type = type;
  }

  const response = await axios.get(`${config.baseUrl}/wiki/api/v2/spaces`, {
    params,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  return {
    spaces: response.data.results,
    total: response.data.size,
  };
}

/**
 * Tool definitions for MCP
 */
export const getSpaceTool = {
  name: 'confluence_get_space',
  description: 'Get a Confluence space by ID',
  inputSchema: {
    type: 'object' as const,
    properties: {
      spaceId: { type: 'string', description: 'Space ID' },
    },
    required: ['spaceId'],
  },
};

export const listSpacesTool = {
  name: 'confluence_list_spaces',
  description: 'List Confluence spaces',
  inputSchema: {
    type: 'object' as const,
    properties: {
      type: {
        type: 'string',
        enum: ['global', 'personal'],
        description: 'Space type filter',
      },
      status: {
        type: 'string',
        enum: ['current', 'archived'],
        description: 'Space status (default: current)',
      },
      start: { type: 'number', description: 'Starting index (default: 0)' },
      limit: { type: 'number', description: 'Max results (default: 25)' },
    },
    required: [],
  },
};
