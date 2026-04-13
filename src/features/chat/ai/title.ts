import { generateText } from 'ai';

import { getRuntimeChatModel } from '@/features/chat/ai/models';
import type { ChatRuntimeModel } from '@/features/models/types';

export function cleanTitle(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim()
    .slice(0, 60);
}

export async function generateConversationTitle(
  input: string,
  options?: {
    locale?: 'zh-CN' | 'en-US';
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

  const locale = options.locale ?? 'zh-CN';
  const prompt = `Generate a short conversation title from this first user message.

Context:
- User locale: ${locale}

Requirements:
- Output title only
- Use the language that best matches the user's message and locale
- Keep it short and specific
- Do not use quotes
- Do not add trailing punctuation
- Avoid generic titles like "New Chat"

User message: ${normalized}`;

  const { text } = await generateText({
    model: getRuntimeChatModel(options.runtimeModel),
    prompt,
    maxOutputTokens: 32,
  });

  const cleaned = cleanTitle(text);
  if (!cleaned) {
    const firstSentence = normalized.split(/[.!?。！？\n]/)[0]?.trim() ?? normalized;
    return cleanTitle(firstSentence || normalized);
  }

  return cleaned;
}
