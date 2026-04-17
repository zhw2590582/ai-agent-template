import { API_CONFIG } from '@/config/api';

export const API_RATE_LIMITS = {
  CHAT: {
    maxRequests: 20,
    namespace: 'api:chat',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  CHAT_SUMMARY: {
    maxRequests: 30,
    namespace: 'api:chat-summary',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  CHAT_TITLE: {
    maxRequests: 30,
    namespace: 'api:chat-title',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  CONVERSATIONS_READ: {
    maxRequests: 60,
    namespace: 'api:conversations:read',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  CONVERSATIONS_WRITE: {
    maxRequests: 30,
    namespace: 'api:conversations:write',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MCP: {
    maxRequests: 30,
    namespace: 'api:mcp',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MEMORIES_READ: {
    maxRequests: 30,
    namespace: 'api:memories:read',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MEMORIES_EXTRACT: {
    maxRequests: 20,
    namespace: 'api:memories:extract',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MEMORIES_CONSOLIDATE: {
    maxRequests: 12,
    namespace: 'api:memories:consolidate',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MEMORIES_WRITE: {
    maxRequests: 30,
    namespace: 'api:memories:write',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MODEL_PROBE: {
    maxRequests: 12,
    namespace: 'api:model-probe',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  PROFILE_READ: {
    maxRequests: 30,
    namespace: 'api:profile:read',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  PROFILE_WRITE: {
    maxRequests: 30,
    namespace: 'api:profile:write',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  RAG_READ: {
    maxRequests: 30,
    namespace: 'api:rag:read',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  RAG_TEST: {
    maxRequests: 12,
    namespace: 'api:rag:test',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  RAG_WRITE: {
    maxRequests: 20,
    namespace: 'api:rag:write',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  SEARCH_TEST: {
    maxRequests: 12,
    namespace: 'api:search:test',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  SANDBOX_TEST: {
    maxRequests: 12,
    namespace: 'api:sandbox:test',
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
} as const;
