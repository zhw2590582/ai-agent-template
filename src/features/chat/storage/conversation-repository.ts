import type { ConversationRecord } from '@/features/chat/storage/types';

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

export type ConversationsClient = {
  from: (table: 'conversations') => unknown;
};

export type ConversationsTable = {
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
  delete: () => {
    eq: (column: 'id', value: string) => PromiseLike<{ error: unknown }>;
  };
};

type RangeableListQuery = {
  range: (
    from: number,
    to: number
  ) => Promise<{ data: ConversationRecord[] | null; error: unknown }>;
};

export const conversationListColumns =
  'id, user_id, title, messages, analysis, last_message_at, created_at, updated_at';

export function getConversationsTable(client: ConversationsClient) {
  return client.from('conversations') as ConversationsTable;
}

export async function getConversationById(id: string, client: ConversationsClient) {
  const conversations = getConversationsTable(client);

  const { data, error } = await conversations.select(conversationListColumns).eq('id', id).single();

  if (error) {
    return null;
  }

  return data;
}

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
  const conversations = getConversationsTable(client);

  const { data, error } = await conversations
    .select(conversationListColumns)
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function listConversationsForUserPage(
  userId: string,
  client: ConversationsClient,
  options: { limit: number; offset: number }
): Promise<{ rows: ConversationRecord[]; hasMore: boolean }> {
  const conversations = getConversationsTable(client);
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

export async function listConversationsForUserSearchPage(
  userId: string,
  client: ConversationsClient,
  options: { limit: number; offset: number; query: string }
): Promise<{ rows: ConversationRecord[]; hasMore: boolean }> {
  const conversations = getConversationsTable(client);
  const limit = Math.min(50, Math.max(1, options.limit));
  const offset = Math.max(0, options.offset);
  const to = offset + limit - 1;

  const base = conversations.select(conversationListColumns) as unknown as {
    eq: (
      column: 'user_id',
      value: string
    ) => {
      ilike: (
        column: 'title',
        pattern: string
      ) => {
        order: (column: 'last_message_at', options: { ascending: boolean }) => RangeableListQuery;
      };
    };
  };

  const filtered = base
    .eq('user_id', userId)
    .ilike('title', `%${options.query}%`)
    .order('last_message_at', { ascending: false });

  const { data, error } = await filtered.range(offset, to);

  if (error || !data) {
    return { hasMore: false, rows: [] };
  }

  return {
    hasMore: data.length === limit,
    rows: data,
  };
}
