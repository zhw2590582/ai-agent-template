import { generateText, Output, type UIMessage } from 'ai';
import { z } from 'zod';

import type { Locale } from '@/config/i18n';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import { getMessageText } from '@/features/chat/storage/conversation-analysis';
import type { ChatRuntimeModel } from '@/features/models/types';
import { MEMORY_KINDS, type MemoryKind } from '@/features/memory/types';
import { normalizeMemoryContent } from '@/features/memory/storage/memory-utils';

const AUTO_MEMORY_KINDS = MEMORY_KINDS.filter((kind) => kind !== 'manual');

const memoryExtractionItemSchema = z.object({
  content: z.string().min(1).max(280),
  kind: z.enum(AUTO_MEMORY_KINDS),
});
const memoryExtractionArraySchema = z.array(memoryExtractionItemSchema).max(3);

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
  if (!options.runtimeModel || messages.length < 2) {
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
- Match the language of the conversation first
- Use locale only as a fallback when the conversation language is ambiguous
- Keep only stable preferences, profile facts, or durable workflow defaults
- Ignore temporary requests, one-off tasks, and transient debugging details
- Prefer at most 3 memories
- Each item must have: kind, content
- Valid kinds only: ${AUTO_MEMORY_KINDS.join(', ')}
- Use:
  - preference for stable stylistic or behavioral preferences
  - profile for durable identity or background information
  - workflow for repeated tools, stacks, defaults, or working patterns
  - fact for other stable facts that do not fit the categories above

Conversation:
${transcript}`;

  let output: Array<{ content: string; kind: (typeof AUTO_MEMORY_KINDS)[number] }>;

  try {
    const result = await generateText({
      model: getRuntimeChatModel(options.runtimeModel),
      output: Output.array({
        element: memoryExtractionItemSchema,
      }),
      prompt,
      maxOutputTokens: 220,
    });

    output = result.output;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.toLowerCase().includes('response_format')) {
      throw error;
    }

    const fallbackPrompt = `${prompt}

Return valid JSON only.
- Output a JSON array
- Do not wrap the JSON in markdown fences
- Each item must follow this shape: {"kind":"preference|profile|workflow|fact","content":"..."}
- Return [] when there is nothing worth saving`;

    const { text } = await generateText({
      model: getRuntimeChatModel(options.runtimeModel),
      prompt: fallbackPrompt,
      maxOutputTokens: 220,
    });

    try {
      const parsed = memoryExtractionArraySchema.safeParse(JSON.parse(text));
      output = parsed.success ? parsed.data : [];
    } catch {
      output = [];
    }
  }

  return output
    .map((item) => ({
      content: normalizeMemoryContent(item.content),
      kind: item.kind,
    }))
    .filter((item) => item.content.length > 0);
}
