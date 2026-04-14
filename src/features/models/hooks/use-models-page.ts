'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { useModelProfile } from '@/features/models/hooks/use-model-profile';
import type {
  ModelsSettings,
  ProviderModelItem,
  ProviderProbeResult,
} from '@/features/models/types';
import { buildCustomProviderSettings, getOrderedProviders } from '@/features/models/utils/profile';
import { getApiErrorToastMessage } from '@/lib/api-client';

function cloneModelsSettings(models: ModelsSettings): ModelsSettings {
  return {
    selectedChatModelId: models.selectedChatModelId,
    selectedProviderId: models.selectedProviderId,
    providers: Object.fromEntries(
      Object.entries(models.providers).map(([providerId, provider]) => [
        providerId,
        {
          ...provider,
          models: provider.models.map((model) => ({ ...model })),
        },
      ])
    ),
  };
}

export function useModelsPage({ open }: { open: boolean }) {
  const t = useTranslations();
  const { user } = useAuthUser();
  const modelProfile = useModelProfile(user);
  const { isLoading, profile, providers, saveProfile } = modelProfile;
  const [draftModels, setDraftModels] = useState<ModelsSettings>(() =>
    cloneModelsSettings(profile.settings.models)
  );
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftModels(cloneModelsSettings(profile.settings.models));
    setIsApiKeyVisible(false);
  }, [open, profile.settings.models]);

  const orderedDraftProviders = useMemo(
    () =>
      getOrderedProviders({
        ...profile.settings,
        models: draftModels,
      }),
    [draftModels, profile.settings]
  );

  const selectedProvider = useMemo(
    () =>
      draftModels.providers[draftModels.selectedProviderId] ??
      orderedDraftProviders[0] ??
      providers[0],
    [draftModels.providers, draftModels.selectedProviderId, orderedDraftProviders, providers]
  );

  const isDirty = useMemo(
    () => JSON.stringify(draftModels) !== JSON.stringify(profile.settings.models),
    [draftModels, profile.settings.models]
  );

  const updateSelectedProviderId = useCallback((providerId: string) => {
    setDraftModels((current) => ({
      ...current,
      selectedProviderId: providerId,
    }));
  }, []);

  const updateProvider = useCallback(
    (
      providerId: string,
      updater: (
        provider: ModelsSettings['providers'][string]
      ) => ModelsSettings['providers'][string]
    ) => {
      setDraftModels((current) => ({
        ...current,
        providers: {
          ...current.providers,
          [providerId]: updater(current.providers[providerId]),
        },
      }));
    },
    []
  );

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
          toast.error(
            await getApiErrorToastMessage(response, t, 'models_page.toast.test_connection_failed')
          );
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

  const addCustomProvider = useCallback((providerName: string) => {
    setDraftModels((current) => {
      const nextProvider = buildCustomProviderSettings({
        existingIds: Object.keys(current.providers),
        name: providerName,
      });

      return {
        ...current,
        providers: {
          ...current.providers,
          [nextProvider.id]: nextProvider,
        },
        selectedProviderId: nextProvider.id,
      };
    });
  }, []);

  const toggleProviderEnabled = useCallback((providerId: string) => {
    setDraftModels((current) => ({
      ...current,
      providers: {
        ...current.providers,
        [providerId]: {
          ...current.providers[providerId],
          enabled: !current.providers[providerId].enabled,
        },
      },
    }));
  }, []);

  const deleteSelectedProvider = useCallback(() => {
    setDraftModels((current) => {
      const provider = current.providers[selectedProvider.id];

      if (!provider?.isCustom) {
        return current;
      }

      const nextProviders = { ...current.providers };
      delete nextProviders[selectedProvider.id];

      const remainingProviders = Object.values(nextProviders);
      const fallbackProviderId =
        remainingProviders.find((item) => !item.isCustom)?.id ?? remainingProviders[0]?.id ?? '';

      return {
        ...current,
        providers: nextProviders,
        selectedProviderId:
          current.selectedProviderId === selectedProvider.id
            ? fallbackProviderId
            : current.selectedProviderId,
      };
    });
  }, [selectedProvider.id]);

  const resetDraft = useCallback(() => {
    setDraftModels(cloneModelsSettings(profile.settings.models));
    setIsApiKeyVisible(false);
  }, [profile.settings.models]);

  const saveChanges = useCallback(async () => {
    setIsSavingChanges(true);

    try {
      return await saveProfile(() => draftModels);
    } finally {
      setIsSavingChanges(false);
    }
  }, [draftModels, saveProfile]);

  return {
    addCustomProvider,
    deleteSelectedProvider,
    handleAddModel,
    handleTestConnection,
    isApiKeyVisible,
    isDirty,
    isLoading,
    isSavingChanges,
    isTestingConnection,
    providers: orderedDraftProviders,
    resetDraft,
    saveChanges,
    selectedProvider,
    setIsApiKeyVisible,
    toggleProviderEnabled,
    updateModel,
    updateProvider,
    updateSelectedProviderId,
    removeModel,
  };
}
