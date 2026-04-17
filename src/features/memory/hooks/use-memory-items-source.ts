'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { MEMORY_CONFIG } from '@/config/memory';
import { getApiErrorToastMessage } from '@/lib/api-client';
import { createClientMemorySource } from '@/features/memory/sources/client-memory-source';
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
  const memorySource = useMemo(
    () => createClientMemorySource({ isAuthenticated }),
    [isAuthenticated]
  );
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
    setMemories(initialMemories);
    const controller = new AbortController();
    let isActive = true;

    void (async () => {
      try {
        const nextMemories = await memorySource.load({
          signal: controller.signal,
        });

        if (isActive) {
          setMemories(nextMemories);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }

        if (error instanceof Response) {
          toast.error(await getApiErrorToastMessage(error, t, 'memory_page.toast.load_failed'));
          return;
        }

        if (isAuthenticated) {
          toast.error(t('memory_page.toast.load_failed'));
        }
      }
    })();

    const unsubscribe = memorySource.subscribe(() => {
      setMemories(memorySource.read());
    });

    return () => {
      isActive = false;
      unsubscribe();
      controller.abort();
    };
  }, [initialMemories, isAuthenticated, memorySource, t]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDeleteMemory = async (memoryId: string) => {
    setPendingDeleteId(memoryId);
    try {
      const nextMemories = await memorySource.deleteMemory(memoryId);
      setMemories(nextMemories);
      return true;
    } catch (error) {
      if (error instanceof Response) {
        toast.error(await getApiErrorToastMessage(error, t, 'memory_page.toast.delete_failed'));
        return false;
      }

      toast.error(t('memory_page.toast.delete_failed'));
      return false;
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleEditMemory = async (input: { content: string; id: string; kind: MemoryKind }) => {
    setPendingEditId(input.id);
    try {
      const nextMemories = await memorySource.updateMemory(input);
      setMemories(nextMemories);
      return true;
    } catch (error) {
      if (error instanceof Response) {
        toast.error(await getApiErrorToastMessage(error, t, 'memory_page.toast.update_failed'));
        return false;
      }

      toast.error(t('memory_page.toast.update_failed'));
      return false;
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
