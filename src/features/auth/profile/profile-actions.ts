'use client';

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { AppProfile } from '@/features/auth/profile/types';
import type { ModelsSettings, ProviderSettings } from '@/features/models/types';
import { buildCustomProviderSettings } from '@/features/models/utils/provider-factories';

interface PersistOptions {
  silent?: boolean;
}

interface CreateProfileActionsOptions {
  buildNextProfile: (current: AppProfile, nextModels: ModelsSettings) => AppProfile;
  persistProfile: (nextProfile: AppProfile, options?: PersistOptions) => Promise<boolean>;
  profileRef: MutableRefObject<AppProfile>;
  setProfile: Dispatch<SetStateAction<AppProfile>>;
}

export function createProfileActions({
  buildNextProfile,
  persistProfile,
  profileRef,
  setProfile,
}: CreateProfileActionsOptions) {
  const commitProfile = (nextProfile: AppProfile) => {
    profileRef.current = nextProfile;
    setProfile(nextProfile);
    return nextProfile;
  };

  const updateProvider = (
    providerId: string,
    updater: (provider: ProviderSettings) => ProviderSettings
  ) => {
    const current = profileRef.current;
    commitProfile(
      buildNextProfile(current, {
        ...current.settings.models,
        providers: {
          ...current.settings.models.providers,
          [providerId]: updater(current.settings.models.providers[providerId]),
        },
      })
    );
  };

  const addCustomProvider = async (name: string) => {
    const current = profileRef.current;
    const nextProvider = buildCustomProviderSettings({
      existingIds: Object.keys(current.settings.models.providers),
      name,
    });
    const nextProfile = commitProfile(
      buildNextProfile(current, {
        ...current.settings.models,
        providers: {
          ...current.settings.models.providers,
          [nextProvider.id]: nextProvider,
        },
      })
    );

    const success = await persistProfile(nextProfile, {
      silent: true,
    });

    return success ? nextProvider.id : null;
  };

  const removeCustomProvider = async (providerId: string) => {
    const current = profileRef.current;
    const provider = current.settings.models.providers[providerId];

    if (!provider?.isCustom) {
      return false;
    }

    const nextProviders = { ...current.settings.models.providers };
    delete nextProviders[providerId];

    const selectedChatModelId = current.settings.models.selectedChatModelId?.startsWith(
      `${providerId}::`
    )
      ? null
      : current.settings.models.selectedChatModelId;
    const nextProfile = commitProfile(
      buildNextProfile(current, {
        ...current.settings.models,
        providers: nextProviders,
        selectedChatModelId,
      })
    );

    return persistProfile(nextProfile, {
      silent: true,
    });
  };

  const updateSelectedChatModelId = async (
    selectedChatModelId: string | null,
    options?: { persist?: boolean; silent?: boolean }
  ) => {
    const current = profileRef.current;
    const nextProfile = commitProfile(
      buildNextProfile(current, {
        ...current.settings.models,
        selectedChatModelId,
      })
    );

    if (options?.persist === false) {
      return true;
    }

    return persistProfile(nextProfile, { silent: options?.silent });
  };

  const saveProfile = async (
    updater?: (models: ModelsSettings) => ModelsSettings,
    options?: PersistOptions
  ) => {
    const current = profileRef.current;
    const nextProfile = commitProfile(
      buildNextProfile(
        current,
        updater ? updater(current.settings.models) : current.settings.models
      )
    );

    return persistProfile(nextProfile, {
      silent: options?.silent,
    });
  };

  const saveProviderEnabled = async (providerId: string, enabled: boolean) =>
    saveProfile(
      (models) => ({
        ...models,
        providers: {
          ...models.providers,
          [providerId]: {
            ...models.providers[providerId],
            enabled,
          },
        },
      }),
      { silent: true }
    );

  return {
    addCustomProvider,
    removeCustomProvider,
    saveProfile,
    saveProviderEnabled,
    updateProvider,
    updateSelectedChatModelId,
  };
}
