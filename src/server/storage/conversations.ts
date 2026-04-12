import type { UIMessage } from 'ai';

import { generateConversationTitle } from '@/server/ai/title';
import type {
  ConversationAnalysis,
  ConversationRecord,
  ConversationSummary,
} from '@/server/storage/types';

function getMessageText(message: UIMessage) {
  return message.parts
    .filter(
      (part): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text'
    )
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function truncateText(value: string | null, maxLength = 120) {
  if (!value) {
    return null;
  }

  return value.length > maxLength ? `${value.slice(0, maxLength).trimEnd()}…` : value;
}

export function buildConversationTitleFromText(text: string) {
  return truncateText(text.trim(), 60) ?? 'New chat';
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
    id: record.id,
    lastMessageAt: record.last_message_at,
    preview: null,
    title: record.title,
  };
}

export async function createConversation(
  input: {
    initialMessage: string;
    userId: string;
  },
  client: {
    from: (table: 'conversations') => any;
  }
) {
  const now = new Date().toISOString();
  const title = buildConversationTitleFromText(input.initialMessage);

  const { data, error } = await client
    .from('conversations')
    .insert({
      analysis: {
        first_user_message: truncateText(input.initialMessage),
        last_message_preview: truncateText(input.initialMessage),
        message_count: 0,
        title_generated: false,
        updated_from: 'create',
      },
      last_message_at: now,
      title,
      user_id: input.userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getConversationById(
  id: string,
  client: {
    from: (table: 'conversations') => any;
  }
) {
  const { data, error } = await client
    .from('conversations')
    .select('id, user_id, title, messages, analysis, last_message_at, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function listConversationsForUser(
  userId: string,
  client: {
    from: (table: 'conversations') => any;
  }
) {
  const { data, error } = await client
    .from('conversations')
    .select('id, user_id, title, messages, analysis, last_message_at, created_at, updated_at')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function saveConversationMessages(
  input: {
    conversationId: string;
    messages: UIMessage[];
  },
  client: {
    from: (table: 'conversations') => any;
  }
) {
  const existingConversation = await getConversationById(input.conversationId, client);
  const analysis = buildConversationAnalysis(input.messages);
  analysis.title_generated = existingConversation?.analysis?.title_generated ?? false;
  let title =
    existingConversation?.title ??
    (analysis.first_user_message != null
      ? buildConversationTitleFromText(analysis.first_user_message)
      : 'New chat');

  if (!analysis.title_generated && analysis.first_user_message) {
    try {
      const generatedTitle = await generateConversationTitle(analysis.first_user_message);
      if (generatedTitle) {
        title = generatedTitle;
        analysis.title_generated = true;
      }
    } catch {
      analysis.title_generated = false;
    }
  }

  const { error } = await client
    .from('conversations')
    .update({
      analysis,
      last_message_at: new Date().toISOString(),
      messages: input.messages,
      title,
    })
    .eq('id', input.conversationId);

  if (error) {
    throw error;
  }
}
