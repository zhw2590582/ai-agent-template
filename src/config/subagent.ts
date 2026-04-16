export const SUBAGENT_CONFIG = {
  DEFAULT_MAX_TOKENS: 2_000,
  DEFAULT_SYSTEM_PROMPT:
    'You are a focused specialist subagent. Execute the assigned task clearly, stay within scope, and return concise actionable results.',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_THEME_COLOR: '#14b8a6',
  MAX_TEMPERATURE: 2,
  MAX_TOKENS: 8_192,
  MIN_TEMPERATURE: 0,
  MIN_TOKENS: 128,
} as const;
