import { API_CONFIG } from '@/config/api';

export const API_RATE_LIMITS = {
  CHAT: {
    maxRequests: 20,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  CHAT_SUMMARY: {
    maxRequests: 30,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  CHAT_TITLE: {
    maxRequests: 30,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  CONVERSATIONS_READ: {
    maxRequests: 60,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  CONVERSATIONS_WRITE: {
    maxRequests: 30,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MCP: {
    maxRequests: 30,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MEMORIES_READ: {
    maxRequests: 30,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MEMORIES_WRITE: {
    maxRequests: 30,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  MODEL_PROBE: {
    maxRequests: 12,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  PROFILE_READ: {
    maxRequests: 30,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
  PROFILE_WRITE: {
    maxRequests: 30,
    windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  },
} as const;
