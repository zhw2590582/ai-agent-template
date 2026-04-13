'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { useModelProfile } from '@/features/models/hooks/use-model-profile';
import type { ProviderModelItem, ProviderProbeResult } from '@/features/models/types';

export function useModelsPage() {
  const t = useTranslations();
  const { user } = useAuthUser();
  const modelProfile = useModelProfile(user);
  const {
    addCustomProvider,
    isLoading,
    profile,
    providers,
    removeCustomProvider,
    saveProviderEnabled,
    saveProfile,
    selectedProvider,
    updateProvider,
    updateSelectedProviderId,
  } = modelProfile;
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const hasInitializedAutoSaveRef = useRef(false);
  const suppressNextAutoSaveRef = useRef(false);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  const hasPendingAutoSaveRef = useRef(false);

  const handleAddModel = useCallback(
    (model: Pick<ProviderModelItem, 'id' | 'name'>) => {
      updateProvider(selectedProvider.id, (provider) => ({
        ...provider,
        models: [
          ...provider.models,
          {
            enabled: true,
            id: model.id,
            isCustom: true,
            name: model.name,
          },
        ],
      }));
    },
    [selectedProvider.id, updateProvider]
  );

  const updateModel = useCallback(
    (index: number, nextModel: ProviderModelItem) => {
      updateProvider(selectedProvider.id, (provider) => ({
        ...provider,
        models: provider.models.map((model, modelIndex) =>
          modelIndex === index ? nextModel : model
        ),
      }));
    },
    [selectedProvider.id, updateProvider]
  );

  const removeModel = useCallback(
    (index: number) => {
      updateProvider(selectedProvider.id, (provider) => ({
        ...provider,
        models: provider.models.filter((_, modelIndex) => modelIndex !== index),
      }));
    },
    [selectedProvider.id, updateProvider]
  );

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

  const handleTestConnection = useCallback(async () => {
    setIsTestingConnection(true);
    try {
      await probeProvider(true);
    } finally {
      setIsTestingConnection(false);
    }
  }, [probeProvider]);

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
      hasPendingAutoSaveRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      autoSaveTimeoutRef.current = null;
      void saveProfile(undefined, { silent: true }).then((success) => {
        hasPendingAutoSaveRef.current = false;
        if (!success) {
          return;
        }
      });
    }, 600);
    autoSaveTimeoutRef.current = timeoutId;
    hasPendingAutoSaveRef.current = true;

    return () => {
      if (autoSaveTimeoutRef.current === timeoutId) {
        window.clearTimeout(timeoutId);
        autoSaveTimeoutRef.current = null;
      }
    };
  }, [autoSaveKey, isLoading, saveProfile]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      if (hasPendingAutoSaveRef.current) {
        void saveProfile(undefined, { silent: true });
        hasPendingAutoSaveRef.current = false;
      }
    };
  }, [saveProfile]);

  const addCustomProviderAndPersist = useCallback(
    (providerName: string) => {
      suppressNextAutoSaveRef.current = true;
      void addCustomProvider(providerName);
    },
    [addCustomProvider]
  );

  const toggleProviderEnabled = useCallback(
    (providerId: string) => {
      suppressNextAutoSaveRef.current = true;
      void saveProviderEnabled(providerId, !profile.settings.models.providers[providerId].enabled);
    },
    [profile.settings.models.providers, saveProviderEnabled]
  );

  const deleteSelectedProvider = useCallback(async () => {
    suppressNextAutoSaveRef.current = true;
    await removeCustomProvider(selectedProvider.id);
  }, [removeCustomProvider, selectedProvider.id]);

  return {
    handleAddModel,
    handleTestConnection,
    isApiKeyVisible,
    isLoading,
    isTestingConnection,
    providers,
    selectedProvider,
    setIsApiKeyVisible,
    updateModel,
    removeModel,
    updateProvider,
    updateSelectedProviderId,
    addCustomProviderAndPersist,
    toggleProviderEnabled,
    deleteSelectedProvider,
  };
}
