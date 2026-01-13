import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { search, searchTool } from './tools/search.js';
import {
  getPage,
  getPageTool,
  createPage,
  createPageTool,
  updatePage,
  updatePageTool,
} from './tools/pages.js';
import {
  getSpace,
  getSpaceTool,
  listSpaces,
  listSpacesTool,
} from './tools/spaces.js';
import {
  getComments,
  getCommentsTool,
  addComment,
  addCommentTool,
} from './tools/comments.js';
import { createAuditLogger } from './audit/logger.js';
import type { ConfluenceConfig } from '../types';

/**
 * Confluence MCP Server for Claude Code Enterprise
 *
 * Environment variables:
 * - CONFLUENCE_BASE_URL: Confluence instance URL (e.g., https://company.atlassian.net)
 * - CONFLUENCE_EMAIL: User email for authentication
 * - CONFLUENCE_API_TOKEN: API token for authentication
 * - AUDIT_LOG_DIR: Directory for local audit logs
 */

const CONFLUENCE_BASE_URL = process.env.CONFLUENCE_BASE_URL;
const CONFLUENCE_EMAIL = process.env.CONFLUENCE_EMAIL;
const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN;

if (!CONFLUENCE_BASE_URL || !CONFLUENCE_EMAIL || !CONFLUENCE_API_TOKEN) {
  console.error(
    'Error: CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, and CONFLUENCE_API_TOKEN are required'
  );
  process.exit(1);
}

const confluenceConfig: ConfluenceConfig = {
  baseUrl: CONFLUENCE_BASE_URL,
  email: CONFLUENCE_EMAIL,
  apiToken: CONFLUENCE_API_TOKEN,
};

const auditLogger = createAuditLogger({
  sessionId: process.env.SESSION_ID || 'unknown',
  model: process.env.MODEL || 'claude-opus-4-5',
});

function getCurrentUser(): string {
  return CONFLUENCE_EMAIL || 'anonymous';
}

const server = new Server(
  {
    name: 'confluence-mcp',
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
      searchTool,
      getPageTool,
      createPageTool,
      updatePageTool,
      getSpaceTool,
      listSpacesTool,
      getCommentsTool,
      addCommentTool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const user = getCurrentUser();

  try {
    let result: unknown;

    switch (name) {
      case 'confluence_search':
        result = await auditLogger.wrapTool('search', async (a) =>
          search(confluenceConfig, a)
        )(args, user);
        break;

      case 'confluence_get_page':
        result = await auditLogger.wrapTool('get_page', async (a) =>
          getPage(confluenceConfig, a)
        )(args, user);
        break;

      case 'confluence_create_page':
        result = await auditLogger.wrapTool('create_page', async (a) =>
          createPage(confluenceConfig, a)
        )(args, user);
        break;

      case 'confluence_update_page':
        result = await auditLogger.wrapTool('update_page', async (a) =>
          updatePage(confluenceConfig, a)
        )(args, user);
        break;

      case 'confluence_get_space':
        result = await auditLogger.wrapTool('get_space', async (a) =>
          getSpace(confluenceConfig, a)
        )(args, user);
        break;

      case 'confluence_list_spaces':
        result = await auditLogger.wrapTool('list_spaces', async (a) =>
          listSpaces(confluenceConfig, a)
        )(args, user);
        break;

      case 'confluence_get_comments':
        result = await auditLogger.wrapTool('get_comments', async (a) =>
          getComments(confluenceConfig, a)
        )(args, user);
        break;

      case 'confluence_add_comment':
        result = await auditLogger.wrapTool('add_comment', async (a) =>
          addComment(confluenceConfig, a)
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
  console.error('Confluence MCP Server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
