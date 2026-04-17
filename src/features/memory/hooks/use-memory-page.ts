'use client';

import type { MemorySettings } from '@/features/auth/profile/types';
import type { MemoryListItem } from '@/features/memory/types';
import { useConversationSummarySource } from '@/features/memory/hooks/use-conversation-summary-source';
import { useMemoryItemsSource } from '@/features/memory/hooks/use-memory-items-source';
import { useMemorySettingsDraft } from '@/features/memory/hooks/use-memory-settings-draft';

interface UseMemoryPageOptions {
  isAuthenticated: boolean;
  memories: MemoryListItem[];
  onSummaryLoadError?: () => void;
  onMemorySettingsChange: (
    updater: (settings: MemorySettings) => MemorySettings
  ) => Promise<boolean> | void;
  settings: MemorySettings;
  t: (key: string) => string;
}

export function useMemoryPage({
  isAuthenticated,
  memories,
  onSummaryLoadError,
  onMemorySettingsChange,
  settings,
  t,
}: UseMemoryPageOptions) {
  const settingsDraft = useMemorySettingsDraft({
    onMemorySettingsChange,
    settings,
    t,
  });
  const memoryItemsSource = useMemoryItemsSource({
    initialMemories: memories,
    isAuthenticated,
    t,
  });
  const summarySource = useConversationSummarySource({
    isAuthenticated,
    onLoadError: onSummaryLoadError,
    t,
  });

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      memories: memoryItemsSource.memories,
      settings: settingsDraft.localSettings,
      summaries: summarySource.summaries,
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
    handleExport,
    ...settingsDraft,
    currentPage: summarySource.currentPage,
    handleDeleteMemory: memoryItemsSource.handleDeleteMemory,
    handleDeleteSummary: summarySource.handleDeleteSummary,
    handleEditMemory: memoryItemsSource.handleEditMemory,
    handleEditSummary: summarySource.handleEditSummary,
    isLoading: summarySource.isLoading,
    localMemories: memoryItemsSource.memories,
    localSummaries: summarySource.summaries,
    pendingDeleteId: memoryItemsSource.pendingDeleteId,
    pendingEditId: memoryItemsSource.pendingEditId,
    pendingSummaryDeleteId: summarySource.pendingDeleteId,
    pendingSummaryEditId: summarySource.pendingEditId,
    refresh: summarySource.refresh,
    setPage: summarySource.setPage,
    totalItems: summarySource.totalItems,
    totalPages: summarySource.totalPages,
  };
}
