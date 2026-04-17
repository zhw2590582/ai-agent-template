export const API_CONFIG = {
  RATE_LIMIT_STORE_CLEANUP_THRESHOLD: 500,
  RATE_LIMIT_WINDOW: 60000,
} as const;

export const API_ROUTES = {
  chat: '/api/chat',
  chatSummary: '/api/chat/summary',
  chatTitle: '/api/chat/title',
  conversations: '/api/conversations',
  conversationSummaries: '/api/conversations/summaries',
  mcpTest: '/api/mcp/test',
  memories: '/api/memories',
  memoriesConsolidate: '/api/memories/consolidate',
  memoriesExtract: '/api/memories/extract',
  modelsProviders: '/api/models/providers',
  profile: '/api/profile',
  ragDocuments: '/api/rag/documents',
  ragTest: '/api/rag/test',
  sandboxTest: '/api/sandbox/test',
  searchTest: '/api/search/test',
} as const;
