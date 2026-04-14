'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { ConversationSummary } from '@/features/chat/storage/types';
import type { MemoryKind, MemoryListItem } from '@/features/memory/types';
import type { MemorySettings } from '@/features/models/types';
import { getApiErrorToastMessage } from '@/lib/api-client';

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
  const [localSettings, setLocalSettings] = useState(settings);
  const [localSummaries, setLocalSummaries] = useState(summaries);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [pendingSummaryEditId, setPendingSummaryEditId] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingSummaryDeleteId, setPendingSummaryDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setLocalMemories(memories);
  }, [memories]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setLocalSummaries(summaries);
  }, [summaries]);

  const isSettingsDirty = useMemo(
    () => JSON.stringify(localSettings) !== JSON.stringify(settings),
    [localSettings, settings]
  );

  const updateDraftSettings = (updater: (settings: MemorySettings) => MemorySettings) => {
    setLocalSettings((current) => updater(current));
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const result = await onMemorySettingsChange(() => localSettings);
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
        toast.error(await getApiErrorToastMessage(response, t, 'memory_page.toast.delete_failed'));
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
        toast.error(await getApiErrorToastMessage(response, t, 'memory_page.toast.update_failed'));
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
      settings: localSettings,
      summaries: localSummaries,
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

  const handleDeleteSummary = async (conversationId: string) => {
    if (!isAuthenticated) {
      return false;
    }

    setPendingSummaryDeleteId(conversationId);
    try {
      const response = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId, summary: null }),
      });

      if (!response.ok) {
        toast.error(
          await getApiErrorToastMessage(response, t, 'memory_page.toast.summary_delete_failed')
        );
        return false;
      }

      setLocalSummaries((current) =>
        current.map((summary) =>
          summary.id === conversationId
            ? {
                ...summary,
                summary: null,
              }
            : summary
        )
      );
      return true;
    } finally {
      setPendingSummaryDeleteId(null);
    }
  };

  const handleEditSummary = async (input: { conversationId: string; summary: string }) => {
    if (!isAuthenticated) {
      return false;
    }

    setPendingSummaryEditId(input.conversationId);
    try {
      const response = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: input.conversationId,
          summary: input.summary.trim(),
        }),
      });

      if (!response.ok) {
        toast.error(
          await getApiErrorToastMessage(response, t, 'memory_page.toast.summary_update_failed')
        );
        return false;
      }

      setLocalSummaries((current) =>
        current.map((summary) =>
          summary.id === input.conversationId
            ? {
                ...summary,
                summary: input.summary.trim(),
              }
            : summary
        )
      );
      return true;
    } finally {
      setPendingSummaryEditId(null);
    }
  };

  return {
    handleDeleteSummary,
    handleDeleteMemory,
    handleEditSummary,
    handleEditMemory,
    handleExport,
    isSavingSettings,
    isSettingsDirty,
    localMemories,
    localSettings,
    localSummaries,
    pendingDeleteId,
    pendingEditId,
    pendingSummaryDeleteId,
    pendingSummaryEditId,
    resetDraftSettings: () => setLocalSettings(settings),
    saveSettings,
    updateDraftSettings,
  };
}
