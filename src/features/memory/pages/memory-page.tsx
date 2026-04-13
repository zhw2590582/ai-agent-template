'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Separator } from '@/components/ui/separator';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { MemoryControls } from '@/features/memory/components/memory-controls';
import { MemoryList } from '@/features/memory/components/memory-list';
import { MemorySummaryList } from '@/features/memory/components/memory-summary-list';
import type { MemoryListItem } from '@/features/memory/types';
import type { MemorySettings } from '@/features/models/types';

interface MemoryPageProps {
  isAuthenticated: boolean;
  memories: MemoryListItem[];
  onMemorySettingsChange: (
    updater: (settings: MemorySettings) => MemorySettings
  ) => Promise<boolean> | void;
  settings: MemorySettings;
  summaries: ConversationSummary[];
}

export function MemoryPage({
  isAuthenticated,
  memories,
  onMemorySettingsChange,
  settings,
  summaries,
}: MemoryPageProps) {
  const t = useTranslations();
  const [localMemories, setLocalMemories] = useState(memories);
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

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <MemoryControls
          isAuthenticated={isAuthenticated}
          isSaving={isSavingSettings}
          onSettingsChange={handleSettingsChange}
          settings={settings}
          t={t}
        />
        <Separator />
        <MemoryList
          memories={localMemories}
          onDeleteMemory={handleDeleteMemory}
          pendingDeleteId={pendingDeleteId}
          t={t}
        />
        <Separator />
        <MemorySummaryList summaries={summaries} t={t} />
      </div>
    </div>
  );
}
