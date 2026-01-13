import axios from 'axios';
import { z } from 'zod';
import type { JiraConfig, JiraIssue } from '../../types';

/**
 * Schema for get issue arguments
 */
export const getIssueSchema = z.object({
  issueKey: z.string().describe('Issue key (e.g., PROJ-123)'),
  fields: z.array(z.string()).optional().describe('Fields to return'),
});

export type GetIssueArgs = z.infer<typeof getIssueSchema>;

/**
 * Schema for create issue arguments
 */
export const createIssueSchema = z.object({
  projectKey: z.string().describe('Project key'),
  issueType: z.string().describe('Issue type (Story, Task, Bug, etc.)'),
  summary: z.string().describe('Issue summary'),
  description: z.string().optional().describe('Issue description'),
  priority: z.string().optional().describe('Priority name'),
  labels: z.array(z.string()).optional().describe('Labels'),
  assignee: z.string().optional().describe('Assignee account ID'),
  components: z.array(z.string()).optional().describe('Component names'),
});

export type CreateIssueArgs = z.infer<typeof createIssueSchema>;

/**
 * Schema for update issue arguments
 */
export const updateIssueSchema = z.object({
  issueKey: z.string().describe('Issue key'),
  summary: z.string().optional().describe('New summary'),
  description: z.string().optional().describe('New description'),
  priority: z.string().optional().describe('New priority'),
  labels: z.array(z.string()).optional().describe('New labels'),
  assignee: z.string().optional().describe('New assignee account ID'),
});

export type UpdateIssueArgs = z.infer<typeof updateIssueSchema>;

/**
 * Get a Jira issue by key
 */
export async function getIssue(
  config: JiraConfig,
  args: GetIssueArgs
): Promise<JiraIssue> {
  const { issueKey, fields } = getIssueSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const params = new URLSearchParams();
  if (fields?.length) {
    params.set('fields', fields.join(','));
  }

  const response = await axios.get(
    `${config.baseUrl}/rest/api/3/issue/${issueKey}${params.toString() ? '?' + params.toString() : ''}`,
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
 * Create a new Jira issue
 */
export async function createIssue(
  config: JiraConfig,
  args: CreateIssueArgs
): Promise<JiraIssue> {
  const {
    projectKey,
    issueType,
    summary,
    description,
    priority,
    labels,
    assignee,
    components,
  } = createIssueSchema.parse(args);

  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  // Build the issue fields
  const fields: Record<string, unknown> = {
    project: { key: projectKey },
    issuetype: { name: issueType },
    summary,
  };

  if (description) {
    // Jira API v3 uses ADF for description
    fields.description = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: description }],
        },
      ],
    };
  }

  if (priority) {
    fields.priority = { name: priority };
  }

  if (labels?.length) {
    fields.labels = labels;
  }

  if (assignee) {
    fields.assignee = { accountId: assignee };
  }

  if (components?.length) {
    fields.components = components.map((name) => ({ name }));
  }

  const response = await axios.post(
    `${config.baseUrl}/rest/api/3/issue`,
    { fields },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Fetch the full issue details
  return getIssue(config, { issueKey: response.data.key });
}

/**
 * Update a Jira issue
 */
export async function updateIssue(
  config: JiraConfig,
  args: UpdateIssueArgs
): Promise<JiraIssue> {
  const { issueKey, summary, description, priority, labels, assignee } =
    updateIssueSchema.parse(args);

  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const fields: Record<string, unknown> = {};

  if (summary) {
    fields.summary = summary;
  }

  if (description) {
    fields.description = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: description }],
        },
      ],
    };
  }

  if (priority) {
    fields.priority = { name: priority };
  }

  if (labels) {
    fields.labels = labels;
  }

  if (assignee) {
    fields.assignee = { accountId: assignee };
  }

  await axios.put(
    `${config.baseUrl}/rest/api/3/issue/${issueKey}`,
    { fields },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Return updated issue
  return getIssue(config, { issueKey });
}

/**
 * Tool definitions for MCP
 */
export const getIssueTool = {
  name: 'jira_get_issue',
  description: 'Get a Jira issue by key',
  inputSchema: {
    type: 'object' as const,
    properties: {
      issueKey: {
        type: 'string',
        description: 'Issue key (e.g., PROJ-123)',
      },
      fields: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific fields to return',
      },
    },
    required: ['issueKey'],
  },
};

export const createIssueTool = {
  name: 'jira_create_issue',
  description: 'Create a new Jira issue (Story, Task, Bug, etc.)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      projectKey: { type: 'string', description: 'Project key' },
      issueType: { type: 'string', description: 'Issue type (Story, Task, Bug, etc.)' },
      summary: { type: 'string', description: 'Issue summary' },
      description: { type: 'string', description: 'Issue description' },
      priority: { type: 'string', description: 'Priority name' },
      labels: {
        type: 'array',
        items: { type: 'string' },
        description: 'Labels',
      },
      assignee: { type: 'string', description: 'Assignee account ID' },
      components: {
        type: 'array',
        items: { type: 'string' },
        description: 'Component names',
      },
    },
    required: ['projectKey', 'issueType', 'summary'],
  },
};

export const updateIssueTool = {
  name: 'jira_update_issue',
  description: 'Update a Jira issue fields',
  inputSchema: {
    type: 'object' as const,
    properties: {
      issueKey: { type: 'string', description: 'Issue key' },
      summary: { type: 'string', description: 'New summary' },
      description: { type: 'string', description: 'New description' },
      priority: { type: 'string', description: 'New priority' },
      labels: {
        type: 'array',
        items: { type: 'string' },
        description: 'New labels',
      },
      assignee: { type: 'string', description: 'New assignee account ID' },
    },
    required: ['issueKey'],
  },
};
