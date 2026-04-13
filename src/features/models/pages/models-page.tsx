'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { ProviderList } from '@/features/models/components/provider-list';
import { ProviderSettingsPanel } from '@/features/models/components/provider-settings-panel';
import { useModelProfile } from '@/features/models/hooks/use-model-profile';
import type { ProviderModelItem, ProviderProbeResult } from '@/features/models/types';
import { cn } from '@/lib/utils';

interface ModelsPageProps {
  embedded?: boolean;
}

export function ModelsPage({ embedded = false }: ModelsPageProps) {
  const t = useTranslations();
  const { user } = useAuthUser();
  const {
    isLoading,
    isSaving,
    presetProviders,
    profile,
    saveProfile,
    selectedProvider,
    updateProvider,
    updateSelectedProviderId,
  } = useModelProfile(user);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const activePreset = useMemo(
    () =>
      presetProviders.find((provider) => provider.id === selectedProvider.id) ?? presetProviders[0],
    [presetProviders, selectedProvider.id]
  );

  const handleAddModel = () => {
    updateProvider(selectedProvider.id, (provider) => ({
      ...provider,
      models: [
        ...provider.models,
        {
          enabled: true,
          id: '',
          isCustom: true,
          name: '',
        },
      ],
    }));
  };

  const updateModel = (index: number, nextModel: ProviderModelItem) => {
    updateProvider(selectedProvider.id, (provider) => ({
      ...provider,
      models: provider.models.map((model, modelIndex) =>
        modelIndex === index ? nextModel : model
      ),
    }));
  };

  const removeModel = (index: number) => {
    updateProvider(selectedProvider.id, (provider) => ({
      ...provider,
      models: provider.models.filter((_, modelIndex) => modelIndex !== index),
    }));
  };

  const applyProviderModels = useCallback(
    (providerId: string, incomingModels: Array<Pick<ProviderModelItem, 'id' | 'name'>>) => {
      if (incomingModels.length === 0) {
        return;
      }

      updateProvider(providerId, (provider) => {
        const existingModels = new Map(provider.models.map((model) => [model.id, model]));
        const syncedModels: ProviderModelItem[] = incomingModels.map((model) => {
          const existing = existingModels.get(model.id);
          return {
            enabled: existing?.enabled ?? true,
            id: model.id,
            name: model.name,
          };
        });

        const customModels = provider.models.filter((model) => model.isCustom);

        return {
          ...provider,
          models: [...syncedModels, ...customModels],
        };
      });
    },
    [updateProvider]
  );

  const probeProvider = useCallback(
    async (notifySuccess: boolean) => {
      if (!selectedProvider.apiKey.trim() || !selectedProvider.baseUrl.trim()) {
        toast.error(t('models_page.toast.provider_config_required'));
        return null;
      }

      const response = await fetch('/api/models/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiFormat: selectedProvider.apiFormat,
          apiKey: selectedProvider.apiKey,
          baseUrl: selectedProvider.baseUrl,
        }),
      });

      if (!response.ok) {
        if (notifySuccess) {
          toast.error(t('models_page.toast.test_connection_failed'));
        }
        return null;
      }

      const result = (await response.json()) as ProviderProbeResult;
      applyProviderModels(selectedProvider.id, result.models);

      if (notifySuccess) {
        toast.success(
          t('models_page.toast.test_connection_success', {
            count: String(result.models.length),
          })
        );
      }

      return result;
    },
    [
      applyProviderModels,
      selectedProvider.apiFormat,
      selectedProvider.apiKey,
      selectedProvider.baseUrl,
      selectedProvider.id,
      t,
    ]
  );

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await probeProvider(true);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div
      className={cn(
        'bg-background text-foreground',
        embedded ? 'h-full overflow-y-auto px-6 py-6' : 'min-h-screen px-6 py-8'
      )}
    >
      <div
        className={cn(
          'mx-auto flex flex-col gap-4 lg:flex-row lg:items-start',
          embedded ? 'max-w-none' : 'max-w-7xl'
        )}
      >
        <div className="shrink-0 lg:w-80">
          <ProviderList
            embedded={embedded}
            providers={presetProviders}
            selectedProviderId={selectedProvider.id}
            settings={profile.settings.models.providers}
            onSelectProvider={updateSelectedProviderId}
            onToggleProvider={(providerId) =>
              updateProvider(providerId, (current) => ({
                ...current,
                enabled: !current.enabled,
              }))
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <ProviderSettingsPanel
            activePreset={activePreset}
            embedded={embedded}
            isApiKeyVisible={isApiKeyVisible}
            isLoading={isLoading}
            isRefreshingModels={false}
            isSaving={isSaving}
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
            onBaseUrlReset={() =>
              updateProvider(selectedProvider.id, (provider) => ({
                ...provider,
                baseUrl: activePreset?.defaultBaseUrl ?? provider.baseUrl,
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
            onProviderApiKeyReset={() =>
              updateProvider(selectedProvider.id, (provider) => ({
                ...provider,
                apiKey: '',
              }))
            }
            onSave={() => void saveProfile()}
            onTestConnection={() => void handleTestConnection()}
          />
        </div>
      </div>
    </div>
  );
}
