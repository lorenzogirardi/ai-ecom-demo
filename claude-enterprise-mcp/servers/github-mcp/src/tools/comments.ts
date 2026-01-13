import { Octokit } from '@octokit/rest';
import { z } from 'zod';

/**
 * Comment on a PR or issue
 */
export interface GitHubComment {
  id: number;
  body: string;
  html_url: string;
  user: {
    login: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Schema for add comment arguments
 */
export const addCommentSchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  issue_number: z.number().describe('Issue or PR number'),
  body: z.string().describe('Comment body (Markdown supported)'),
});

export type AddCommentArgs = z.infer<typeof addCommentSchema>;

/**
 * Add a comment to an issue or pull request
 * NOTE: This is a WRITE operation - requires appropriate permissions
 */
export async function addComment(
  octokit: Octokit,
  args: AddCommentArgs
): Promise<GitHubComment> {
  const { owner, repo, issue_number, body } = addCommentSchema.parse(args);

  const response = await octokit.issues.createComment({
    owner,
    repo,
    issue_number,
    body,
  });

  const comment = response.data;
  return {
    id: comment.id,
    body: comment.body || '',
    html_url: comment.html_url,
    user: {
      login: comment.user?.login || 'unknown',
    },
    created_at: comment.created_at,
    updated_at: comment.updated_at,
  };
}

/**
 * Schema for list comments arguments
 */
export const listCommentsSchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  issue_number: z.number().describe('Issue or PR number'),
  per_page: z.number().min(1).max(100).default(30).describe('Results per page'),
  page: z.number().min(1).default(1).describe('Page number'),
});

export type ListCommentsArgs = z.infer<typeof listCommentsSchema>;

/**
 * List comments on an issue or pull request
 */
export async function listComments(
  octokit: Octokit,
  args: ListCommentsArgs
): Promise<GitHubComment[]> {
  const { owner, repo, issue_number, per_page, page } = listCommentsSchema.parse(args);

  const response = await octokit.issues.listComments({
    owner,
    repo,
    issue_number,
    per_page,
    page,
  });

  return response.data.map((comment) => ({
    id: comment.id,
    body: comment.body || '',
    html_url: comment.html_url,
    user: {
      login: comment.user?.login || 'unknown',
    },
    created_at: comment.created_at,
    updated_at: comment.updated_at,
  }));
}

/**
 * Tool definitions for MCP
 */
export const addCommentTool = {
  name: 'github_add_comment',
  description: 'Add a comment to an issue or pull request (requires write access)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      issue_number: { type: 'number', description: 'Issue or PR number' },
      body: { type: 'string', description: 'Comment body (Markdown supported)' },
    },
    required: ['owner', 'repo', 'issue_number', 'body'],
  },
};

export const listCommentsTool = {
  name: 'github_list_comments',
  description: 'List comments on an issue or pull request',
  inputSchema: {
    type: 'object' as const,
    properties: {
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      issue_number: { type: 'number', description: 'Issue or PR number' },
      per_page: { type: 'number', description: 'Results per page (default: 30)' },
      page: { type: 'number', description: 'Page number (default: 1)' },
    },
    required: ['owner', 'repo', 'issue_number'],
  },
};
