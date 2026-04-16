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

export const MODEL_PROVIDER_DEFAULTS = {
  CUSTOM_PROVIDER_API_FORMAT: 'openai',
  CUSTOM_PROVIDER_ID_FALLBACK: 'custom-provider',
  CUSTOM_PROVIDER_MONOGRAM: 'CP',
  DEFAULT_ENABLED_PROVIDER_ID: 'deepseek',
  PLACEHOLDER_BASE_URL: 'https://api.example.com/v1',
} as const;
