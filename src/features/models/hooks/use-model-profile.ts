'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useTheme } from '@/components/ui-settings/theme-provider';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import type { AppProfile, ModelsSettings, ProviderSettings } from '@/features/models/types';
import {
  buildCustomProviderSettings,
  createProfileDraft,
  getOrderedProviders,
  normalizeProfileSettings,
} from '@/features/models/utils/profile';

const LOCAL_MODEL_PROFILE_STORAGE_KEY = 'agent-model-profile';
const profileCache = new Map<string, Partial<AppProfile>>();
const profileRequestCache = new Map<string, Promise<Partial<AppProfile> | null>>();

function readLocalProfile() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(LOCAL_MODEL_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AppProfile>;
  } catch {
    return null;
  }
}

function writeLocalProfile(profile: AppProfile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_MODEL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

async function loadRemoteProfile(userId: string) {
  const cachedProfile = profileCache.get(userId);
  if (cachedProfile) {
    return cachedProfile;
  }

  const inFlightRequest = profileRequestCache.get(userId);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  const request = (async () => {
    const response = await fetch('/api/profile', {
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error('Failed to load profile');
    }

    const data = (await response.json()) as { profile: Partial<AppProfile> | null };
    if (data.profile) {
      profileCache.set(userId, data.profile);
    }

    return data.profile;
  })();

  profileRequestCache.set(userId, request);

  try {
    return await request;
  } finally {
    profileRequestCache.delete(userId);
  }
}

export function useModelProfile(user: AuthUserSnapshot | null) {
  const t = useTranslations();
  const locale = useLocale();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<AppProfile>(() => {
    const cachedProfile = user ? profileCache.get(user.id) : null;

    return createProfileDraft({
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
          createProfileDraft({
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
            createProfileDraft({
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
            createProfileDraft({
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
    (name: string) => {
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
      return nextProvider.id;
    },
    [buildNextProfile]
  );

  const persistProfile = useCallback(
    async (nextProfile: AppProfile, options?: { silent?: boolean; trackSavingState?: boolean }) => {
      if (!user) {
        writeLocalProfile(nextProfile);
        if (!options?.silent) {
          toast.success(t('models_page.toast.save_local_success'));
        }
        return true;
      }

      if (saveInFlightRef.current) {
        queuedSaveRef.current = { nextProfile, options };
        await saveInFlightRef.current;
        const queuedSave = queuedSaveRef.current;
        if (!queuedSave || queuedSave.nextProfile.updated_at !== nextProfile.updated_at) {
          return true;
        }
        queuedSaveRef.current = null;
        return persistProfile(queuedSave.nextProfile, queuedSave.options);
      }

      const request = (async () => {
        if (options?.trackSavingState !== false) {
          setIsSaving(true);
        }
        try {
          const response = await fetch('/api/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              settings: nextProfile.settings,
            }),
          });

          if (!response.ok) {
            if (!options?.silent) {
              toast.error(t('models_page.toast.save_failed'));
            }
            return false;
          }

          const data = (await response.json()) as { profile: Partial<AppProfile> };
          profileCache.set(user.id, data.profile ?? nextProfile);
          setProfile(
            createProfileDraft({
              existing: data.profile,
              locale,
              theme,
              user,
            })
          );

          if (!options?.silent) {
            toast.success(t('models_page.toast.save_success'));
          }
          return true;
        } finally {
          if (options?.trackSavingState !== false) {
            setIsSaving(false);
          }
        }
      })();

      saveInFlightRef.current = request;

      try {
        return await request;
      } finally {
        if (saveInFlightRef.current === request) {
          saveInFlightRef.current = null;
        }
        const queuedSave = queuedSaveRef.current;
        if (queuedSave) {
          queuedSaveRef.current = null;
          void persistProfile(queuedSave.nextProfile, queuedSave.options);
        }
      }
    },
    [locale, t, theme, user]
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
    providers: orderedProviders,
    profile,
    saveProviderEnabled,
    saveProfile,
    selectedProvider,
    updateSelectedChatModelId,
    updateProvider,
    updateSelectedProviderId,
  };
}
