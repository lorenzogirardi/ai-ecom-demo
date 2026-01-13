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
 * Confluence configuration
 */
export interface ConfluenceConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

/**
 * Confluence user
 */
export interface ConfluenceUser {
  accountId: string;
  email?: string;
  publicName: string;
  displayName: string;
}

/**
 * Confluence space
 */
export interface ConfluenceSpace {
  id: string;
  key: string;
  name: string;
  type: 'global' | 'personal';
  description?: {
    plain?: { value: string };
    view?: { value: string };
  };
  homepage?: {
    id: string;
    title: string;
  };
}

/**
 * Confluence page
 */
export interface ConfluencePage {
  id: string;
  title: string;
  status: 'current' | 'draft' | 'archived';
  spaceId: string;
  parentId?: string;
  parentType?: 'page';
  version: {
    number: number;
    message?: string;
    createdAt: string;
    authorId: string;
  };
  body?: {
    storage?: { value: string };
    atlas_doc_format?: { value: string };
  };
  _links?: {
    webui?: string;
    base?: string;
  };
}

/**
 * Confluence comment
 */
export interface ConfluenceComment {
  id: string;
  body: {
    storage?: { value: string };
    atlas_doc_format?: { value: string };
  };
  version: {
    number: number;
    createdAt: string;
    authorId: string;
  };
}

/**
 * Confluence search result
 */
export interface ConfluenceSearchResult {
  results: Array<{
    content?: ConfluencePage;
    space?: ConfluenceSpace;
    title: string;
    excerpt?: string;
    url: string;
    resultGlobalContainer?: {
      title: string;
      displayUrl: string;
    };
  }>;
  start: number;
  limit: number;
  size: number;
  totalSize?: number;
}
