'use client';

import { useCallback, useState } from 'react';

import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { useAppProfile } from '@/features/auth/profile/use-app-profile';
import { useModelsDraft } from '@/features/models/hooks/use-models-draft';
import { useProviderProbe } from '@/features/models/hooks/use-provider-probe';

export function useModelsPage() {
  const { user } = useAuthUser();
  const modelProfile = useAppProfile(user);
  const { isLoading, profile, saveProfile } = modelProfile;
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const modelsDraft = useModelsDraft({
    models: profile.settings.models,
    profileSettings: profile.settings,
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

      if (
        selectedProvider &&
        selectedProvider.models.length === 0 &&
        selectedProvider.apiKey.trim() &&
        selectedProvider.baseUrl.trim()
      ) {
        const loadedProviderModels = await loadProviderModels({
          applyResult: false,
          notifyFailure: true,
          notifySuccess: false,
        });

        if (!loadedProviderModels) {
          return false;
        }

        nextDraftModels = {
          ...draftModels,
          providers: {
            ...draftModels.providers,
            [selectedProvider.id]: {
              ...draftModels.providers[selectedProvider.id],
              models: loadedProviderModels.mergedModels,
            },
          },
        };

        setDraftModels(nextDraftModels);
      }

      return await saveProfile(() => nextDraftModels);
    } finally {
      setIsSavingChanges(false);
    }
  }, [draftModels, loadProviderModels, saveProfile, selectedProvider, setDraftModels]);

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
