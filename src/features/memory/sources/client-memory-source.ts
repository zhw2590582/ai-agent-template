'use client';

import { API_ROUTES } from '@/config/api';
import type { Locale } from '@/config/i18n';
import {
  deleteLocalMemory,
  ensureLocalMemoriesLoaded,
  extractAndMergeLocalMemories,
  readLocalMemories,
  subscribeToLocalMemoryUpdates,
  updateLocalMemory,
} from '@/features/memory/storage/local-memories';
import { buildMemoryContext } from '@/features/memory/storage/memory-retrieval';
import type { ChatRuntimeModel } from '@/features/models/types';
import type { MemorySettings } from '@/features/settings/types';
import type { MemoryKind, MemoryListItem } from '@/features/memory/types';
import type { UIMessage } from 'ai';

interface LoadMemorySourceOptions {
  signal?: AbortSignal;
}

interface SyncConversationMemoriesInput {
  conversationId: string;
  locale: Locale;
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
}

export interface ClientMemorySource {
  buildContext: (options: { memorySettings: MemorySettings }) => Promise<string | null>;
  deleteMemory: (memoryId: string) => Promise<MemoryListItem[]>;
  load: (options?: LoadMemorySourceOptions) => Promise<MemoryListItem[]>;
  read: () => MemoryListItem[];
  subscribe: (onChange: () => void) => () => void;
  syncConversationMemories: (input: SyncConversationMemoriesInput) => Promise<MemoryListItem[]>;
  updateMemory: (input: {
    content: string;
    id: string;
    kind: MemoryKind;
  }) => Promise<MemoryListItem[]>;
}

function createLocalClientMemorySource(): ClientMemorySource {
  return {
    buildContext: async ({ memorySettings }) => {
      await ensureLocalMemoriesLoaded();
      return buildMemoryContext(readLocalMemories(), { memorySettings });
    },
    deleteMemory: async (memoryId) => {
      await deleteLocalMemory(memoryId);
      return readLocalMemories();
    },
    load: async () => {
      await ensureLocalMemoriesLoaded();
      return readLocalMemories();
    },
    read: () => readLocalMemories(),
    subscribe: (onChange) => subscribeToLocalMemoryUpdates(onChange),
    syncConversationMemories: async (input) =>
      extractAndMergeLocalMemories({
        conversationId: input.conversationId,
        locale: input.locale,
        messages: input.messages,
        runtimeModel: input.runtimeModel,
      }),
    updateMemory: async (input) => {
      await updateLocalMemory(input);
      return readLocalMemories();
    },
  };
}

function createRemoteClientMemorySource(): ClientMemorySource {
  const loadRemoteMemories = async (options?: LoadMemorySourceOptions) => {
    const response = await fetch(API_ROUTES.memories, {
      method: 'GET',
      signal: options?.signal,
    });

    if (!response.ok) {
      throw response;
    }

    const data = (await response.json()) as {
      memories?: MemoryListItem[];
    };

    return data.memories ?? [];
  };

  return {
    buildContext: async ({ memorySettings }) => {
      const memories = await loadRemoteMemories();
      return buildMemoryContext(memories, { memorySettings });
    },
    deleteMemory: async (memoryId) => {
      const response = await fetch(API_ROUTES.memories, {
        body: JSON.stringify({ id: memoryId }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      });

      if (!response.ok) {
        throw response;
      }

      return loadRemoteMemories();
    },
    load: loadRemoteMemories,
    read: () => [],
    subscribe: () => () => {},
    syncConversationMemories: async () => loadRemoteMemories(),
    updateMemory: async (input) => {
      const response = await fetch(API_ROUTES.memories, {
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      });

      if (!response.ok) {
        throw response;
      }

      return loadRemoteMemories();
    },
  };
}

export function createClientMemorySource(options: {
  isAuthenticated: boolean;
}): ClientMemorySource {
  return options.isAuthenticated
    ? createRemoteClientMemorySource()
    : createLocalClientMemorySource();
}
