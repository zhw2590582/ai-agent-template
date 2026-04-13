'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Separator } from '@/components/ui/separator';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { MemoryControls } from '@/features/memory/components/memory-controls';
import { MemoryList } from '@/features/memory/components/memory-list';
import { MemorySummaryList } from '@/features/memory/components/memory-summary-list';
import type { MemoryKind, MemoryListItem } from '@/features/memory/types';
import type { MemorySettings } from '@/features/models/types';

interface MemoryPageProps {
  isAuthenticated: boolean;
  locale: string;
  memories: MemoryListItem[];
  onMemorySettingsChange: (
    updater: (settings: MemorySettings) => MemorySettings
  ) => Promise<boolean> | void;
  settings: MemorySettings;
  summaries: ConversationSummary[];
}

export function MemoryPage({
  isAuthenticated,
  locale,
  memories,
  onMemorySettingsChange,
  settings,
  summaries,
}: MemoryPageProps) {
  const t = useTranslations();
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

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <MemoryControls
          isAuthenticated={isAuthenticated}
          onExport={handleExport}
          isSaving={isSavingSettings}
          onSettingsChange={handleSettingsChange}
          settings={settings}
          t={t}
          key={`${settings.summaryMinMessages}-${settings.recentMessageWindow}-${settings.contextMaxItems}`}
        />
        <Separator />
        <MemoryList
          locale={locale}
          memories={localMemories}
          onEditMemory={handleEditMemory}
          onDeleteMemory={handleDeleteMemory}
          pendingEditId={pendingEditId}
          pendingDeleteId={pendingDeleteId}
          t={t}
        />
        <Separator />
        <MemorySummaryList locale={locale} summaries={summaries} t={t} />
      </div>
    </div>
  );
}
