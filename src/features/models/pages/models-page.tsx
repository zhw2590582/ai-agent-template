'use client';

import { ProviderList } from '@/features/models/components/provider-list';
import { ProviderSettingsPanel } from '@/features/models/components/provider-settings-panel';
import { useModelsPage } from '@/features/models/hooks/use-models-page';

export function ModelsPage() {
  const {
    addCustomProviderAndPersist,
    deleteSelectedProvider,
    handleAddModel,
    handleTestConnection,
    isApiKeyVisible,
    isTestingConnection,
    providers,
    selectedProvider,
    setIsApiKeyVisible,
    toggleProviderEnabled,
    updateModel,
    removeModel,
    updateProvider,
    updateSelectedProviderId,
  } = useModelsPage();

  return (
    <div className="bg-background text-foreground flex h-[calc(100vh-3rem)] overflow-hidden">
      <div className="shrink-0 border-r lg:w-80">
        <ProviderList
          providers={providers}
          selectedProviderId={selectedProvider.id}
          onAddCustomProvider={addCustomProviderAndPersist}
          onSelectProvider={updateSelectedProviderId}
          onToggleProvider={toggleProviderEnabled}
        />
      </div>

      <div className="max-w-4xl flex-1 overflow-y-auto">
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
          onDeleteProvider={deleteSelectedProvider}
          onTestConnection={() => void handleTestConnection()}
        />
      </div>
    </div>
  );
}
