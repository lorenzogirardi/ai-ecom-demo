import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import type { GitHubPullRequest, GitHubCommit } from '../../types';

/**
 * Schema for list pull requests arguments
 */
export const listPullRequestsSchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  state: z.enum(['open', 'closed', 'all']).default('open').describe('PR state filter'),
  per_page: z.number().min(1).max(100).default(30).describe('Results per page'),
  page: z.number().min(1).default(1).describe('Page number'),
});

export type ListPullRequestsArgs = z.infer<typeof listPullRequestsSchema>;

/**
 * Schema for get pull request arguments
 */
export const getPullRequestSchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  pull_number: z.number().describe('Pull request number'),
});

export type GetPullRequestArgs = z.infer<typeof getPullRequestSchema>;

/**
 * Schema for create pull request arguments
 */
export const createPullRequestSchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  title: z.string().describe('PR title'),
  body: z.string().optional().describe('PR description'),
  head: z.string().describe('Branch containing changes'),
  base: z.string().describe('Branch to merge into'),
  draft: z.boolean().default(false).describe('Create as draft PR'),
});

export type CreatePullRequestArgs = z.infer<typeof createPullRequestSchema>;

/**
 * Schema for list commits arguments
 */
export const listCommitsSchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  sha: z.string().optional().describe('Branch or commit SHA'),
  per_page: z.number().min(1).max(100).default(30).describe('Results per page'),
  page: z.number().min(1).default(1).describe('Page number'),
});

export type ListCommitsArgs = z.infer<typeof listCommitsSchema>;

/**
 * List pull requests
 */
export async function listPullRequests(
  octokit: Octokit,
  args: ListPullRequestsArgs
): Promise<GitHubPullRequest[]> {
  const { owner, repo, state, per_page, page } = listPullRequestsSchema.parse(args);

  const response = await octokit.pulls.list({
    owner,
    repo,
    state,
    per_page,
    page,
  });

  return response.data.map((pr) => ({
    id: pr.id,
    number: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.state as 'open' | 'closed',
    html_url: pr.html_url,
    user: {
      login: pr.user?.login || 'unknown',
    },
    head: {
      ref: pr.head.ref,
      sha: pr.head.sha,
    },
    base: {
      ref: pr.base.ref,
    },
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    merged_at: pr.merged_at,
  }));
}

/**
 * Get a single pull request
 */
export async function getPullRequest(
  octokit: Octokit,
  args: GetPullRequestArgs
): Promise<GitHubPullRequest> {
  const { owner, repo, pull_number } = getPullRequestSchema.parse(args);

  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });

  const pr = response.data;
  return {
    id: pr.id,
    number: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.state as 'open' | 'closed',
    html_url: pr.html_url,
    user: {
      login: pr.user?.login || 'unknown',
    },
    head: {
      ref: pr.head.ref,
      sha: pr.head.sha,
    },
    base: {
      ref: pr.base.ref,
    },
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    merged_at: pr.merged_at,
  };
}

/**
 * Create a pull request
 * NOTE: This is a WRITE operation - requires appropriate permissions
 */
export async function createPullRequest(
  octokit: Octokit,
  args: CreatePullRequestArgs
): Promise<GitHubPullRequest> {
  const { owner, repo, title, body, head, base, draft } = createPullRequestSchema.parse(args);

  const response = await octokit.pulls.create({
    owner,
    repo,
    title,
    body,
    head,
    base,
    draft,
  });

  const pr = response.data;
  return {
    id: pr.id,
    number: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.state as 'open' | 'closed',
    html_url: pr.html_url,
    user: {
      login: pr.user?.login || 'unknown',
    },
    head: {
      ref: pr.head.ref,
      sha: pr.head.sha,
    },
    base: {
      ref: pr.base.ref,
    },
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    merged_at: pr.merged_at,
  };
}

/**
 * List commits
 */
export async function listCommits(
  octokit: Octokit,
  args: ListCommitsArgs
): Promise<GitHubCommit[]> {
  const { owner, repo, sha, per_page, page } = listCommitsSchema.parse(args);

  const response = await octokit.repos.listCommits({
    owner,
    repo,
    sha,
    per_page,
    page,
  });

  return response.data.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: {
      name: commit.commit.author?.name || 'unknown',
      email: commit.commit.author?.email || 'unknown',
      date: commit.commit.author?.date || '',
    },
    html_url: commit.html_url,
  }));
}

/**
 * Tool definitions for MCP
 */
export const listPullRequestsTool = {
  name: 'github_list_pull_requests',
  description: 'List pull requests for a GitHub repository',
  inputSchema: {
    type: 'object' as const,
    properties: {
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      state: {
        type: 'string',
        enum: ['open', 'closed', 'all'],
        description: 'PR state filter (default: open)',
      },
      per_page: { type: 'number', description: 'Results per page (default: 30)' },
      page: { type: 'number', description: 'Page number (default: 1)' },
    },
    required: ['owner', 'repo'],
  },
};

export const getPullRequestTool = {
  name: 'github_get_pull_request',
  description: 'Get details of a specific pull request',
  inputSchema: {
    type: 'object' as const,
    properties: {
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      pull_number: { type: 'number', description: 'Pull request number' },
    },
    required: ['owner', 'repo', 'pull_number'],
  },
};

export const createPullRequestTool = {
  name: 'github_create_pull_request',
  description: 'Create a new pull request (requires write access)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      title: { type: 'string', description: 'PR title' },
      body: { type: 'string', description: 'PR description' },
      head: { type: 'string', description: 'Branch containing changes' },
      base: { type: 'string', description: 'Branch to merge into' },
      draft: { type: 'boolean', description: 'Create as draft PR' },
    },
    required: ['owner', 'repo', 'title', 'head', 'base'],
  },
};

export const listCommitsTool = {
  name: 'github_list_commits',
  description: 'List commits for a GitHub repository',
  inputSchema: {
    type: 'object' as const,
    properties: {
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      sha: { type: 'string', description: 'Branch or commit SHA (optional)' },
      per_page: { type: 'number', description: 'Results per page (default: 30)' },
      page: { type: 'number', description: 'Page number (default: 1)' },
    },
    required: ['owner', 'repo'],
  },
};
