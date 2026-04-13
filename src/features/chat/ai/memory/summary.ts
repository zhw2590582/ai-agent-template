import type { UIMessage } from 'ai';
import { generateText } from 'ai';

import { MEMORY_CONFIG } from '@/config/app';
import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import { getMessageText } from '@/features/chat/storage/conversation-analysis';
import type { ChatRuntimeModel, MemorySettings } from '@/features/models/types';

export function resolveConversationSummaryConfig(memorySettings?: Partial<MemorySettings> | null) {
  return {
    recentMessageWindow:
      memorySettings?.recentMessageWindow ?? MEMORY_CONFIG.SUMMARY_RECENT_MESSAGE_WINDOW,
    summaryMinMessages: memorySettings?.summaryMinMessages ?? MEMORY_CONFIG.SUMMARY_MIN_MESSAGES,
  };
}

function trimSummary(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 1200);
}

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

export function shouldGenerateConversationSummary(
  messages: UIMessage[],
  memorySettings?: Partial<MemorySettings> | null
) {
  return messages.length >= resolveConversationSummaryConfig(memorySettings).summaryMinMessages;
}

export function buildConversationSummaryContext(summary: string) {
  const normalized = trimSummary(summary);
  if (!normalized) {
    return null;
  }

  return {
    id: 'conversation-summary-context',
    role: 'system' as const,
    parts: [
      {
        type: 'text' as const,
        text: `Conversation summary:\n${normalized}\n\nUse this as compressed prior context. Prefer the latest user messages when there is a conflict.`,
      },
    ],
  };
}

export async function generateConversationSummary(
  messages: UIMessage[],
  options: {
    existingSummary?: string | null;
    locale?: Locale;
    memorySettings?: Partial<MemorySettings> | null;
    runtimeModel?: ChatRuntimeModel | null;
  }
) {
  const config = resolveConversationSummaryConfig(options.memorySettings);

  if (
    !options.runtimeModel ||
    !shouldGenerateConversationSummary(messages, options.memorySettings)
  ) {
    return options.existingSummary?.trim() || null;
  }

  const locale = options.locale ?? DEFAULT_LOCALE;
  const existingSummary = options.existingSummary?.trim() || null;
  const scopedMessages = existingSummary ? messages.slice(-config.recentMessageWindow) : messages;
  const transcript = formatMessages(scopedMessages);

  if (!transcript) {
    return existingSummary;
  }

  const prompt = existingSummary
    ? `Update the existing conversation summary using the recent messages.

Context:
- User locale: ${locale}

Requirements:
- Output summary only
- Keep it concise and factual
- Preserve stable user preferences, ongoing tasks, constraints, and unresolved follow-ups
- Prefer recent messages when they change earlier context
- Do not include markdown headings or bullet nesting

Existing summary:
${existingSummary}

Recent messages:
${transcript}`
    : `Summarize this conversation for future context injection.

Context:
- User locale: ${locale}

Requirements:
- Output summary only
- Keep it concise and factual
- Capture stable user preferences, ongoing tasks, important decisions, and unresolved follow-ups
- Do not include markdown headings or bullet nesting

Conversation:
${transcript}`;

  const { text } = await generateText({
    model: getRuntimeChatModel(options.runtimeModel),
    prompt,
    maxOutputTokens: 220,
  });

  const summary = trimSummary(text);
  return summary || existingSummary;
}
