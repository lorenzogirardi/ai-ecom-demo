import axios from 'axios';
import { z } from 'zod';
import type { ConfluenceConfig, ConfluencePage } from '../../types';

/**
 * Schema for get page arguments
 */
export const getPageSchema = z.object({
  pageId: z.string().describe('Page ID'),
  bodyFormat: z
    .enum(['storage', 'atlas_doc_format', 'view'])
    .default('storage')
    .describe('Body format'),
});

export type GetPageArgs = z.infer<typeof getPageSchema>;

/**
 * Schema for create page arguments
 */
export const createPageSchema = z.object({
  spaceId: z.string().describe('Space ID'),
  title: z.string().describe('Page title'),
  body: z.string().describe('Page body content (storage format)'),
  parentId: z.string().optional().describe('Parent page ID'),
});

export type CreatePageArgs = z.infer<typeof createPageSchema>;

/**
 * Schema for update page arguments
 */
export const updatePageSchema = z.object({
  pageId: z.string().describe('Page ID'),
  title: z.string().optional().describe('New title'),
  body: z.string().optional().describe('New body content'),
  versionMessage: z.string().optional().describe('Version comment'),
});

export type UpdatePageArgs = z.infer<typeof updatePageSchema>;

/**
 * Get a Confluence page by ID
 */
export async function getPage(
  config: ConfluenceConfig,
  args: GetPageArgs
): Promise<ConfluencePage> {
  const { pageId, bodyFormat } = getPageSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.get(
    `${config.baseUrl}/wiki/api/v2/pages/${pageId}`,
    {
      params: {
        'body-format': bodyFormat,
      },
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

/**
 * Create a new Confluence page
 */
export async function createPage(
  config: ConfluenceConfig,
  args: CreatePageArgs
): Promise<ConfluencePage> {
  const { spaceId, title, body, parentId } = createPageSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const payload: Record<string, unknown> = {
    spaceId,
    status: 'current',
    title,
    body: {
      representation: 'storage',
      value: body,
    },
  };

  if (parentId) {
    payload.parentId = parentId;
  }

  const response = await axios.post(
    `${config.baseUrl}/wiki/api/v2/pages`,
    payload,
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
 * Update an existing Confluence page
 */
export async function updatePage(
  config: ConfluenceConfig,
  args: UpdatePageArgs
): Promise<ConfluencePage> {
  const { pageId, title, body, versionMessage } = updatePageSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  // First, get current page to get version number
  const currentPage = await getPage(config, { pageId, bodyFormat: 'storage' });

  const payload: Record<string, unknown> = {
    id: pageId,
    status: 'current',
    title: title || currentPage.title,
    version: {
      number: currentPage.version.number + 1,
      message: versionMessage,
    },
  };

  if (body) {
    payload.body = {
      representation: 'storage',
      value: body,
    };
  }

  const response = await axios.put(
    `${config.baseUrl}/wiki/api/v2/pages/${pageId}`,
    payload,
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
export const getPageTool = {
  name: 'confluence_get_page',
  description: 'Get a Confluence page by ID',
  inputSchema: {
    type: 'object' as const,
    properties: {
      pageId: { type: 'string', description: 'Page ID' },
      bodyFormat: {
        type: 'string',
        enum: ['storage', 'atlas_doc_format', 'view'],
        description: 'Body format (default: storage)',
      },
    },
    required: ['pageId'],
  },
};

export const createPageTool = {
  name: 'confluence_create_page',
  description: 'Create a new Confluence page',
  inputSchema: {
    type: 'object' as const,
    properties: {
      spaceId: { type: 'string', description: 'Space ID' },
      title: { type: 'string', description: 'Page title' },
      body: { type: 'string', description: 'Page body (storage format or HTML)' },
      parentId: { type: 'string', description: 'Parent page ID (optional)' },
    },
    required: ['spaceId', 'title', 'body'],
  },
};

export const updatePageTool = {
  name: 'confluence_update_page',
  description: 'Update an existing Confluence page',
  inputSchema: {
    type: 'object' as const,
    properties: {
      pageId: { type: 'string', description: 'Page ID' },
      title: { type: 'string', description: 'New title' },
      body: { type: 'string', description: 'New body content' },
      versionMessage: { type: 'string', description: 'Version comment' },
    },
    required: ['pageId'],
  },
};
