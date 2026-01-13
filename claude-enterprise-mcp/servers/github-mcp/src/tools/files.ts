import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import type { GitHubFileContent } from '../../types';

/**
 * Schema for get file contents arguments
 */
export const getFileContentsSchema = z.object({
  owner: z.string().describe('Repository owner (username or organization)'),
  repo: z.string().describe('Repository name'),
  path: z.string().describe('Path to the file'),
  ref: z.string().optional().describe('Branch, tag, or commit SHA (default: default branch)'),
});

export type GetFileContentsArgs = z.infer<typeof getFileContentsSchema>;

/**
 * Get file contents from a GitHub repository
 */
export async function getFileContents(
  octokit: Octokit,
  args: GetFileContentsArgs
): Promise<GitHubFileContent> {
  const { owner, repo, path, ref } = getFileContentsSchema.parse(args);

  const response = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref,
  });

  // Handle file content (not directory)
  if ('content' in response.data && !Array.isArray(response.data)) {
    const data = response.data;
    return {
      name: data.name,
      path: data.path,
      sha: data.sha,
      size: data.size,
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      encoding: 'utf-8',
    };
  }

  throw new Error(`Path "${path}" is a directory, not a file`);
}

/**
 * Tool definition for MCP
 */
export const getFileContentsTool = {
  name: 'github_get_file_contents',
  description: 'Get the contents of a file from a GitHub repository',
  inputSchema: {
    type: 'object' as const,
    properties: {
      owner: {
        type: 'string',
        description: 'Repository owner (username or organization)',
      },
      repo: {
        type: 'string',
        description: 'Repository name',
      },
      path: {
        type: 'string',
        description: 'Path to the file',
      },
      ref: {
        type: 'string',
        description: 'Branch, tag, or commit SHA (optional, defaults to default branch)',
      },
    },
    required: ['owner', 'repo', 'path'],
  },
};
