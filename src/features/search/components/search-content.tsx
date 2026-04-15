'use client';

import { ExternalLinkIcon, PlugZapIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { SearchConnectionSection } from '@/features/search/components/search-connection-section';
import { SearchCrawlSection } from '@/features/search/components/search-crawl-section';
import { SearchExtractSection } from '@/features/search/components/search-extract-section';
import { SearchWebSection } from '@/features/search/components/search-web-section';
import { useSearchSettings } from '@/features/search/hooks/use-search-settings';
import type { SearchSettings } from '@/features/search/types';

interface SearchContentProps {
  onClose?: () => void;
  onSearchSettingsChange: (
    updater: (settings: SearchSettings) => SearchSettings
  ) => Promise<boolean> | void;
  settings: SearchSettings;
}

export function SearchContent({ onClose, onSearchSettingsChange, settings }: SearchContentProps) {
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
  } = useSearchSettings({
    onClose,
    onSearchSettingsChange,
    saveFailedMessage: t('search_page.toast.save_failed'),
    saveSuccessMessage: t('search_page.toast.save_success'),
    settings,
    testFailedMessage: t('search_page.toast.test_failed'),
    testSuccessMessage: (count) => t('search_page.toast.test_success', { count }),
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
                disabled={!localSettings.tavilyApiKey.trim() || isTesting}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => void runConnectionTest()}
              >
                {!isTesting ? <PlugZapIcon data-icon="inline-start" /> : null}
                {isTesting ? <Spinner data-icon="inline-start" /> : null}
                {t('search_page.test_connection')}
              </Button>
              <Button asChild size="sm" type="button" variant="outline">
                <a href="https://app.tavily.com/home" rel="noreferrer" target="_blank">
                  <ExternalLinkIcon data-icon="inline-start" />
                  {t('search_page.get_api_key')}
                </a>
              </Button>
            </div>
          </div>

          <SearchConnectionSection
            isApiKeyVisible={isApiKeyVisible}
            settings={localSettings}
            onToggleApiKeyVisibility={() => setIsApiKeyVisible((current) => !current)}
            onUpdateSettings={updateSettings}
          />

          <SearchWebSection settings={localSettings} onUpdateSettings={updateSettings} />

          <SearchExtractSection settings={localSettings} onUpdateSettings={updateSettings} />

          <SearchCrawlSection settings={localSettings} onUpdateSettings={updateSettings} />
        </section>
      </div>
    </WorkbenchDialogPanel>
  );
}
