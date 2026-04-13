import { generateText, Output, type UIMessage } from 'ai';
import { z } from 'zod';

import type { Locale } from '@/config/i18n';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import { getMessageText } from '@/features/chat/storage/conversation-analysis';
import type { ChatRuntimeModel } from '@/features/models/types';
import { MEMORY_KINDS, type MemoryKind } from '@/features/memory/types';
import { normalizeMemoryContent } from '@/features/memory/storage/memory-utils';

const memoryExtractionItemSchema = z.object({
  content: z.string().min(1).max(280),
  kind: z.enum(MEMORY_KINDS),
});

function formatMessages(messages: UIMessage[]) {
  return messages
    .map((message) => {
      const text = getMessageText(message);
      if (!text) {
        return null;
      }

      return `${message.role.toUpperCase()}: ${text}`;
    })
    .filter((value): value is string => Boolean(value))
    .join('\n\n');
}

export async function extractConversationMemories(
  messages: UIMessage[],
  options: {
    locale: Locale;
    runtimeModel?: ChatRuntimeModel | null;
  }
): Promise<Array<{ content: string; kind: MemoryKind }>> {
  if (!options.runtimeModel || messages.length < 4) {
    return [];
  }

  const transcript = formatMessages(messages.slice(-12));
  if (!transcript) {
    return [];
  }

  const prompt = `Extract a small set of durable user memories from this conversation.

Context:
- User locale: ${options.locale}

Rules:
- Keep only stable preferences, profile facts, or durable workflow defaults
- Ignore temporary requests, one-off tasks, and transient debugging details
- Prefer at most 3 memories
- Each item must have: kind, content
- Valid kinds only: ${MEMORY_KINDS.join(', ')}
- Use:
  - preference for stable stylistic or behavioral preferences
  - profile for durable identity or background information
  - workflow for repeated tools, stacks, defaults, or working patterns
  - fact for other stable facts that do not fit the categories above
  - manual should almost never be used for automatic extraction

Conversation:
${transcript}`;

  const { output } = await generateText({
    model: getRuntimeChatModel(options.runtimeModel),
    output: Output.array({
      element: memoryExtractionItemSchema,
    }),
    prompt,
    maxOutputTokens: 220,
  });

  return output
    .map((item) => ({
      content: normalizeMemoryContent(item.content),
      kind: item.kind,
    }))
    .filter((item) => item.content.length > 0);
}
