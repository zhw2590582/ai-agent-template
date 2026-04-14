'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ProviderList } from '@/features/models/components/provider-list';
import { ProviderSettingsPanel } from '@/features/models/components/provider-settings-panel';
import { useModelsPage } from '@/features/models/hooks/use-models-page';

interface ModelsContentProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function ModelsContent({ open, onClose, onSaved }: ModelsContentProps) {
  const t = useTranslations();
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
  } = useModelsPage({ open });

  return (
    <div className="text-foreground flex h-full min-h-0 flex-col">
      <div className="mx-auto flex w-full max-w-5xl gap-8 px-6 py-8">
        <div className="shrink-0 border-r lg:w-80">
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
      <div className="bg-muted/50 flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4">
        <Button
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
          disabled={!isDirty || isSavingChanges}
          type="button"
          onClick={async () => {
            const success = await saveChanges();
            if (!success) {
              return;
            }
            onSaved?.();
            onClose();
          }}
        >
          {isSavingChanges ? <Spinner data-icon="inline-start" /> : null}
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}
