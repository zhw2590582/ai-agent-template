'use client';

import { useTranslations } from 'next-intl';

import { Separator } from '@/components/ui/separator';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { MemoryControls } from '@/features/memory/components/memory-controls';
import { MemoryList } from '@/features/memory/components/memory-list';
import { MemorySummaryList } from '@/features/memory/components/memory-summary-list';
import { useMemoryPage } from '@/features/memory/hooks/use-memory-page';
import type { MemoryListItem } from '@/features/memory/types';
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
  const {
    handleDeleteMemory,
    handleEditMemory,
    handleExport,
    handleSettingsChange,
    isSavingSettings,
    localMemories,
    pendingDeleteId,
    pendingEditId,
  } = useMemoryPage({
    isAuthenticated,
    memories,
    onMemorySettingsChange,
    settings,
    summaries,
    t,
  });

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
