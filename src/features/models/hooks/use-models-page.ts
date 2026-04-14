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
  const { handleTestConnection, isTestingConnection } = useProviderProbe({
    provider: modelsDraft.selectedProvider,
    updateProvider: modelsDraft.updateProvider,
  });

  const saveChanges = useCallback(async () => {
    setIsSavingChanges(true);

    try {
      return await saveProfile(() => modelsDraft.draftModels);
    } finally {
      setIsSavingChanges(false);
    }
  }, [modelsDraft.draftModels, saveProfile]);

  return {
    addCustomProvider: modelsDraft.addCustomProvider,
    deleteSelectedProvider: modelsDraft.deleteSelectedProvider,
    handleAddModel: modelsDraft.handleAddModel,
    handleTestConnection,
    isApiKeyVisible: modelsDraft.isApiKeyVisible,
    isDirty: modelsDraft.isDirty,
    isLoading,
    isSavingChanges,
    isTestingConnection,
    providers: modelsDraft.providers,
    removeModel: modelsDraft.removeModel,
    resetDraft: modelsDraft.resetDraft,
    saveChanges,
    selectedProvider: modelsDraft.selectedProvider,
    setIsApiKeyVisible: modelsDraft.setIsApiKeyVisible,
    toggleProviderEnabled: modelsDraft.toggleProviderEnabled,
    updateModel: modelsDraft.updateModel,
    updateProvider: modelsDraft.updateProvider,
    updateSelectedProviderId: modelsDraft.updateSelectedProviderId,
  };
}
