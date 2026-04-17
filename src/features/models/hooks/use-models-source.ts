'use client';

import { useCallback } from 'react';

import type { AppProfileSettings } from '@/features/settings/types';
import type { ModelsSettings } from '@/features/models/types';

interface UseModelsSourceOptions {
  profileSettings: AppProfileSettings;
  saveProfile: (
    updater?: (models: ModelsSettings) => ModelsSettings,
    options?: { silent?: boolean }
  ) => Promise<boolean>;
}

export function useModelsSource({ profileSettings, saveProfile }: UseModelsSourceOptions) {
  const savedModels = profileSettings.models;

  const saveModels = useCallback(
    (nextModels: ModelsSettings, options?: { silent?: boolean }) =>
      saveProfile(() => nextModels, options),
    [saveProfile]
  );

  return {
    saveModels,
    savedModels,
  };
}
