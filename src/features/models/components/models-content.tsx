'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CHAT_UI_CONFIG } from '@/config/chat';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { useAppProfile } from '@/features/auth/profile/use-app-profile';
import type { AppProfileSettings } from '@/features/auth/profile/types';
import { ProviderList } from '@/features/models/components/provider-list';
import { ProviderSettingsPanel } from '@/features/models/components/provider-settings-panel';
import { useModelsPage } from '@/features/models/hooks/use-models-page';
import type { ModelsSettings } from '@/features/models/types';

interface ModelsContentProps {
  onClose: () => void;
  onSaved?: () => void;
}

interface ModelsEditorContentProps extends ModelsContentProps {
  profileSettings: AppProfileSettings;
  saveProfile: (
    updater?: (models: ModelsSettings) => ModelsSettings,
    options?: { silent?: boolean }
  ) => Promise<boolean>;
}

function ModelsEditorContent({
  onClose,
  onSaved,
  profileSettings,
  saveProfile,
}: ModelsEditorContentProps) {
  const t = useTranslations();
  const [showSaved, setShowSaved] = useState(false);
  const {
    addCustomProvider,
    deleteSelectedProvider,
    handleAddModel,
    handleTestConnection,
    isApiKeyVisible,
    isDirty,
    isSavingChanges,
    isTestingConnection,
    providers,
    resetDraft,
    saveChanges,
    selectedProvider,
    setIsApiKeyVisible,
    toggleProviderEnabled,
    updateModel,
    removeModel,
    updateProvider,
    updateSelectedProviderId,
  } = useModelsPage({ profileSettings, saveProfile });

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
      bodyClassName="overflow-hidden"
      footer={
        <>
          <Button
            className="min-w-24"
            type="button"
            variant="outline"
            onClick={() => {
              resetDraft();
              onClose();
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="min-w-24"
            disabled={!isDirty || isSavingChanges}
            type="button"
            onClick={async () => {
              const success = await saveChanges();
              if (!success) {
                return;
              }
              setShowSaved(true);
              toast.success(t('models_page.toast.save_success'));
              onSaved?.();
            }}
          >
            {isSavingChanges ? <Spinner data-icon="inline-start" /> : null}
            {showSaved ? t('models_page.actions.saved') : t('common.save')}
          </Button>
        </>
      }
    >
      <div className="text-foreground mx-auto flex h-full w-full max-w-5xl gap-2">
        <div className="min-h-0 shrink-0 lg:w-80">
          <ProviderList
            providers={providers}
            selectedProviderId={selectedProvider.id}
            onAddCustomProvider={addCustomProvider}
            onSelectProvider={updateSelectedProviderId}
            onToggleProvider={toggleProviderEnabled}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ProviderSettingsPanel
            isApiKeyVisible={isApiKeyVisible}
            isTestingConnection={isTestingConnection}
            provider={selectedProvider}
            onAddModel={handleAddModel}
            onApiKeyVisibilityChange={setIsApiKeyVisible}
            onBaseUrlChange={(value) =>
              updateProvider(selectedProvider.id, (provider) => ({
                ...provider,
                baseUrl: value,
              }))
            }
            onDeleteProvider={deleteSelectedProvider}
            onFormatChange={(value) =>
              updateProvider(selectedProvider.id, (provider) => ({
                ...provider,
                apiFormat: value,
              }))
            }
            onModelRemove={removeModel}
            onModelUpdate={updateModel}
            onProviderApiKeyChange={(value) =>
              updateProvider(selectedProvider.id, (provider) => ({
                ...provider,
                apiKey: value,
              }))
            }
            onTestConnection={() => void handleTestConnection()}
          />
        </div>
      </div>
    </WorkbenchDialogPanel>
  );
}

export function ModelsContent({ onClose, onSaved }: ModelsContentProps) {
  const t = useTranslations();
  const { user } = useAuthUser();
  const { isLoading, profile, saveProfile } = useAppProfile(user);
  const modelsSourceKey = JSON.stringify(profile.settings.models);

  if (isLoading) {
    return (
      <WorkbenchDialogPanel bodyClassName="overflow-hidden" footer={null}>
        <div className="text-foreground mx-auto flex h-full w-full max-w-5xl items-center justify-center gap-3">
          <Spinner />
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      </WorkbenchDialogPanel>
    );
  }

  return (
    <ModelsEditorContent
      key={modelsSourceKey}
      onClose={onClose}
      onSaved={onSaved}
      profileSettings={profile.settings}
      saveProfile={saveProfile}
    />
  );
}
