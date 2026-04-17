'use client';

import { ExternalLinkIcon, PlugZapIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { SandboxAccessSection } from '@/features/sandbox/components/sandbox-access-section';
import { SandboxConnectionSection } from '@/features/sandbox/components/sandbox-connection-section';
import { SandboxEnvironmentSection } from '@/features/sandbox/components/sandbox-environment-section';
import { SandboxRuntimeSection } from '@/features/sandbox/components/sandbox-runtime-section';
import { useSandboxSettings } from '@/features/sandbox/hooks/use-sandbox-settings';
import type { SandboxSettings } from '@/features/sandbox/types';

interface SandboxContentProps {
  onClose?: () => void;
  onSandboxSettingsChange: (
    updater: (settings: SandboxSettings) => SandboxSettings
  ) => Promise<boolean> | void;
  settings: SandboxSettings;
}

export function SandboxContent({
  onClose,
  onSandboxSettingsChange,
  settings,
}: SandboxContentProps) {
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
  } = useSandboxSettings({
    onClose,
    onSandboxSettingsChange,
    saveFailedMessage: t('sandbox_page.toast.save_failed'),
    saveSuccessMessage: t('sandbox_page.toast.save_success'),
    settings,
    testFailedMessage: t('sandbox_page.toast.test_failed'),
    testSuccessMessage: (template) => t('sandbox_page.toast.test_success', { template }),
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
                {t('sandbox_page.test_connection')}
              </Button>
              <Button asChild size="sm" type="button" variant="outline">
                <a href="https://e2b.dev/dashboard?tab=keys" rel="noreferrer" target="_blank">
                  <ExternalLinkIcon data-icon="inline-start" />
                  {t('sandbox_page.get_api_key')}
                </a>
              </Button>
            </div>
          </div>

          <SandboxConnectionSection
            isApiKeyVisible={isApiKeyVisible}
            settings={localSettings}
            onToggleApiKeyVisibility={() => setIsApiKeyVisible((current) => !current)}
            onUpdateSettings={updateSettings}
          />

          <SandboxRuntimeSection settings={localSettings} onUpdateSettings={updateSettings} />

          <SandboxAccessSection settings={localSettings} onUpdateSettings={updateSettings} />

          <SandboxEnvironmentSection settings={localSettings} onUpdateSettings={updateSettings} />
        </section>
      </div>
    </WorkbenchDialogPanel>
  );
}
