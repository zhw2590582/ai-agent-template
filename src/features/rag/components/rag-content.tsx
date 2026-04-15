'use client';

import { ExternalLinkIcon, PlugZapIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { RagConnectionSection } from '@/features/rag/components/rag-connection-section';
import { RagRetrievalSection } from '@/features/rag/components/rag-retrieval-section';
import { useRagSettings } from '@/features/rag/hooks/use-rag-settings';
import type { RagSettings } from '@/features/rag/types';

interface RagContentProps {
  onClose?: () => void;
  onRagSettingsChange: (updater: (settings: RagSettings) => RagSettings) => Promise<boolean> | void;
  settings: RagSettings;
}

export function RagContent({ onClose, onRagSettingsChange, settings }: RagContentProps) {
  const t = useTranslations();
  const {
    isApiKeyVisible,
    isDirty,
    isSaving,
    isTesting,
    localSettings,
    resetAndClose,
    runConnectionTest,
    save,
    setIsApiKeyVisible,
    showSaved,
    updateSettings,
  } = useRagSettings({
    onClose,
    onRagSettingsChange,
    saveFailedMessage: t('rag_page.toast.save_failed'),
    saveSuccessMessage: t('rag_page.toast.save_success'),
    settings,
    testFailedMessage: t('rag_page.toast.test_failed'),
    testSuccessMessage: (dimensions) => t('rag_page.toast.test_success', { dimensions }),
  });

  return (
    <WorkbenchDialogPanel
      bodyClassName="overflow-y-auto"
      footer={
        <>
          <Button className="min-w-24" type="button" variant="outline" onClick={resetAndClose}>
            {t('common.cancel')}
          </Button>
          <Button
            className="min-w-24"
            disabled={!isDirty || isSaving}
            type="button"
            onClick={() => void save()}
          >
            {isSaving ? <Spinner data-icon="inline-start" /> : null}
            {showSaved ? t('models_page.actions.saved') : t('common.save')}
          </Button>
        </>
      }
    >
      <div className="text-foreground mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <section className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">{t('rag_page.title')}</h2>
              <p className="text-muted-foreground max-w-2xl text-sm">{t('rag_page.description')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={!localSettings.apiKey.trim() || isTesting}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => void runConnectionTest()}
              >
                {!isTesting ? <PlugZapIcon data-icon="inline-start" /> : null}
                {isTesting ? <Spinner data-icon="inline-start" /> : null}
                {t('rag_page.test_connection')}
              </Button>
              <Button asChild size="sm" type="button" variant="outline">
                <a
                  href="https://docs.voyageai.com/docs/api-key-and-python-client"
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLinkIcon data-icon="inline-start" />
                  {t('rag_page.get_api_key')}
                </a>
              </Button>
            </div>
          </div>

          <RagConnectionSection
            isApiKeyVisible={isApiKeyVisible}
            settings={localSettings}
            onToggleApiKeyVisibility={() => setIsApiKeyVisible((current) => !current)}
            onUpdateSettings={updateSettings}
          />
          <RagRetrievalSection settings={localSettings} onUpdateSettings={updateSettings} />
        </section>
      </div>
    </WorkbenchDialogPanel>
  );
}
