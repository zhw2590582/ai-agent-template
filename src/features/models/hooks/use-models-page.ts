'use client';

import type { AppProfileSettings } from '@/features/settings/types';
import { useModelsDraft } from '@/features/models/hooks/use-models-draft';
import { useModelsSave } from '@/features/models/hooks/use-models-save';
import { useModelsSource } from '@/features/models/hooks/use-models-source';
import { useProviderProbe } from '@/features/models/hooks/use-provider-probe';
import type { ModelsSettings } from '@/features/models/types';

interface UseModelsPageOptions {
  profileSettings: AppProfileSettings;
  saveProfile: (
    updater?: (models: ModelsSettings) => ModelsSettings,
    options?: { silent?: boolean }
  ) => Promise<boolean>;
}

export function useModelsPage({ profileSettings, saveProfile }: UseModelsPageOptions) {
  const modelsSource = useModelsSource({
    profileSettings,
    saveProfile,
  });
  const modelsDraft = useModelsDraft({
    models: modelsSource.savedModels,
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
  const { isSavingChanges, saveChanges } = useModelsSave({
    draftModels,
    loadProviderModels,
    saveModels: modelsSource.saveModels,
    savedModels: modelsSource.savedModels,
    setDraftModels,
  });

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
