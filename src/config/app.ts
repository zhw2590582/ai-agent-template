// Centralized application configuration.

export const AI_CONFIG = {
  CHAT_MAX_DURATION: 60,
  DEFAULT_MAX_TOKENS: 800,
  MEMORY_EXTRACTION_MAX_OUTPUT_TOKENS: 220,
  SUMMARY_MAX_OUTPUT_TOKENS: 220,
  TITLE_MAX_OUTPUT_TOKENS: 32,
} as const;

export const CHAT_UI_CONFIG = {
  INVALID_CONVERSATION_RESET_DELAY_MS: 350,
  MEMORY_SETTINGS_INPUT_DEBOUNCE_MS: 600,
  POST_FINISH_REFRESH_DELAY_MS: 1200,
  SAVE_FEEDBACK_DURATION_MS: 1400,
  SIDEBAR_SEARCH_DEBOUNCE_MS: 250,
} as const;

export const MEMORY_CONFIG = {
  CONTEXT_MAX_ITEMS: 4,
  SUMMARY_MIN_MESSAGES: 8,
  SUMMARY_RECENT_MESSAGE_WINDOW: 10,
} as const;

export const MEMORY_EXTRACTION_CONFIG = {
  FALLBACK_MAX_OUTPUT_TOKENS: 220,
  MAX_CONTENT_LENGTH: 280,
  MAX_ITEMS: 3,
  MIN_MESSAGES: 2,
  TRANSCRIPT_MESSAGE_WINDOW: 12,
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

export const PAGINATION_CONFIG = {
  CONVERSATIONS_MAX_LIMIT: 50,
  CONVERSATIONS_MAX_OFFSET: 10_000,
} as const;

export const TEXT_LIMITS = {
  CONVERSATION_PREVIEW: 120,
  CONVERSATION_SUMMARY: 4000,
  CONVERSATION_TITLE: 100,
  GENERATED_SUMMARY: 1200,
  GENERATED_TITLE: 60,
  INITIAL_MESSAGE: 10_000,
  MEMORY_CONTENT: 280,
} as const;

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
  RATE_LIMIT_STORE_CLEANUP_THRESHOLD: 500,
  RATE_LIMIT_WINDOW: 60000,
} as const;
