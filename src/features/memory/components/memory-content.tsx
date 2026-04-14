'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { MemoryControls } from '@/features/memory/components/memory-controls';
import { MemoryList } from '@/features/memory/components/memory-list';
import { MemorySummaryList } from '@/features/memory/components/memory-summary-list';
import { useMemoryPage } from '@/features/memory/hooks/use-memory-page';
import type { MemoryListItem } from '@/features/memory/types';
import type { MemorySettings } from '@/features/models/types';

interface MemoryContentProps {
  isAuthenticated: boolean;
  locale: string;
  memories: MemoryListItem[];
  onClose?: () => void;
  onMemorySettingsChange: (
    updater: (settings: MemorySettings) => MemorySettings
  ) => Promise<boolean> | void;
  settings: MemorySettings;
  summaries: ConversationSummary[];
}

export function MemoryContent({
  isAuthenticated,
  locale,
  memories,
  onClose,
  onMemorySettingsChange,
  settings,
  summaries,
}: MemoryContentProps) {
  const t = useTranslations();
  const [showSaved, setShowSaved] = useState(false);
  const {
    handleDeleteMemory,
    handleEditMemory,
    handleExport,
    isSavingSettings,
    isSettingsDirty,
    localMemories,
    localSettings,
    pendingDeleteId,
    pendingEditId,
    resetDraftSettings,
    saveSettings,
    updateDraftSettings,
  } = useMemoryPage({
    isAuthenticated,
    memories,
    onMemorySettingsChange,
    settings,
    summaries,
    t,
  });

  useEffect(() => {
    if (!showSaved) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSaved(false);
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [showSaved]);

  return (
    <WorkbenchDialogPanel
      bodyClassName="overflow-y-auto"
      footer={
        <>
          <Button
            className="min-w-24"
            type="button"
            variant="outline"
            onClick={() => {
              resetDraftSettings();
              onClose?.();
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="min-w-24"
            disabled={!isSettingsDirty || isSavingSettings}
            type="button"
            onClick={async () => {
              const success = await saveSettings();
              if (!success) {
                return;
              }
              setShowSaved(true);
            }}
          >
            {isSavingSettings ? <Spinner data-icon="inline-start" /> : null}
            {showSaved ? t('models_page.actions.saved') : t('common.save')}
          </Button>
        </>
      }
    >
      <div className="text-foreground mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <MemoryControls
          isAuthenticated={isAuthenticated}
          key={`${localSettings.summaryMinMessages}-${localSettings.recentMessageWindow}-${localSettings.contextMaxItems}`}
          onExport={handleExport}
          onSettingsChange={updateDraftSettings}
          settings={localSettings}
          t={t}
        />
        <Separator />
        <MemoryList
          locale={locale}
          memories={localMemories}
          onDeleteMemory={handleDeleteMemory}
          onEditMemory={handleEditMemory}
          pendingDeleteId={pendingDeleteId}
          pendingEditId={pendingEditId}
          t={t}
        />
        <Separator />
        <MemorySummaryList locale={locale} summaries={summaries} t={t} />
      </div>
    </WorkbenchDialogPanel>
  );
}
