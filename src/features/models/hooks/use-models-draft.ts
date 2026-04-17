'use client';

import { useCallback, useMemo, useState } from 'react';

import type { AppProfileSettings } from '@/features/settings/types';
import { getOrderedProviders } from '@/features/models/utils/provider-order';
import type { ModelsSettings, ProviderModelItem } from '@/features/models/types';
import { inferModelCapabilities } from '@/features/models/utils/model-capabilities';
import { buildCustomProviderSettings } from '@/features/models/utils/provider-factories';

function cloneModelsSettings(models: ModelsSettings): ModelsSettings {
  return {
    selectedChatModelId: models.selectedChatModelId,
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
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const draftSnapshot = useMemo(() => JSON.stringify(draftModels), [draftModels]);
  const sourceSnapshot = useMemo(() => JSON.stringify(models), [models]);

  const orderedDraftProviders = useMemo(
    () =>
      getOrderedProviders({
        ...profileSettings,
        models: draftModels,
      }),
    [draftModels, profileSettings]
  );

  const selectedProvider = useMemo(
    () =>
      (selectedProviderId ? draftModels.providers[selectedProviderId] : null) ??
      orderedDraftProviders[0] ??
      null,
    [draftModels.providers, orderedDraftProviders, selectedProviderId]
  );

  const isDirty = useMemo(() => draftSnapshot !== sourceSnapshot, [draftSnapshot, sourceSnapshot]);

  const updateSelectedProviderId = useCallback((providerId: string) => {
    setSelectedProviderId(providerId);
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

  const addCustomProvider = useCallback(
    (providerName: string) => {
      const nextProvider = buildCustomProviderSettings({
        existingIds: Object.keys(draftModels.providers),
        name: providerName,
      });

      setDraftModels((current) => {
        return {
          ...current,
          providers: {
            ...current.providers,
            [nextProvider.id]: nextProvider,
          },
        };
      });
      setSelectedProviderId(nextProvider.id);
    },
    [draftModels.providers]
  );

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
        remainingProviders.find((item) => !item.isCustom)?.id ?? remainingProviders[0]?.id ?? null;

      if (selectedProviderId === selectedProvider.id) {
        setSelectedProviderId(fallbackProviderId);
      }

      return {
        ...current,
        providers: nextProviders,
      };
    });
  }, [selectedProvider, selectedProviderId]);

  const resetDraft = useCallback(() => {
    setDraftModels(cloneModelsSettings(models));
    setSelectedProviderId(null);
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
