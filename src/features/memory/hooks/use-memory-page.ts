'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { ConversationSummary } from '@/features/chat/storage/types';
import type { MemoryKind, MemoryListItem } from '@/features/memory/types';
import type { MemorySettings } from '@/features/models/types';

interface UseMemoryPageOptions {
  isAuthenticated: boolean;
  memories: MemoryListItem[];
  onMemorySettingsChange: (
    updater: (settings: MemorySettings) => MemorySettings
  ) => Promise<boolean> | void;
  settings: MemorySettings;
  summaries: ConversationSummary[];
  t: (key: string) => string;
}

export function useMemoryPage({
  isAuthenticated,
  memories,
  onMemorySettingsChange,
  settings,
  summaries,
  t,
}: UseMemoryPageOptions) {
  const [localMemories, setLocalMemories] = useState(memories);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setLocalMemories(memories);
  }, [memories]);

  const handleSettingsChange = async (updater: (settings: MemorySettings) => MemorySettings) => {
    setIsSavingSettings(true);
    try {
      const result = await onMemorySettingsChange(updater);
      if (result === false) {
        toast.error(t('memory_page.toast.settings_update_failed'));
        return false;
      }

      return true;
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!isAuthenticated) {
      return false;
    }

    setPendingDeleteId(memoryId);
    try {
      const response = await fetch('/api/memories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: memoryId }),
      });

      if (!response.ok) {
        toast.error(t('memory_page.toast.delete_failed'));
        return false;
      }

      setLocalMemories((current) => current.filter((memory) => memory.id !== memoryId));
      return true;
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleEditMemory = async (input: { content: string; id: string; kind: MemoryKind }) => {
    if (!isAuthenticated) {
      return false;
    }

    setPendingEditId(input.id);
    try {
      const response = await fetch('/api/memories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        toast.error(t('memory_page.toast.update_failed'));
        return false;
      }

      setLocalMemories((current) =>
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

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      memories: localMemories,
      settings,
      summaries,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'memory-export.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return {
    handleDeleteMemory,
    handleEditMemory,
    handleExport,
    handleSettingsChange,
    isSavingSettings,
    localMemories,
    pendingDeleteId,
    pendingEditId,
  };
}
