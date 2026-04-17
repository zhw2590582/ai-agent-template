'use client';

import { useCallback, useState } from 'react';

import type { ModelsSettings, ProviderSettings } from '@/features/models/types';
import { getProvidersRequiringCatalogRefresh } from '@/features/models/utils/provider-sync';

interface UseModelsSaveOptions {
  draftModels: ModelsSettings;
  loadProviderModels: (options?: {
    applyResult?: boolean;
    providerOverride?: ProviderSettings;
    notifyFailure?: boolean;
    notifySuccess?: boolean;
  }) => Promise<{
    mergedModels: ProviderSettings['models'];
    result: unknown;
  } | null>;
  saveModels: (nextModels: ModelsSettings, options?: { silent?: boolean }) => Promise<boolean>;
  savedModels: ModelsSettings;
  setDraftModels: (value: ModelsSettings | ((current: ModelsSettings) => ModelsSettings)) => void;
}

export function useModelsSave({
  draftModels,
  loadProviderModels,
  saveModels,
  savedModels,
  setDraftModels,
}: UseModelsSaveOptions) {
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  const saveChanges = useCallback(async () => {
    setIsSavingChanges(true);

    try {
      let nextDraftModels = draftModels;
      const providersToRefresh = getProvidersRequiringCatalogRefresh({
        draftModels,
        savedModels,
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

      return await saveModels(nextDraftModels);
    } finally {
      setIsSavingChanges(false);
    }
  }, [draftModels, loadProviderModels, saveModels, savedModels, setDraftModels]);

  return {
    isSavingChanges,
    saveChanges,
  };
}
