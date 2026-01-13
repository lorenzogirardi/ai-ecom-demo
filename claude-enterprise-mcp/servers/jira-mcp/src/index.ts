import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { searchIssues, searchIssuesTool } from './tools/search.js';
import {
  getIssue,
  getIssueTool,
  createIssue,
  createIssueTool,
  updateIssue,
  updateIssueTool,
} from './tools/issues.js';
import {
  getTransitions,
  getTransitionsTool,
  transitionIssue,
  transitionIssueTool,
} from './tools/transitions.js';
import {
  getComments,
  getCommentsTool,
  addComment,
  addCommentTool,
} from './tools/comments.js';
import {
  getProject,
  getProjectTool,
  listBoards,
  listBoardsTool,
  getBoard,
  getBoardTool,
} from './tools/projects.js';
import { createAuditLogger } from './audit/logger.js';
import type { JiraConfig } from '../types';

/**
 * Jira MCP Server for Claude Code Enterprise
 *
 * Environment variables:
 * - JIRA_BASE_URL: Jira instance URL (e.g., https://company.atlassian.net)
 * - JIRA_EMAIL: User email for authentication
 * - JIRA_API_TOKEN: API token for authentication
 * - AUDIT_LOG_DIR: Directory for local audit logs
 */

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Error: JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN are required');
  process.exit(1);
}

const jiraConfig: JiraConfig = {
  baseUrl: JIRA_BASE_URL,
  email: JIRA_EMAIL,
  apiToken: JIRA_API_TOKEN,
};

// Initialize audit logger
const auditLogger = createAuditLogger({
  sessionId: process.env.SESSION_ID || 'unknown',
  model: process.env.MODEL || 'claude-opus-4-5',
});

// Get current user for audit logging
function getCurrentUser(): string {
  return JIRA_EMAIL || 'anonymous';
}

// Create MCP server
const server = new Server(
  {
    name: 'jira-mcp',
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
      searchIssuesTool,
      getIssueTool,
      createIssueTool,
      updateIssueTool,
      getTransitionsTool,
      transitionIssueTool,
      getCommentsTool,
      addCommentTool,
      getProjectTool,
      listBoardsTool,
      getBoardTool,
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const user = getCurrentUser();

  try {
    let result: unknown;

    switch (name) {
      case 'jira_search_issues':
        result = await auditLogger.wrapTool('search_issues', async (a) =>
          searchIssues(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_get_issue':
        result = await auditLogger.wrapTool('get_issue', async (a) =>
          getIssue(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_create_issue':
        result = await auditLogger.wrapTool('create_issue', async (a) =>
          createIssue(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_update_issue':
        result = await auditLogger.wrapTool('update_issue', async (a) =>
          updateIssue(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_get_transitions':
        result = await auditLogger.wrapTool('get_transitions', async (a) =>
          getTransitions(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_transition_issue':
        result = await auditLogger.wrapTool('transition_issue', async (a) =>
          transitionIssue(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_get_comments':
        result = await auditLogger.wrapTool('get_comments', async (a) =>
          getComments(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_add_comment':
        result = await auditLogger.wrapTool('add_comment', async (a) =>
          addComment(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_get_project':
        result = await auditLogger.wrapTool('get_project', async (a) =>
          getProject(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_list_boards':
        result = await auditLogger.wrapTool('list_boards', async (a) =>
          listBoards(jiraConfig, a)
        )(args, user);
        break;

      case 'jira_get_board':
        result = await auditLogger.wrapTool('get_board', async (a) =>
          getBoard(jiraConfig, a)
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
  console.error('Jira MCP Server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
