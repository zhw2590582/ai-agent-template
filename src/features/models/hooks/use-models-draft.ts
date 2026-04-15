'use client';

import { useCallback, useMemo, useState } from 'react';

import type { AppProfileSettings } from '@/features/auth/profile/types';
import { getOrderedProviders } from '@/features/auth/profile/profile-settings';
import type { ModelsSettings, ProviderModelItem } from '@/features/models/types';
import { inferModelCapabilities } from '@/features/models/utils/model-capabilities';
import { buildCustomProviderSettings } from '@/features/models/utils/provider-factories';

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

export function useModelsDraft({
  models,
  profileSettings,
}: {
  models: ModelsSettings;
  profileSettings: AppProfileSettings;
}) {
  const [draftModels, setDraftModels] = useState<ModelsSettings>(() => cloneModelsSettings(models));
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const orderedDraftProviders = useMemo(
    () =>
      getOrderedProviders({
        ...profileSettings,
        models: draftModels,
      }),
    [draftModels, profileSettings]
  );

  const selectedProvider = useMemo(
    () => draftModels.providers[draftModels.selectedProviderId] ?? orderedDraftProviders[0] ?? null,
    [draftModels.providers, draftModels.selectedProviderId, orderedDraftProviders]
  );

  const isDirty = useMemo(
    () => JSON.stringify(draftModels) !== JSON.stringify(models),
    [draftModels, models]
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
    (model: Pick<ProviderModelItem, 'capabilities' | 'id' | 'name'>) => {
      if (!selectedProvider) {
        return;
      }

      updateProvider(selectedProvider.id, (provider) => ({
        ...provider,
        models: [
          ...provider.models,
          {
            capabilities: model.capabilities ?? [...inferModelCapabilities(model.id)],
            enabled: true,
            id: model.id,
            isCustom: true,
            name: model.name,
          },
        ],
      }));
    },
    [selectedProvider, updateProvider]
  );

  const updateModel = useCallback(
    (index: number, nextModel: ProviderModelItem) => {
      if (!selectedProvider) {
        return;
      }

      updateProvider(selectedProvider.id, (provider) => ({
        ...provider,
        models: provider.models.map((model, modelIndex) =>
          modelIndex === index ? nextModel : model
        ),
      }));
    },
    [selectedProvider, updateProvider]
  );

  const removeModel = useCallback(
    (index: number) => {
      if (!selectedProvider) {
        return;
      }

      updateProvider(selectedProvider.id, (provider) => ({
        ...provider,
        models: provider.models.filter((_, modelIndex) => modelIndex !== index),
      }));
    },
    [selectedProvider, updateProvider]
  );

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
    if (!selectedProvider) {
      return;
    }

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
  }, [selectedProvider]);

  const resetDraft = useCallback(() => {
    setDraftModels(cloneModelsSettings(models));
    setIsApiKeyVisible(false);
  }, [models]);

  return {
    addCustomProvider,
    deleteSelectedProvider,
    draftModels,
    handleAddModel,
    isApiKeyVisible,
    isDirty,
    providers: orderedDraftProviders,
    removeModel,
    resetDraft,
    selectedProvider,
    setIsApiKeyVisible,
    setDraftModels,
    toggleProviderEnabled,
    updateModel,
    updateProvider,
    updateSelectedProviderId,
  };
}
