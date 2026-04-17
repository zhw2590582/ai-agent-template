'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { API_ROUTES } from '@/config/api';
import { getApiErrorToastMessage } from '@/lib/api-client';
import {
  deleteLocalMemory,
  ensureLocalMemoriesLoaded,
  readLocalMemories,
  subscribeToLocalMemoryUpdates,
  updateLocalMemory,
} from '@/features/memory/storage/local-memories';
import type { MemoryKind, MemoryListItem } from '@/features/memory/types';

interface UseMemoryItemsSourceOptions {
  initialMemories: MemoryListItem[];
  isAuthenticated: boolean;
  t: (key: string) => string;
}

export function useMemoryItemsSource({
  initialMemories,
  isAuthenticated,
  t,
}: UseMemoryItemsSourceOptions) {
  const [memories, setMemories] = useState(initialMemories);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      void ensureLocalMemoriesLoaded().then(() => {
        setMemories(readLocalMemories());
      });

      return subscribeToLocalMemoryUpdates(() => {
        setMemories(readLocalMemories());
      });
    }

    setMemories(initialMemories);
  }, [initialMemories, isAuthenticated]);

  const handleDeleteMemory = async (memoryId: string) => {
    setPendingDeleteId(memoryId);
    try {
      if (!isAuthenticated) {
        const success = deleteLocalMemory(memoryId);
        if (await success) {
          setMemories(readLocalMemories());
        }

        return await success;
      }

      const response = await fetch(API_ROUTES.memories, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: memoryId }),
      });

      if (!response.ok) {
        toast.error(await getApiErrorToastMessage(response, t, 'memory_page.toast.delete_failed'));
        return false;
      }

      setMemories((current) => current.filter((memory) => memory.id !== memoryId));
      return true;
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleEditMemory = async (input: { content: string; id: string; kind: MemoryKind }) => {
    setPendingEditId(input.id);
    try {
      if (!isAuthenticated) {
        const success = updateLocalMemory(input);

        if (await success) {
          setMemories(readLocalMemories());
        }

        return await success;
      }

      const response = await fetch(API_ROUTES.memories, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        toast.error(await getApiErrorToastMessage(response, t, 'memory_page.toast.update_failed'));
        return false;
      }

      setMemories((current) =>
        current.map((memory) =>
          memory.id === input.id
            ? {
                ...memory,
                content: input.content,
                kind: input.kind,
                updatedAt: new Date().toISOString(),
              }
            : memory
        )
      );
      return true;
    } finally {
      setPendingEditId(null);
    }
  };

  return {
    handleDeleteMemory,
    handleEditMemory,
    memories,
    pendingDeleteId,
    pendingEditId,
  };
}
