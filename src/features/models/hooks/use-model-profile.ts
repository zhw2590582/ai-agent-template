'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useTheme } from '@/components/ui-settings/theme-provider';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { createPersistProfile } from '@/features/models/hooks/profile-persistence';
import {
  buildProfileFromSource,
  loadRemoteProfile,
  MODEL_PROFILE_UPDATED_EVENT,
  profileCache,
  readLocalProfile,
} from '@/features/models/hooks/profile-storage';
import type { AppProfile, ModelsSettings, ProviderSettings } from '@/features/models/types';
import {
  buildCustomProviderSettings,
  getOrderedProviders,
  normalizeProfileSettings,
} from '@/features/models/utils/profile';

export function useModelProfile(user: AuthUserSnapshot | null) {
  const t = useTranslations();
  const locale = useLocale();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<AppProfile>(() => {
    const cachedProfile = user ? profileCache.get(user.id) : null;

    return buildProfileFromSource({
      existing: cachedProfile ?? undefined,
      locale,
      theme,
      user,
    });
  });
  const [isLoading, setIsLoading] = useState(Boolean(user && !profileCache.has(user.id)));
  const [isSaving, setIsSaving] = useState(false);
  const profileRef = useRef(profile);
  const saveInFlightRef = useRef<Promise<boolean> | null>(null);
  const queuedSaveRef = useRef<{
    nextProfile: AppProfile;
    options?: { silent?: boolean; trackSavingState?: boolean };
  } | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      const localProfile = readLocalProfile();
      if (!cancelled) {
        setProfile(
          buildProfileFromSource({
            existing: localProfile ?? undefined,
            locale,
            theme,
            user: null,
          })
        );
        setIsLoading(false);
      }
      return () => {
        cancelled = true;
      };
    }

    void (async () => {
      try {
        const remoteProfile = await loadRemoteProfile(user.id);

        if (!cancelled) {
          setProfile(
            buildProfileFromSource({
              existing: remoteProfile ?? undefined,
              locale,
              theme,
              user,
            })
          );
        }
      } catch {
        if (!cancelled) {
          setProfile(
            buildProfileFromSource({
              locale,
              theme,
              user,
            })
          );
          toast.error(t('models_page.toast.load_failed'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, t, theme, user]);

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Partial<AppProfile>>).detail;
      if (!detail) {
        return;
      }

      if (user) {
        if (detail.id !== user.id) {
          return;
        }
      } else if (detail.id !== 'guest-local') {
        return;
      }

      setProfile(
        buildProfileFromSource({
          existing: detail,
          locale,
          theme,
          user,
        })
      );
    };

    window.addEventListener(MODEL_PROFILE_UPDATED_EVENT, handleProfileUpdated as EventListener);

    return () => {
      window.removeEventListener(
        MODEL_PROFILE_UPDATED_EVENT,
        handleProfileUpdated as EventListener
      );
    };
  }, [locale, theme, user]);

  const orderedProviders = useMemo(() => getOrderedProviders(profile.settings), [profile.settings]);

  const selectedProvider = useMemo(
    () =>
      profile.settings.models.providers[profile.settings.models.selectedProviderId] ??
      orderedProviders[0],
    [
      orderedProviders,
      profile.settings.models.providers,
      profile.settings.models.selectedProviderId,
    ]
  );

  const buildNextProfile = useCallback(
    (current: AppProfile, nextModels: ModelsSettings) => ({
      ...current,
      locale,
      settings: normalizeProfileSettings({
        models: nextModels,
      }),
      theme,
      updated_at: new Date().toISOString(),
    }),
    [locale, theme]
  );

  const persistProfile = useMemo(
    () =>
      createPersistProfile({
        locale,
        queuedSaveRef,
        saveInFlightRef,
        setIsSaving,
        setProfile,
        t,
        theme,
        user,
      }),
    [locale, t, theme, user]
  );

  const updateSelectedProviderId = useCallback(
    (providerId: string) => {
      const current = profileRef.current;
      const nextProfile = buildNextProfile(current, {
        ...current.settings.models,
        selectedChatModelId: current.settings.models.selectedChatModelId,
        selectedProviderId: providerId,
      });
      profileRef.current = nextProfile;
      setProfile(nextProfile);
    },
    [buildNextProfile]
  );

  const updateProvider = useCallback(
    (providerId: string, updater: (provider: ProviderSettings) => ProviderSettings) => {
      const current = profileRef.current;
      const nextProfile = buildNextProfile(current, {
        ...current.settings.models,
        providers: {
          ...current.settings.models.providers,
          [providerId]: updater(current.settings.models.providers[providerId]),
        },
      });
      profileRef.current = nextProfile;
      setProfile(nextProfile);
    },
    [buildNextProfile]
  );

  const addCustomProvider = useCallback(
    async (name: string) => {
      const current = profileRef.current;
      const nextProvider = buildCustomProviderSettings({
        existingIds: Object.keys(current.settings.models.providers),
        name,
      });
      const nextProfile = buildNextProfile(current, {
        ...current.settings.models,
        providers: {
          ...current.settings.models.providers,
          [nextProvider.id]: nextProvider,
        },
        selectedProviderId: nextProvider.id,
      });
      profileRef.current = nextProfile;
      setProfile(nextProfile);

      const success = await persistProfile(nextProfile, {
        silent: true,
        trackSavingState: false,
      });

      return success ? nextProvider.id : null;
    },
    [buildNextProfile, persistProfile]
  );

  const removeCustomProvider = useCallback(
    async (providerId: string) => {
      const current = profileRef.current;
      const provider = current.settings.models.providers[providerId];

      if (!provider?.isCustom) {
        return false;
      }

      const nextProviders = { ...current.settings.models.providers };
      delete nextProviders[providerId];

      const remainingProviders = Object.values(nextProviders);
      const fallbackProviderId =
        remainingProviders.find((item) => !item.isCustom)?.id ?? remainingProviders[0]?.id ?? '';
      const selectedChatModelId = current.settings.models.selectedChatModelId?.startsWith(
        `${providerId}::`
      )
        ? null
        : current.settings.models.selectedChatModelId;
      const nextProfile = buildNextProfile(current, {
        ...current.settings.models,
        providers: nextProviders,
        selectedChatModelId,
        selectedProviderId:
          current.settings.models.selectedProviderId === providerId
            ? fallbackProviderId
            : current.settings.models.selectedProviderId,
      });

      profileRef.current = nextProfile;
      setProfile(nextProfile);

      return persistProfile(nextProfile, {
        silent: true,
        trackSavingState: false,
      });
    },
    [buildNextProfile, persistProfile]
  );

  const updateSelectedChatModelId = useCallback(
    async (
      selectedChatModelId: string | null,
      options?: { persist?: boolean; silent?: boolean }
    ) => {
      const current = profileRef.current;
      const nextProfile = buildNextProfile(current, {
        ...current.settings.models,
        selectedChatModelId,
      });
      profileRef.current = nextProfile;
      setProfile(nextProfile);

      if (options?.persist === false) {
        return true;
      }

      return persistProfile(nextProfile, { silent: options?.silent });
    },
    [buildNextProfile, persistProfile]
  );

  const saveProfile = useCallback(
    async (
      updater?: (models: ModelsSettings) => ModelsSettings,
      options?: { silent?: boolean; trackSavingState?: boolean }
    ) => {
      const current = profileRef.current;
      const nextProfile = buildNextProfile(
        current,
        updater ? updater(current.settings.models) : current.settings.models
      );
      profileRef.current = nextProfile;
      setProfile(nextProfile);
      return persistProfile(nextProfile, {
        silent: options?.silent,
        trackSavingState: options?.trackSavingState,
      });
    },
    [buildNextProfile, persistProfile]
  );

  const saveProviderEnabled = useCallback(
    async (providerId: string, enabled: boolean) => {
      return saveProfile(
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
        { silent: true, trackSavingState: false }
      );
    },
    [saveProfile]
  );

  return {
    addCustomProvider,
    isLoading,
    isSaving,
    profile,
    providers: orderedProviders,
    removeCustomProvider,
    saveProfile,
    saveProviderEnabled,
    selectedProvider,
    updateProvider,
    updateSelectedChatModelId,
    updateSelectedProviderId,
  };
}
