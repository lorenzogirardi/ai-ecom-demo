import axios from 'axios';
import { z } from 'zod';
import type { JiraConfig, JiraTransition, JiraIssue } from '../../types';

/**
 * Schema for get transitions arguments
 */
export const getTransitionsSchema = z.object({
  issueKey: z.string().describe('Issue key'),
});

export type GetTransitionsArgs = z.infer<typeof getTransitionsSchema>;

/**
 * Schema for transition issue arguments
 */
export const transitionIssueSchema = z.object({
  issueKey: z.string().describe('Issue key'),
  transitionId: z.string().describe('Transition ID'),
  comment: z.string().optional().describe('Comment to add with transition'),
});

export type TransitionIssueArgs = z.infer<typeof transitionIssueSchema>;

/**
 * Get available transitions for an issue
 */
export async function getTransitions(
  config: JiraConfig,
  args: GetTransitionsArgs
): Promise<JiraTransition[]> {
  const { issueKey } = getTransitionsSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const response = await axios.get(
    `${config.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.transitions;
}

/**
 * Transition an issue to a new status
 */
export async function transitionIssue(
  config: JiraConfig,
  args: TransitionIssueArgs
): Promise<JiraIssue> {
  const { issueKey, transitionId, comment } = transitionIssueSchema.parse(args);
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const body: Record<string, unknown> = {
    transition: { id: transitionId },
  };

  if (comment) {
    body.update = {
      comment: [
        {
          add: {
            body: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: comment }],
                },
              ],
            },
          },
        },
      ],
    };
  }

  await axios.post(
    `${config.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
    body,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Return updated issue
  const { getIssue } = await import('./issues.js');
  return getIssue(config, { issueKey });
}

/**
 * Tool definitions for MCP
 */
export const getTransitionsTool = {
  name: 'jira_get_transitions',
  description: 'Get available transitions for a Jira issue',
  inputSchema: {
    type: 'object' as const,
    properties: {
      issueKey: {
        type: 'string',
        description: 'Issue key (e.g., PROJ-123)',
      },
    },
    required: ['issueKey'],
  },
};

export const transitionIssueTool = {
  name: 'jira_transition_issue',
  description: 'Transition a Jira issue to a new status',
  inputSchema: {
    type: 'object' as const,
    properties: {
      issueKey: { type: 'string', description: 'Issue key' },
      transitionId: { type: 'string', description: 'Transition ID (use jira_get_transitions to find)' },
      comment: { type: 'string', description: 'Comment to add with transition' },
    },
    required: ['issueKey', 'transitionId'],
  },
};
