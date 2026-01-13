import axios from 'axios';
import { z } from 'zod';
import type { ConfluenceConfig, ConfluenceComment } from '../../types';

/**
 * Schema for get comments arguments
 */
export const getCommentsSchema = z.object({
  pageId: z.string().describe('Page ID'),
  start: z.number().min(0).default(0).describe('Starting index'),
  limit: z.number().min(1).max(100).default(25).describe('Maximum results'),
});

export type GetCommentsArgs = z.infer<typeof getCommentsSchema>;

/**
 * Schema for add comment arguments
 */
export const addCommentSchema = z.object({
  pageId: z.string().describe('Page ID'),
  body: z.string().describe('Comment body'),
});

export type AddCommentArgs = z.infer<typeof addCommentSchema>;

/**
 * Get comments on a Confluence page
 */
export async function getComments(
  config: ConfluenceConfig,
  args: GetCommentsArgs
): Promise<{ comments: ConfluenceComment[]; total: number }> {
  const { pageId, start, limit } = getCommentsSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.get(
    `${config.baseUrl}/wiki/api/v2/pages/${pageId}/footer-comments`,
    {
      params: {
        start,
        limit,
        'body-format': 'storage',
      },
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    comments: response.data.results,
    total: response.data.size,
  };
}

/**
 * Add a comment to a Confluence page
 */
export async function addComment(
  config: ConfluenceConfig,
  args: AddCommentArgs
): Promise<ConfluenceComment> {
  const { pageId, body } = addCommentSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.post(
    `${config.baseUrl}/wiki/api/v2/pages/${pageId}/footer-comments`,
    {
      body: {
        representation: 'storage',
        value: `<p>${body}</p>`,
      },
    },
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
 * Tool definitions for MCP
 */
export const getCommentsTool = {
  name: 'confluence_get_comments',
  description: 'Get comments on a Confluence page',
  inputSchema: {
    type: 'object' as const,
    properties: {
      pageId: { type: 'string', description: 'Page ID' },
      start: { type: 'number', description: 'Starting index (default: 0)' },
      limit: { type: 'number', description: 'Max results (default: 25)' },
    },
    required: ['pageId'],
  },
};

export const addCommentTool = {
  name: 'confluence_add_comment',
  description: 'Add a comment to a Confluence page',
  inputSchema: {
    type: 'object' as const,
    properties: {
      pageId: { type: 'string', description: 'Page ID' },
      body: { type: 'string', description: 'Comment body' },
    },
    required: ['pageId', 'body'],
  },
};
