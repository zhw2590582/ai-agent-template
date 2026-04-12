import type { UIMessage } from 'ai';

import { generateConversationTitle } from '@/server/ai/title';
import type {
  ConversationAnalysis,
  ConversationRecord,
  ConversationSummary,
} from '@/server/storage/types';

type SingleConversationResult = PromiseLike<{
  data: ConversationRecord | null;
  error: unknown;
}>;

type MultipleConversationsResult = PromiseLike<{
  data: ConversationRecord[] | null;
  error: unknown;
}>;

type ConversationSelectQuery = {
  eq: {
    (
      column: 'id',
      value: string
    ): {
      single: () => SingleConversationResult;
    };
    (
      column: 'user_id',
      value: string
    ): {
      order: (
        column: 'last_message_at',
        options: { ascending: boolean }
      ) => MultipleConversationsResult;
    };
  };
};

type ConversationsClient = {
  from: (table: 'conversations') => unknown;
};

type ConversationsTable = {
  insert: (
    values: Pick<ConversationRecord, 'analysis' | 'last_message_at' | 'title' | 'user_id'>
  ) => {
    select: () => {
      single: () => SingleConversationResult;
    };
  };
  select: (columns: string) => ConversationSelectQuery;
  update: (
    values: Pick<ConversationRecord, 'analysis' | 'last_message_at' | 'messages' | 'title'>
  ) => {
    eq: (column: 'id', value: string) => PromiseLike<{ error: unknown }>;
  };
};

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
    preview: record.analysis?.last_message_preview ?? null,
    title: record.title,
  };
}

export async function createConversation(
  input: {
    initialMessage: string;
    userId: string;
  },
  client: ConversationsClient
) {
  const conversations = client.from('conversations') as ConversationsTable;
  const now = new Date().toISOString();
  const title = buildConversationTitleFromText(input.initialMessage);

  const { data, error } = await conversations
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

export async function getConversationById(id: string, client: ConversationsClient) {
  const conversations = client.from('conversations') as ConversationsTable;

  const { data, error } = await conversations
    .select('id, user_id, title, messages, analysis, last_message_at, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Verify conversation belongs to a specific user. Throws if not found or unauthorized.
 */
export async function verifyConversationOwnership(
  conversationId: string,
  userId: string,
  client: ConversationsClient
): Promise<ConversationRecord> {
  const conversation = await getConversationById(conversationId, client);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (conversation.user_id !== userId) {
    throw new Error('Unauthorized: conversation does not belong to user');
  }

  return conversation;
}

export async function listConversationsForUser(userId: string, client: ConversationsClient) {
  const conversations = client.from('conversations') as ConversationsTable;

  const { data, error } = await conversations
    .select('id, user_id, title, messages, analysis, last_message_at, created_at, updated_at')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

const conversationListColumns =
  'id, user_id, title, messages, analysis, last_message_at, created_at, updated_at';

type RangeableListQuery = {
  range: (
    from: number,
    to: number
  ) => Promise<{ data: ConversationRecord[] | null; error: unknown }>;
};

/**
 * One page of conversations for the sidebar (newest first). `hasMore` is true when the page is full.
 */
export async function listConversationsForUserPage(
  userId: string,
  client: ConversationsClient,
  options: { limit: number; offset: number }
): Promise<{ rows: ConversationRecord[]; hasMore: boolean }> {
  const conversations = client.from('conversations') as ConversationsTable;
  const limit = Math.min(50, Math.max(1, options.limit));
  const offset = Math.max(0, options.offset);
  const to = offset + limit - 1;

  const ordered = conversations
    .select(conversationListColumns)
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false }) as unknown as RangeableListQuery;

  const { data, error } = await ordered.range(offset, to);

  if (error || !data) {
    return { hasMore: false, rows: [] };
  }

  return {
    hasMore: data.length === limit,
    rows: data,
  };
}

export async function saveConversationMessages(
  input: {
    conversationId: string;
    messages: UIMessage[];
    userId: string;
  },
  client: ConversationsClient
) {
  const conversations = client.from('conversations') as ConversationsTable;
  const existingConversation = await verifyConversationOwnership(
    input.conversationId,
    input.userId,
    client
  );
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

  const { error } = await conversations
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
