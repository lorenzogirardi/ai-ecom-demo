import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Octokit } from '@octokit/rest';

import { searchRepositories, searchRepositoriesTool } from './tools/search.js';
import { getFileContents, getFileContentsTool } from './tools/files.js';
import {
  listPullRequests,
  listPullRequestsTool,
  getPullRequest,
  getPullRequestTool,
  createPullRequest,
  createPullRequestTool,
  listCommits,
  listCommitsTool,
} from './tools/pull-requests.js';
import {
  addComment,
  addCommentTool,
  listComments,
  listCommentsTool,
} from './tools/comments.js';
import { createAuditLogger } from './audit/logger.js';

/**
 * GitHub MCP Server for Claude Code Enterprise
 *
 * Provides read and PR-based write access to GitHub repositories
 * with enterprise audit logging.
 *
 * Environment variables:
 * - GITHUB_TOKEN: Personal access token or OAuth token
 * - AUDIT_LOG_DIR: Directory for local audit logs (default: ./audit-logs)
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize Octokit client
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Initialize audit logger
const auditLogger = createAuditLogger({
  sessionId: process.env.SESSION_ID || 'unknown',
  model: process.env.MODEL || 'claude-opus-4-5',
});

// Get current user for audit logging
async function getCurrentUser(): Promise<string> {
  try {
    const { data } = await octokit.users.getAuthenticated();
    return data.login;
  } catch {
    return 'anonymous';
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'github-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      searchRepositoriesTool,
      getFileContentsTool,
      listPullRequestsTool,
      getPullRequestTool,
      createPullRequestTool,
      listCommitsTool,
      addCommentTool,
      listCommentsTool,
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const user = await getCurrentUser();

  try {
    let result: unknown;

    switch (name) {
      case 'github_search_repositories':
        result = await auditLogger.wrapTool('search_repositories', async (a) =>
          searchRepositories(octokit, a)
        )(args, user);
        break;

      case 'github_get_file_contents':
        result = await auditLogger.wrapTool('get_file_contents', async (a) =>
          getFileContents(octokit, a)
        )(args, user);
        break;

      case 'github_list_pull_requests':
        result = await auditLogger.wrapTool('list_pull_requests', async (a) =>
          listPullRequests(octokit, a)
        )(args, user);
        break;

      case 'github_get_pull_request':
        result = await auditLogger.wrapTool('get_pull_request', async (a) =>
          getPullRequest(octokit, a)
        )(args, user);
        break;

      case 'github_create_pull_request':
        result = await auditLogger.wrapTool('create_pull_request', async (a) =>
          createPullRequest(octokit, a)
        )(args, user);
        break;

      case 'github_list_commits':
        result = await auditLogger.wrapTool('list_commits', async (a) =>
          listCommits(octokit, a)
        )(args, user);
        break;

      case 'github_add_comment':
        result = await auditLogger.wrapTool('add_comment', async (a) =>
          addComment(octokit, a)
        )(args, user);
        break;

      case 'github_list_comments':
        result = await auditLogger.wrapTool('list_comments', async (a) =>
          listComments(octokit, a)
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GitHub MCP Server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
