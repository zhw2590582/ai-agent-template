'use client';

import { useCallback, useState } from 'react';

import type { AppProfileSettings } from '@/features/auth/profile/types';
import { useModelsDraft } from '@/features/models/hooks/use-models-draft';
import { useProviderProbe } from '@/features/models/hooks/use-provider-probe';
import type { ModelsSettings } from '@/features/models/types';
import { getProvidersRequiringCatalogRefresh } from '@/features/models/utils/provider-sync';

interface UseModelsPageOptions {
  profileSettings: AppProfileSettings;
  saveProfile: (
    updater?: (models: ModelsSettings) => ModelsSettings,
    options?: { silent?: boolean }
  ) => Promise<boolean>;
}

export function useModelsPage({ profileSettings, saveProfile }: UseModelsPageOptions) {
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const modelsDraft = useModelsDraft({
    models: profileSettings.models,
    profileSettings,
  });
  const {
    addCustomProvider,
    deleteSelectedProvider,
    draftModels,
    handleAddModel,
    isApiKeyVisible,
    isDirty,
    providers,
    removeModel,
    resetDraft,
    selectedProvider,
    setDraftModels,
    setIsApiKeyVisible,
    toggleProviderEnabled,
    updateModel,
    updateProvider,
    updateSelectedProviderId,
  } = modelsDraft;
  const { handleTestConnection, isTestingConnection, loadProviderModels } = useProviderProbe({
    provider: selectedProvider,
    updateProvider,
  });

  const saveChanges = useCallback(async () => {
    setIsSavingChanges(true);

    try {
      let nextDraftModels = draftModels;
      const providersToRefresh = getProvidersRequiringCatalogRefresh({
        draftModels,
        savedModels: profileSettings.models,
      });

      if (providersToRefresh.length > 0) {
        const nextProviders = { ...draftModels.providers };

        for (const providerToRefresh of providersToRefresh) {
          const loadedProviderModels = await loadProviderModels({
            applyResult: false,
            notifyFailure: true,
            notifySuccess: false,
            providerOverride: providerToRefresh,
          });

          if (!loadedProviderModels) {
            return false;
          }

          nextProviders[providerToRefresh.id] = {
            ...nextProviders[providerToRefresh.id],
            models: loadedProviderModels.mergedModels,
          };
        }

        nextDraftModels = {
          ...draftModels,
          providers: nextProviders,
        };

        setDraftModels(nextDraftModels);
      }

      return await saveProfile(() => nextDraftModels);
    } finally {
      setIsSavingChanges(false);
    }
  }, [draftModels, loadProviderModels, profileSettings.models, saveProfile, setDraftModels]);

  return {
    addCustomProvider,
    deleteSelectedProvider,
    handleAddModel,
    handleTestConnection,
    isApiKeyVisible,
    isDirty,
    isSavingChanges,
    isTestingConnection,
    providers,
    removeModel,
    resetDraft,
    saveChanges,
    selectedProvider,
    setIsApiKeyVisible,
    toggleProviderEnabled,
    updateModel,
    updateProvider,
    updateSelectedProviderId,
  };
}
