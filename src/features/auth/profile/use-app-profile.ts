'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useTheme } from '@/features/chat/components/preferences/theme-provider';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { createProfileActions } from '@/features/auth/profile/profile-actions';
import { createPersistProfile } from '@/features/auth/profile/profile-persistence';
import {
  getOrderedProviders,
  normalizeProfileSettings,
} from '@/features/auth/profile/profile-settings';
import {
  APP_PROFILE_UPDATED_EVENT,
  buildProfileFromSource,
  loadRemoteProfile,
  profileCache,
  readLocalProfile,
} from '@/features/auth/profile/profile-storage';
import type { AppProfile } from '@/features/auth/profile/types';

export function useAppProfile(user: AuthUserSnapshot | null) {
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
  const profileRef = useRef(profile);
  const saveInFlightRef = useRef<Promise<boolean> | null>(null);
  const queuedSaveRef = useRef<{
    nextProfile: AppProfile;
    options?: { silent?: boolean };
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

    window.addEventListener(APP_PROFILE_UPDATED_EVENT, handleProfileUpdated as EventListener);

    return () => {
      window.removeEventListener(APP_PROFILE_UPDATED_EVENT, handleProfileUpdated as EventListener);
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

  const buildNextProfile = useMemo(
    () => (current: AppProfile, nextModels: AppProfile['settings']['models']) => ({
      ...current,
      locale,
      settings: normalizeProfileSettings({
        memory: current.settings.memory,
        mcp: current.settings.mcp,
        models: nextModels,
        sandbox: current.settings.sandbox,
        search: current.settings.search,
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
        setProfile,
        t,
        theme,
        user,
      }),
    [locale, t, theme, user]
  );

  const actions = useMemo(
    () =>
      createProfileActions({
        buildNextProfile,
        persistProfile,
        profileRef,
        setProfile,
      }),
    [buildNextProfile, persistProfile]
  );

  const updateMemorySettings = useMemo(
    () =>
      async (
        updater: (memory: AppProfile['settings']['memory']) => AppProfile['settings']['memory'],
        options?: { silent?: boolean }
      ) => {
        const current = profileRef.current;
        const nextProfile = {
          ...current,
          locale,
          settings: normalizeProfileSettings({
            ...current.settings,
            memory: updater(current.settings.memory),
          }),
          theme,
          updated_at: new Date().toISOString(),
        };

        profileRef.current = nextProfile;
        setProfile(nextProfile);

        return persistProfile(nextProfile, { silent: options?.silent });
      },
    [locale, persistProfile, theme]
  );

  const updateSearchSettings = useMemo(
    () =>
      async (
        updater: (search: AppProfile['settings']['search']) => AppProfile['settings']['search'],
        options?: { silent?: boolean }
      ) => {
        const current = profileRef.current;
        const nextProfile = {
          ...current,
          locale,
          settings: normalizeProfileSettings({
            memory: current.settings.memory,
            mcp: current.settings.mcp,
            models: current.settings.models,
            sandbox: current.settings.sandbox,
            search: updater(current.settings.search),
          }),
          theme,
          updated_at: new Date().toISOString(),
        };

        profileRef.current = nextProfile;
        setProfile(nextProfile);

        return persistProfile(nextProfile, { silent: options?.silent });
      },
    [locale, persistProfile, theme]
  );

  const updateMcpSettings = useMemo(
    () =>
      async (
        updater: (mcp: AppProfile['settings']['mcp']) => AppProfile['settings']['mcp'],
        options?: { silent?: boolean }
      ) => {
        const current = profileRef.current;
        const nextProfile = {
          ...current,
          locale,
          settings: normalizeProfileSettings({
            memory: current.settings.memory,
            mcp: updater(current.settings.mcp),
            models: current.settings.models,
            sandbox: current.settings.sandbox,
            search: current.settings.search,
          }),
          theme,
          updated_at: new Date().toISOString(),
        };

        profileRef.current = nextProfile;
        setProfile(nextProfile);

        return persistProfile(nextProfile, { silent: options?.silent });
      },
    [locale, persistProfile, theme]
  );

  const updateSandboxSettings = useMemo(
    () =>
      async (
        updater: (sandbox: AppProfile['settings']['sandbox']) => AppProfile['settings']['sandbox'],
        options?: { silent?: boolean }
      ) => {
        const current = profileRef.current;
        const nextProfile = {
          ...current,
          locale,
          settings: normalizeProfileSettings({
            memory: current.settings.memory,
            mcp: current.settings.mcp,
            models: current.settings.models,
            sandbox: updater(current.settings.sandbox),
            search: current.settings.search,
          }),
          theme,
          updated_at: new Date().toISOString(),
        };

        profileRef.current = nextProfile;
        setProfile(nextProfile);

        return persistProfile(nextProfile, { silent: options?.silent });
      },
    [locale, persistProfile, theme]
  );

  return {
    addCustomProvider: actions.addCustomProvider,
    isLoading,
    profile,
    providers: orderedProviders,
    removeCustomProvider: actions.removeCustomProvider,
    saveProfile: actions.saveProfile,
    saveProviderEnabled: actions.saveProviderEnabled,
    selectedProvider,
    updateMcpSettings,
    updateMemorySettings,
    updateSearchSettings,
    updateSandboxSettings,
    updateProvider: actions.updateProvider,
    updateSelectedChatModelId: actions.updateSelectedChatModelId,
    updateSelectedProviderId: actions.updateSelectedProviderId,
  };
}
