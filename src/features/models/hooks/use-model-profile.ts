'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useTheme } from '@/components/ui-settings/theme-provider';
import { MODEL_PROVIDER_PRESETS } from '@/features/models/catalog';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import type { AppProfile, AppProfileSettings, ProviderSettings } from '@/features/models/types';
import { createProfileDraft, normalizeProfileSettings } from '@/features/models/utils/profile';

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
  }, [locale, theme, user]);

  const selectedProvider = useMemo(() => {
    return profile.settings.models.providers[profile.settings.models.selectedProviderId];
  }, [profile]);

  const saveTarget = user ? 'database' : 'local';

  const updateSettings = useCallback(
    (nextSettings: AppProfileSettings) => {
      setProfile((current) => ({
        ...current,
        locale,
        settings: normalizeProfileSettings(nextSettings),
        theme,
        updated_at: new Date().toISOString(),
      }));
    },
    [locale, theme]
  );

  const updateSelectedProviderId = useCallback(
    (providerId: string) => {
      updateSettings({
        models: {
          ...profile.settings.models,
          selectedChatModelId: profile.settings.models.selectedChatModelId,
          selectedProviderId: providerId,
        },
      });
    },
    [profile.settings.models, updateSettings]
  );

  const updateProvider = useCallback(
    (providerId: string, updater: (provider: ProviderSettings) => ProviderSettings) => {
      updateSettings({
        models: {
          ...profile.settings.models,
          providers: {
            ...profile.settings.models.providers,
            [providerId]: updater(profile.settings.models.providers[providerId]),
          },
        },
      });
    },
    [profile.settings.models, updateSettings]
  );

  const persistProfile = useCallback(
    async (nextProfile: AppProfile, options?: { silent?: boolean }) => {
      if (!user) {
        writeLocalProfile(nextProfile);
        if (!options?.silent) {
          toast.success(t('models_page.toast.save_local_success'));
        }
        return true;
      }

      setIsSaving(true);
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
        setIsSaving(false);
      }
    },
    [locale, t, theme, user]
  );

  const updateSelectedChatModelId = useCallback(
    async (
      selectedChatModelId: string | null,
      options?: { persist?: boolean; silent?: boolean }
    ) => {
      const nextProfile = {
        ...profile,
        locale,
        settings: normalizeProfileSettings({
          models: {
            ...profile.settings.models,
            selectedChatModelId,
          },
        }),
        theme,
        updated_at: new Date().toISOString(),
      };

      setProfile(nextProfile);

      if (options?.persist === false) {
        return true;
      }

      return persistProfile(nextProfile, { silent: options?.silent });
    },
    [locale, persistProfile, profile, theme]
  );

  const importSettings = (incoming: unknown) => {
    updateSettings(normalizeProfileSettings(incoming));
  };

  const exportSettings = () => {
    return JSON.stringify(profile.settings, null, 2);
  };

  const saveProfile = async () => {
    const nextProfile = {
      ...profile,
      locale,
      theme,
      updated_at: new Date().toISOString(),
    };
    await persistProfile(nextProfile);
  };

  return {
    exportSettings,
    importSettings,
    isLoading,
    isSaving,
    presetProviders: MODEL_PROVIDER_PRESETS,
    profile,
    saveProfile,
    saveTarget,
    selectedProvider,
    updateSelectedChatModelId,
    updateProvider,
    updateSelectedProviderId,
  };
}
