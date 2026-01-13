/**
 * Audit log entry structure
 */
export interface AuditLog {
  timestamp: string;
  user: string;
  tool: string;
  action: string;
  parameters: Record<string, unknown>;
  result: 'success' | 'error';
  error_message?: string;
  ai_context: {
    session_id: string;
    model: string;
  };
}

/**
 * Audit logger configuration
 */
export interface AuditLoggerConfig {
  sessionId: string;
  model: string;
}

/**
 * GitHub repository search result
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

/**
 * GitHub file content
 */
export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
  encoding: string;
}

/**
 * GitHub pull request
 */
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
}

/**
 * GitHub commit
 */
export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  html_url: string;
}
