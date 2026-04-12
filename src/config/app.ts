// 集中管理所有应用级配置（AI、聊天、主题、模型、导航、特性开关、API等）

export const AI_CONFIG = {
  DEFAULT_MODEL: 'deepseek-chat',
  DEFAULT_MAX_TOKENS: 800,
  DEFAULT_TEMPERATURE: 0.7,
  STREAM_TIMEOUT: 30000,
  MAX_CONTEXT_TOKENS: 4000,
  MAX_OUTPUT_TOKENS: 2000,
} as const;

export const CHAT_CONFIG = {
  MAX_HISTORY_MESSAGES: 50,
  TYPING_INDICATOR_DELAY: 100,
  MESSAGE_ANIMATION_DURATION: 200,
  MAX_INPUT_LENGTH: 4000,
} as const;

export const CONVERSATION_SIDEBAR_PAGE_SIZE = 20;

export const MODEL_OPTIONS = [
  {
    id: 'deepseek-chat',
    translationKey: 'chat.models.deepseek_chat',
  },
  {
    id: 'deepseek-coder',
    translationKey: 'chat.models.deepseek_coder',
  },
] as const;
export type ModelId = (typeof MODEL_OPTIONS)[number]['id'];

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
  SHOW_PERFORMANCE_METRICS: false,
};

export const FEATURES = {
  TOOL_CALLING: true,
  STREAMING: true,
  MEMORY: false,
  RAG: false,
  PLANNING: false,
  MULTI_AGENT: false,
  I18N: true,
  VOICE_INPUT: false,
  IMAGE_UPLOAD: false,
} as const;

export const API_CONFIG = {
  REQUEST_TIMEOUT: 30000,
  CHAT_TIMEOUT: 60000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT_WINDOW: 60000,
  RATE_LIMIT_MAX_REQUESTS: 20,
} as const;
