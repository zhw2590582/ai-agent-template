// Centralized application configuration.

export const AI_CONFIG = {
  DEFAULT_MAX_TOKENS: 800,
} as const;

export const MEMORY_CONFIG = {
  CONTEXT_MAX_ITEMS: 8,
  SUMMARY_MIN_MESSAGES: 8,
  SUMMARY_RECENT_MESSAGE_WINDOW: 10,
} as const;

export const MODEL_SYNC_CONFIG = {
  EXCLUDED_MODEL_ID_SEGMENTS: [
    'realtime',
    'audio',
    'speech',
    'transcription',
    'tts',
    'embedding',
    'moderation',
    'image',
    'vision-preview',
  ],
} as const;

export const CONVERSATION_SIDEBAR_PAGE_SIZE = 20;

export const HEADER_NAV_ITEMS = [
  { id: 'models', translationKey: 'navigation.models' },
  { id: 'subagent', translationKey: 'navigation.subagent' },
  { id: 'sandbox', translationKey: 'navigation.sandbox' },
  { id: 'mcp', translationKey: 'navigation.mcp' },
  { id: 'skills', translationKey: 'navigation.skills' },
  { id: 'rag', translationKey: 'navigation.rag' },
  { id: 'memory', translationKey: 'navigation.memory' },
  { id: 'search', translationKey: 'navigation.search' },
] as const;
export type HeaderNavItemId = (typeof HEADER_NAV_ITEMS)[number]['id'];

export const THEME_STORAGE_KEY = 'theme-preference';
export const THEME_COOKIE_KEY = 'theme-preference';
export type ThemeMode = 'dark' | 'light';

export const DEV_CONFIG = {
  ENABLE_DEBUG_LOGS: false,
} as const;

export const API_CONFIG = {
  RATE_LIMIT_WINDOW: 60000,
} as const;
