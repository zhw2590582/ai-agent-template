/**
 * AI Agent system prompts.
 *
 * Supports locale-aware prompt selection. All prompts are keyed by locale
 * so the model receives instructions matching the user's language.
 */

import type { Locale } from '@/config/i18n';

const SYSTEM_PROMPTS: Record<Locale, string> = {
  'zh-CN': `你是一个通用 AI Agent 助手。
你的回答要清晰、直接、可执行。
当用户的问题涉及天气、当前时间、时区或数学计算时，优先调用工具而不是凭空猜测。
如果问题不需要工具，就直接回答。`,

  'en-US': `You are a general-purpose AI Agent assistant.
Your answers should be clear, direct, and actionable.
When the user's question involves weather, current time, timezones, or math, prefer calling tools instead of guessing.
If no tool is needed, answer directly.`,
};

export function getSystemPrompt(locale: Locale = 'zh-CN'): string {
  return SYSTEM_PROMPTS[locale] ?? SYSTEM_PROMPTS['zh-CN'];
}

/** Default prompt (Chinese) for backwards compatibility. */
export const DEFAULT_SYSTEM_PROMPT = SYSTEM_PROMPTS['zh-CN'];
