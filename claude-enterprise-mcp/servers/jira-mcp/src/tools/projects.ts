import axios from 'axios';
import { z } from 'zod';
import type { JiraConfig, JiraProject, JiraBoard } from '../../types';

/**
 * Schema for get project arguments
 */
export const getProjectSchema = z.object({
  projectKey: z.string().describe('Project key'),
});

export type GetProjectArgs = z.infer<typeof getProjectSchema>;

/**
 * Schema for get board arguments
 */
export const getBoardSchema = z.object({
  boardId: z.number().describe('Board ID'),
});

export type GetBoardArgs = z.infer<typeof getBoardSchema>;

/**
 * Schema for list boards arguments
 */
export const listBoardsSchema = z.object({
  projectKeyOrId: z.string().optional().describe('Filter by project'),
  type: z.enum(['scrum', 'kanban']).optional().describe('Board type filter'),
  startAt: z.number().min(0).default(0).describe('Starting index'),
  maxResults: z.number().min(1).max(100).default(50).describe('Maximum results'),
});

export type ListBoardsArgs = z.infer<typeof listBoardsSchema>;

/**
 * Get a Jira project by key
 */
export async function getProject(
  config: JiraConfig,
  args: GetProjectArgs
): Promise<JiraProject> {
  const { projectKey } = getProjectSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.get(
    `${config.baseUrl}/rest/api/3/project/${projectKey}`,
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
 * List Jira boards
 */
export async function listBoards(
  config: JiraConfig,
  args: ListBoardsArgs
): Promise<{ boards: JiraBoard[]; total: number }> {
  const { projectKeyOrId, type, startAt, maxResults } = listBoardsSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const params: Record<string, string | number> = {
    startAt,
    maxResults,
  };

  if (projectKeyOrId) {
    params.projectKeyOrId = projectKeyOrId;
  }

  if (type) {
    params.type = type;
  }

  const response = await axios.get(`${config.baseUrl}/rest/agile/1.0/board`, {
    params,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  return {
    boards: response.data.values,
    total: response.data.total,
  };
}

/**
 * Get a Jira board by ID
 */
export async function getBoard(
  config: JiraConfig,
  args: GetBoardArgs
): Promise<JiraBoard> {
  const { boardId } = getBoardSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.get(
    `${config.baseUrl}/rest/agile/1.0/board/${boardId}`,
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
export const getProjectTool = {
  name: 'jira_get_project',
  description: 'Get a Jira project by key',
  inputSchema: {
    type: 'object' as const,
    properties: {
      projectKey: { type: 'string', description: 'Project key' },
    },
    required: ['projectKey'],
  },
};

export const listBoardsTool = {
  name: 'jira_list_boards',
  description: 'List Jira boards (Scrum or Kanban)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      projectKeyOrId: { type: 'string', description: 'Filter by project (optional)' },
      type: {
        type: 'string',
        enum: ['scrum', 'kanban'],
        description: 'Board type filter',
      },
      startAt: { type: 'number', description: 'Starting index (default: 0)' },
      maxResults: { type: 'number', description: 'Max results (default: 50)' },
    },
    required: [],
  },
};

export const getBoardTool = {
  name: 'jira_get_board',
  description: 'Get a Jira board by ID',
  inputSchema: {
    type: 'object' as const,
    properties: {
      boardId: { type: 'number', description: 'Board ID' },
    },
    required: ['boardId'],
  },
};
