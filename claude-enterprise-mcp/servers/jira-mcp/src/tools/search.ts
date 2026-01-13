import axios from 'axios';
import { z } from 'zod';
import type { JiraConfig, JiraSearchResult } from '../../types';

/**
 * Schema for JQL search arguments
 */
export const searchIssuesSchema = z.object({
  jql: z.string().describe('JQL query string'),
  startAt: z.number().min(0).default(0).describe('Starting index'),
  maxResults: z.number().min(1).max(100).default(50).describe('Maximum results'),
  fields: z.array(z.string()).optional().describe('Fields to return'),
});

export type SearchIssuesArgs = z.infer<typeof searchIssuesSchema>;

/**
 * Search Jira issues using JQL
 */
export async function searchIssues(
  config: JiraConfig,
  args: SearchIssuesArgs
): Promise<JiraSearchResult> {
  const { jql, startAt, maxResults, fields } = searchIssuesSchema.parse(args);

  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.post(
    `${config.baseUrl}/rest/api/3/search`,
    {
      jql,
      startAt,
      maxResults,
      fields: fields || [
        'summary',
        'description',
        'status',
        'priority',
        'issuetype',
        'assignee',
        'reporter',
        'project',
        'created',
        'updated',
        'labels',
        'components',
        'fixVersions',
      ],
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
 * Tool definition for MCP
 */
export const searchIssuesTool = {
  name: 'jira_search_issues',
  description: 'Search Jira issues using JQL (Jira Query Language)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      jql: {
        type: 'string',
        description: 'JQL query (e.g., "project = PROJ AND status = Open")',
      },
      startAt: {
        type: 'number',
        description: 'Starting index for pagination (default: 0)',
        default: 0,
      },
      maxResults: {
        type: 'number',
        description: 'Maximum results to return (default: 50, max: 100)',
        default: 50,
      },
      fields: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific fields to return (optional)',
      },
    },
    required: ['jql'],
  },
};
