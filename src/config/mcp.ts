export const MCP_CONFIG = {
  CORS_ALLOWED_HEADERS: ['Content-Type', 'MCP-Protocol-Version', 'Last-Event-ID', 'mcp-session-id'],
  CORS_ALLOWED_METHODS: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  CORS_ALLOWED_ORIGIN: '*',
  DEFAULT_SERVER_NAME: 'Remote MCP',
  DEFAULT_TRANSPORT: 'http',
  EXPOSED_HEADERS: ['MCP-Protocol-Version', 'mcp-session-id'],
} as const;
