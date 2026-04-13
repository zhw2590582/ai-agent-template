'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { ProviderList } from '@/features/models/components/provider-list';
import { ProviderSettingsPanel } from '@/features/models/components/provider-settings-panel';
import { useModelProfile } from '@/features/models/hooks/use-model-profile';
import type { ProviderModelItem, ProviderProbeResult } from '@/features/models/types';

export function ModelsPage() {
  const t = useTranslations();
  const { user } = useAuthUser();
  const {
    isLoading,
    presetProviders,
    profile,
    saveProviderEnabled,
    saveProfile,
    selectedProvider,
    updateProvider,
    updateSelectedProviderId,
  } = useModelProfile(user);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const hasInitializedAutoSaveRef = useRef(false);
  const suppressNextAutoSaveRef = useRef(false);
  const savedIndicatorTimeoutRef = useRef<number | null>(null);

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

  const mergeProviderModels = useCallback(
    (
      provider: { models: ProviderModelItem[] },
      incomingModels: Array<Pick<ProviderModelItem, 'id' | 'name'>>
    ) => {
      if (incomingModels.length === 0) {
        return provider.models;
      }

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

      return [...syncedModels, ...customModels];
    },
    []
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

      if (notifySuccess) {
        updateProvider(selectedProvider.id, (provider) => ({
          ...provider,
          models: mergeProviderModels(provider, result.models),
        }));
        toast.success(
          t('models_page.toast.test_connection_success', {
            count: String(result.models.length),
          })
        );
      }

      return result;
    },
    [
      mergeProviderModels,
      selectedProvider.apiFormat,
      selectedProvider.apiKey,
      selectedProvider.baseUrl,
      selectedProvider.id,
      t,
      updateProvider,
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

  const autoSaveKey = useMemo(
    () =>
      JSON.stringify({
        providers: profile.settings.models.providers,
        selectedChatModelId: profile.settings.models.selectedChatModelId,
      }),
    [profile.settings.models.providers, profile.settings.models.selectedChatModelId]
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!hasInitializedAutoSaveRef.current) {
      hasInitializedAutoSaveRef.current = true;
      return;
    }

    if (suppressNextAutoSaveRef.current) {
      suppressNextAutoSaveRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAutoSaveStatus('saving');
      void saveProfile(undefined, { silent: true, trackSavingState: false }).then((success) => {
        if (!success) {
          setAutoSaveStatus('idle');
          return;
        }

        setAutoSaveStatus('saved');
        if (savedIndicatorTimeoutRef.current) {
          window.clearTimeout(savedIndicatorTimeoutRef.current);
        }
        savedIndicatorTimeoutRef.current = window.setTimeout(() => {
          setAutoSaveStatus('idle');
          savedIndicatorTimeoutRef.current = null;
        }, 1400);
      });
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [autoSaveKey, isLoading, saveProfile]);

  useEffect(() => {
    return () => {
      if (savedIndicatorTimeoutRef.current) {
        window.clearTimeout(savedIndicatorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-background text-foreground flex h-[calc(100vh-3rem)] overflow-hidden">
      <div className="shrink-0 border-r lg:w-80">
        <ProviderList
          providers={presetProviders}
          selectedProviderId={selectedProvider.id}
          settings={profile.settings.models.providers}
          onSelectProvider={updateSelectedProviderId}
          onToggleProvider={(providerId) => {
            suppressNextAutoSaveRef.current = true;
            void saveProviderEnabled(
              providerId,
              !profile.settings.models.providers[providerId].enabled
            );
          }}
        />
      </div>

      <div className="max-w-4xl flex-1 overflow-y-auto">
        <ProviderSettingsPanel
          activePreset={activePreset}
          autoSaveStatus={autoSaveStatus}
          isApiKeyVisible={isApiKeyVisible}
          isRefreshingModels={false}
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
          onTestConnection={() => void handleTestConnection()}
        />
      </div>
    </div>
  );
}
