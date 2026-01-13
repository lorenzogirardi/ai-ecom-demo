import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import type { GitHubRepository } from '../../types';

/**
 * Schema for search repositories arguments
 */
export const searchRepositoriesSchema = z.object({
  query: z.string().describe('Search query (GitHub search syntax)'),
  per_page: z.number().min(1).max(100).default(30).describe('Results per page (max 100)'),
  page: z.number().min(1).default(1).describe('Page number'),
});

export type SearchRepositoriesArgs = z.infer<typeof searchRepositoriesSchema>;

/**
 * Search GitHub repositories
 */
export async function searchRepositories(
  octokit: Octokit,
  args: SearchRepositoriesArgs
): Promise<GitHubRepository[]> {
  const { query, per_page, page } = searchRepositoriesSchema.parse(args);

  const response = await octokit.search.repos({
    q: query,
    per_page,
    page,
  });

  return response.data.items.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    private: repo.private,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
  }));
}

/**
 * Tool definition for MCP
 */
export const searchRepositoriesTool = {
  name: 'github_search_repositories',
  description: 'Search for GitHub repositories using the GitHub search syntax',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search query (GitHub search syntax)',
      },
      per_page: {
        type: 'number',
        description: 'Results per page (default: 30, max: 100)',
        default: 30,
      },
      page: {
        type: 'number',
        description: 'Page number (default: 1)',
        default: 1,
      },
    },
    required: ['query'],
  },
};
