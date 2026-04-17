'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { API_ROUTES } from '@/config/api';
import { MEMORY_CONFIG } from '@/config/memory';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const totalItems = memories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / MEMORY_CONFIG.SAVED_MEMORIES_PAGE_SIZE));
  const pagedMemories = useMemo(() => {
    const startIndex = (currentPage - 1) * MEMORY_CONFIG.SAVED_MEMORIES_PAGE_SIZE;
    const endIndex = startIndex + MEMORY_CONFIG.SAVED_MEMORIES_PAGE_SIZE;
    return memories.slice(startIndex, endIndex);
  }, [currentPage, memories]);

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

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch(API_ROUTES.memories, {
          method: 'GET',
          signal: controller.signal,
        });

        if (!response.ok) {
          toast.error(await getApiErrorToastMessage(response, t, 'memory_page.toast.load_failed'));
          return;
        }

        const data = (await response.json()) as {
          memories?: MemoryListItem[];
        };

        setMemories(data.memories ?? []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error(t('memory_page.toast.load_failed'));
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, t]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    currentPage,
    handleDeleteMemory,
    handleEditMemory,
    memories: pagedMemories,
    pendingDeleteId,
    pendingEditId,
    setPage: setCurrentPage,
    totalItems,
    totalPages,
  };
}
