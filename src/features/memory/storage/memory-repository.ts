import {
  isMemoryKind,
  type MemoryKind,
  type MemoryListItem,
  type MemoryRecord,
} from '@/features/memory/types';
import { normalizeMemoryContent } from '@/features/memory/storage/memory-utils';

export type MemoriesClient = {
  from: (table: 'memories') => unknown;
};

type MemoriesTable = {
  delete: () => {
    eq: (
      column: 'id',
      value: string
    ) => {
      eq: (column: 'user_id', value: string) => PromiseLike<{ error: unknown }>;
    };
  };
  insert: (
    values:
      | Pick<
          MemoryRecord,
          'content' | 'conversation_id' | 'kind' | 'metadata' | 'source' | 'status' | 'user_id'
        >[]
      | Pick<
          MemoryRecord,
          'content' | 'conversation_id' | 'kind' | 'metadata' | 'source' | 'status' | 'user_id'
        >
  ) => PromiseLike<{ error: unknown }>;
  select: (columns: string) => {
    eq: (
      column: 'user_id' | 'status',
      value: string
    ) => {
      eq: (
        column: 'status',
        value: string
      ) => {
        order: (
          column: 'updated_at',
          options: { ascending: boolean }
        ) => PromiseLike<{ data: MemoryRecord[] | null; error: unknown }>;
      };
      order: (
        column: 'updated_at',
        options: { ascending: boolean }
      ) => PromiseLike<{ data: MemoryRecord[] | null; error: unknown }>;
    };
  };
  update: (
    values: Partial<
      Pick<MemoryRecord, 'content' | 'conversation_id' | 'kind' | 'status' | 'updated_at'>
    >
  ) => {
    eq: (
      column: 'id',
      value: string
    ) => {
      eq: (column: 'user_id', value: string) => PromiseLike<{ error: unknown }>;
    };
  };
};

function getMemoriesTable(client: MemoriesClient) {
  return client.from('memories') as MemoriesTable;
}

export async function listMemoriesForUser(
  userId: string,
  client: MemoriesClient
): Promise<MemoryListItem[]> {
  const memories = getMemoriesTable(client);
  const { data, error } = await memories
    .select(
      'id, user_id, conversation_id, kind, content, source, status, metadata, created_at, updated_at'
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to load memories.');
  }

  return data.map((memory) => ({
    content: memory.content,
    conversationId: memory.conversation_id,
    id: memory.id,
    kind: isMemoryKind(memory.kind) ? memory.kind : 'fact',
    source: memory.source,
    updatedAt: memory.updated_at,
  }));
}

export async function insertMemories(
  input: {
    conversationId: string;
    items: Array<{ content: string; kind: MemoryKind }>;
    userId: string;
  },
  client: MemoriesClient
) {
  if (input.items.length === 0) {
    return;
  }

  const memories = getMemoriesTable(client);
  const { error } = await memories.insert(
    input.items.map((memory) => ({
      content: memory.content,
      conversation_id: input.conversationId,
      kind: memory.kind,
      metadata: {},
      source: 'auto',
      status: 'active',
      user_id: input.userId,
    }))
  );

  if (error) {
    throw error;
  }
}

export async function updateMemoryRecord(
  input: {
    content: string;
    conversationId: string;
    id: string;
    kind: MemoryKind;
    userId: string;
  },
  client: MemoriesClient
) {
  const memories = getMemoriesTable(client);
  const { error } = await memories
    .update({
      content: normalizeMemoryContent(input.content),
      conversation_id: input.conversationId,
      kind: input.kind,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('user_id', input.userId);

  if (error) {
    throw error;
  }
}

export async function deleteMemoryForUser(
  input: {
    id: string;
    userId: string;
  },
  client: MemoriesClient
) {
  const memories = getMemoriesTable(client);
  const { error } = await memories
    .update({ status: 'deleted' })
    .eq('id', input.id)
    .eq('user_id', input.userId);

  if (error) {
    throw error;
  }
}

export async function hardDeleteMemoryRecord(
  input: {
    id: string;
    userId: string;
  },
  client: MemoriesClient
) {
  const memories = getMemoriesTable(client);
  const { error } = await memories.delete().eq('id', input.id).eq('user_id', input.userId);

  if (error) {
    throw error;
  }
}

export async function updateMemoryForUser(
  input: {
    content: string;
    id: string;
    kind: MemoryKind;
    userId: string;
  },
  client: MemoriesClient
) {
  const memories = getMemoriesTable(client);

  const { error } = await memories
    .update({
      content: normalizeMemoryContent(input.content),
      updated_at: new Date().toISOString(),
      kind: input.kind,
    })
    .eq('id', input.id)
    .eq('user_id', input.userId);

  if (error) {
    throw error;
  }
}
