import axios from 'axios';
import { z } from 'zod';
import type { JiraConfig, JiraComment } from '../../types';

/**
 * Schema for get comments arguments
 */
export const getCommentsSchema = z.object({
  issueKey: z.string().describe('Issue key'),
  startAt: z.number().min(0).default(0).describe('Starting index'),
  maxResults: z.number().min(1).max(100).default(50).describe('Maximum results'),
});

export type GetCommentsArgs = z.infer<typeof getCommentsSchema>;

/**
 * Schema for add comment arguments
 */
export const addCommentSchema = z.object({
  issueKey: z.string().describe('Issue key'),
  body: z.string().describe('Comment body'),
});

export type AddCommentArgs = z.infer<typeof addCommentSchema>;

/**
 * Get comments on a Jira issue
 */
export async function getComments(
  config: JiraConfig,
  args: GetCommentsArgs
): Promise<{ comments: JiraComment[]; total: number }> {
  const { issueKey, startAt, maxResults } = getCommentsSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.get(
    `${config.baseUrl}/rest/api/3/issue/${issueKey}/comment`,
    {
      params: { startAt, maxResults },
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Convert ADF body to plain text for simplicity
  const comments = response.data.comments.map((c: Record<string, unknown>) => ({
    id: c.id,
    author: c.author,
    body: extractTextFromADF(c.body),
    created: c.created,
    updated: c.updated,
  }));

  return {
    comments,
    total: response.data.total,
  };
}

/**
 * Add a comment to a Jira issue
 */
export async function addComment(
  config: JiraConfig,
  args: AddCommentArgs
): Promise<JiraComment> {
  const { issueKey, body } = addCommentSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.post(
    `${config.baseUrl}/rest/api/3/issue/${issueKey}/comment`,
    {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: body }],
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    id: response.data.id,
    author: response.data.author,
    body,
    created: response.data.created,
    updated: response.data.updated,
  };
}

/**
 * Extract text from ADF (Atlassian Document Format)
 */
function extractTextFromADF(adf: unknown): string {
  if (!adf || typeof adf !== 'object') return '';

  const doc = adf as { content?: unknown[] };
  if (!doc.content) return '';

  const extractText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return '';
    const n = node as { type?: string; text?: string; content?: unknown[] };

    if (n.type === 'text' && n.text) {
      return n.text;
    }

    if (n.content) {
      return n.content.map(extractText).join('');
    }

    return '';
  };

  return doc.content.map(extractText).join('\n');
}

/**
 * Tool definitions for MCP
 */
export const getCommentsTool = {
  name: 'jira_get_comments',
  description: 'Get comments on a Jira issue',
  inputSchema: {
    type: 'object' as const,
    properties: {
      issueKey: { type: 'string', description: 'Issue key' },
      startAt: { type: 'number', description: 'Starting index (default: 0)' },
      maxResults: { type: 'number', description: 'Max results (default: 50)' },
    },
    required: ['issueKey'],
  },
};

export const addCommentTool = {
  name: 'jira_add_comment',
  description: 'Add a comment to a Jira issue',
  inputSchema: {
    type: 'object' as const,
    properties: {
      issueKey: { type: 'string', description: 'Issue key' },
      body: { type: 'string', description: 'Comment body' },
    },
    required: ['issueKey', 'body'],
  },
};
