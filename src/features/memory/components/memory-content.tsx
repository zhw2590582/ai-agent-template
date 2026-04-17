'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { CHAT_UI_CONFIG } from '@/config/chat';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { MemoryControls } from '@/features/memory/components/memory-controls';
import { MemoryList } from '@/features/memory/components/memory-list';
import { MemorySummaryList } from '@/features/memory/components/memory-summary-list';
import { useMemoryPage } from '@/features/memory/hooks/use-memory-page';
import type { MemoryListItem } from '@/features/memory/types';
import type { MemorySettings } from '@/features/auth/profile/types';

interface MemoryContentProps {
  isAuthenticated: boolean;
  locale: string;
  memories: MemoryListItem[];
  onClose?: () => void;
  onMemorySettingsChange: (
    updater: (settings: MemorySettings) => MemorySettings
  ) => Promise<boolean> | void;
  settings: MemorySettings;
}

export function MemoryContent({
  isAuthenticated,
  locale,
  memories,
  onClose,
  onMemorySettingsChange,
  settings,
}: MemoryContentProps) {
  const t = useTranslations();
  const [showSaved, setShowSaved] = useState(false);
  const handleSummaryLoadError = useCallback(() => {
    toast.error(t('memory_page.toast.summary_load_failed'));
  }, [t]);
  const {
    currentPage,
    handleDeleteMemory,
    handleDeleteSummary,
    handleEditMemory,
    handleEditSummary,
    handleExport,
    isSavingSettings,
    isSettingsDirty,
    isLoading,
    localMemories,
    localSettings,
    localSummaries,
    pendingDeleteId,
    pendingEditId,
    pendingSummaryDeleteId,
    pendingSummaryEditId,
    resetDraftSettings,
    saveSettings,
    setPage,
    totalItems,
    totalPages,
    updateDraftSettings,
  } = useMemoryPage({
    isAuthenticated,
    memories,
    onSummaryLoadError: handleSummaryLoadError,
    onMemorySettingsChange,
    settings,
    t,
  });

  useEffect(() => {
    if (!showSaved) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSaved(false);
    }, CHAT_UI_CONFIG.SAVE_FEEDBACK_DURATION_MS);

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
              toast.success(t('memory_page.toast.settings_update_success'));
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
        <MemorySummaryList
          currentPage={currentPage}
          isLoading={isLoading}
          locale={locale}
          onDeleteSummary={handleDeleteSummary}
          onEditSummary={handleEditSummary}
          onPageChange={setPage}
          pendingDeleteId={pendingSummaryDeleteId}
          pendingEditId={pendingSummaryEditId}
          summaries={localSummaries}
          t={t}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      </div>
    </WorkbenchDialogPanel>
  );
}
