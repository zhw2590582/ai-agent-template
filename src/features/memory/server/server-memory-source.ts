import type { Locale } from '@/config/i18n';
import { buildMemoryContext } from '@/features/memory/storage/memory-retrieval';
import { consolidateMemoryKind } from '@/features/memory/storage/memory-consolidation';
import { extractConversationMemories } from '@/features/memory/storage/memory-extraction';
import {
  deleteMemoryForUser,
  listMemoriesForUser,
  saveConversationMemories,
  updateMemoryForUser,
} from '@/features/memory/storage/memories';
import type { MemoriesClient } from '@/features/memory/storage/memory-repository';
import type { ChatRuntimeModel } from '@/features/models/types';
import type { MemoryKind, MemoryListItem } from '@/features/memory/types';
import type { MemorySettings } from '@/features/settings/types';
import type { UIMessage } from 'ai';

export async function listPersistedMemoriesForUser(options: {
  client: MemoriesClient;
  userId: string;
}) {
  return listMemoriesForUser(options.userId, options.client);
}

export async function buildPersistedMemoryContextForUser(options: {
  client: MemoriesClient;
  memorySettings: Partial<MemorySettings>;
  userId: string;
}) {
  const memories = await listPersistedMemoriesForUser({
    client: options.client,
    userId: options.userId,
  });

  return buildMemoryContext(memories, {
    memorySettings: options.memorySettings,
  });
}

export async function updatePersistedMemoryForUser(options: {
  client: MemoriesClient;
  content: string;
  id: string;
  kind: MemoryKind;
  userId: string;
}) {
  return updateMemoryForUser(
    {
      content: options.content,
      id: options.id,
      kind: options.kind,
      userId: options.userId,
    },
    options.client
  );
}

export async function deletePersistedMemoryForUser(options: {
  client: MemoriesClient;
  id: string;
  userId: string;
}) {
  return deleteMemoryForUser(
    {
      id: options.id,
      userId: options.userId,
    },
    options.client
  );
}

export async function savePersistedConversationMemories(options: {
  client: MemoriesClient;
  conversationId: string;
  locale: Locale;
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
  userId: string;
}) {
  return saveConversationMemories(
    {
      conversationId: options.conversationId,
      locale: options.locale,
      messages: options.messages,
      runtimeModel: options.runtimeModel,
      userId: options.userId,
    },
    options.client
  );
}

export async function extractRequestMemories(options: {
  locale: Locale;
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
}) {
  return extractConversationMemories(options.messages, {
    locale: options.locale,
    runtimeModel: options.runtimeModel,
  });
}

export async function consolidateRequestMemories(options: {
  kind: MemoryKind;
  locale: Locale;
  memories: MemoryListItem[];
  runtimeModel?: ChatRuntimeModel | null;
}) {
  return consolidateMemoryKind(options.memories, {
    kind: options.kind,
    locale: options.locale,
    runtimeModel: options.runtimeModel,
  });
}
