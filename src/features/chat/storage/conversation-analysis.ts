import type { UIMessage } from 'ai';
import { TEXT_LIMITS } from '@/config/limits';
import { CHAT_STRINGS } from '@/config/strings';

import type {
  ConversationAnalysis,
  ConversationRecord,
  ConversationSummary,
} from '@/features/chat/storage/types';

export function getMessageText(message: UIMessage) {
  return message.parts
    .filter(
      (part): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text'
    )
    .map((part) => part.text)
    .join('\n')
    .trim();
}

export function truncateText(
  value: string | null,
  maxLength: number = TEXT_LIMITS.CONVERSATION_PREVIEW
) {
  if (!value) {
    return null;
  }

  return value.length > maxLength ? `${value.slice(0, maxLength).trimEnd()}…` : value;
}

export function buildConversationTitleFromText(text: string) {
  return (
    truncateText(text.trim(), TEXT_LIMITS.GENERATED_TITLE) ??
    CHAT_STRINGS.DEFAULT_CONVERSATION_TITLE
  );
}

export function buildConversationAnalysis(messages: UIMessage[]): ConversationAnalysis {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  const lastMessage = messages[messages.length - 1];

  return {
    first_user_message: truncateText(firstUserMessage ? getMessageText(firstUserMessage) : null),
    last_message_preview: truncateText(lastMessage ? getMessageText(lastMessage) : null),
    message_count: messages.length,
    title_generated: false,
    updated_from: 'chat-finish',
  };
}

export function mapConversationSummary(record: ConversationRecord): ConversationSummary {
  return {
    createdAt: record.created_at,
    id: record.id,
    lastMessageAt: record.last_message_at,
    preview: record.analysis?.last_message_preview ?? null,
    summary: record.summary ?? null,
    title: record.title,
  };
}
