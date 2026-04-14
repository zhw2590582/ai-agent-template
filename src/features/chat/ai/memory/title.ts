import { generateText } from 'ai';

import { AI_CONFIG, TEXT_LIMITS } from '@/config/app';
import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import type { ChatRuntimeModel } from '@/features/models/types';

export function cleanTitle(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim()
    .slice(0, TEXT_LIMITS.GENERATED_TITLE);
}

export async function generateConversationTitle(
  input: string,
  options?: {
    locale?: Locale;
    runtimeModel?: ChatRuntimeModel | null;
  }
) {
  const normalized = cleanTitle(input);

  if (!normalized) {
    return 'New Chat';
  }

  if (!options?.runtimeModel) {
    const firstSentence = normalized.split(/[.!?。！？\n]/)[0]?.trim() ?? normalized;
    return cleanTitle(firstSentence || normalized);
  }

  const locale = options.locale ?? DEFAULT_LOCALE;
  const prompt = `Generate a short conversation title from this first user message.

Context:
- User locale: ${locale}

Requirements:
- Output title only
- Match the language of the user's message first
- Use locale only as a fallback when the message language is ambiguous
- Keep it short and specific
- Do not use quotes
- Do not add trailing punctuation
- Avoid generic titles like "New Chat"

User message: ${normalized}`;

  const { text } = await generateText({
    model: getRuntimeChatModel(options.runtimeModel),
    prompt,
    maxOutputTokens: AI_CONFIG.TITLE_MAX_OUTPUT_TOKENS,
  });

  const cleaned = cleanTitle(text);
  if (!cleaned) {
    const firstSentence = normalized.split(/[.!?。！？\n]/)[0]?.trim() ?? normalized;
    return cleanTitle(firstSentence || normalized);
  }

  return cleaned;
}
