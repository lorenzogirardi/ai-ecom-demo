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
 * Jira configuration
 */
export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

/**
 * Jira user
 */
export interface JiraUser {
  accountId: string;
  emailAddress?: string;
  displayName: string;
  active: boolean;
}

/**
 * Jira issue
 */
export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
      id: string;
    };
    priority?: {
      name: string;
      id: string;
    };
    issuetype: {
      name: string;
      id: string;
    };
    assignee?: JiraUser;
    reporter?: JiraUser;
    project: {
      key: string;
      name: string;
    };
    created: string;
    updated: string;
    labels?: string[];
    components?: Array<{ name: string }>;
    fixVersions?: Array<{ name: string }>;
  };
}

/**
 * Jira project
 */
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  lead?: JiraUser;
  issueTypes?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

/**
 * Jira board
 */
export interface JiraBoard {
  id: number;
  name: string;
  type: 'scrum' | 'kanban';
  location?: {
    projectKey: string;
    projectName: string;
  };
}

/**
 * Jira transition
 */
export interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
  };
}

/**
 * Jira comment
 */
export interface JiraComment {
  id: string;
  author: JiraUser;
  body: string;
  created: string;
  updated: string;
}

/**
 * Jira search result
 */
export interface JiraSearchResult {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}
