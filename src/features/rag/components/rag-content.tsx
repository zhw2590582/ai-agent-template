'use client';

import { useState } from 'react';
import { ExternalLinkIcon, PlugZapIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { RagConnectionSection } from '@/features/rag/components/rag-connection-section';
import { RagDocumentList } from '@/features/rag/components/rag-document-list';
import { RagImportSection } from '@/features/rag/components/rag-import-section';
import { useRagDocuments } from '@/features/rag/hooks/use-rag-documents';
import { useRagSettings } from '@/features/rag/hooks/use-rag-settings';
import type { RagSettings } from '@/features/rag/types';

interface RagContentProps {
  onClose?: () => void;
  onRagSettingsChange: (updater: (settings: RagSettings) => RagSettings) => Promise<boolean> | void;
  settings: RagSettings;
}

export function RagContent({ onClose, onRagSettingsChange, settings }: RagContentProps) {
  const t = useTranslations();
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
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
  const {
    deleteDocument,
    documents,
    importDocument,
    isDeletingId,
    isImporting,
    isLoading,
    isReindexingId,
    reindexDocument,
  } = useRagDocuments({
    deleteFailedMessage: t('rag_page.toast.delete_failed'),
    deleteSuccessMessage: t('rag_page.toast.delete_success'),
    enabled: isDocumentsOpen,
    importFailedMessage: t('rag_page.toast.import_failed'),
    importSuccessMessage: (count) => t('rag_page.toast.import_success', { count }),
    loadFailedMessage: t('rag_page.toast.load_failed'),
    reindexFailedMessage: t('rag_page.toast.reindex_failed'),
    reindexSuccessMessage: (count) => t('rag_page.toast.reindex_success', { count }),
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
          <div className="flex items-center justify-end gap-2">
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
                  href="https://docs.voyageai.com/docs/api-key-and-installation"
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
          <RagImportSection
            apiKey={localSettings.apiKey}
            isImporting={isImporting}
            onImport={importDocument}
            provider={localSettings.provider}
          />
          <RagDocumentList
            apiKey={localSettings.apiKey}
            documents={documents}
            isDeletingId={isDeletingId}
            isLoading={isLoading}
            isReindexingId={isReindexingId}
            open={isDocumentsOpen}
            onOpenChange={setIsDocumentsOpen}
            onDelete={deleteDocument}
            onReindex={reindexDocument}
            provider={localSettings.provider}
          />
        </section>
      </div>
    </WorkbenchDialogPanel>
  );
}
