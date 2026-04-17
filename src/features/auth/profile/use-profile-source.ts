'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { ThemeMode } from '@/config/theme';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import {
  APP_PROFILE_UPDATED_EVENT,
  buildProfileFromSource,
  loadRemoteProfile,
  profileCache,
  readLocalProfile,
  subscribeToLocalProfileUpdates,
} from '@/features/auth/profile/profile-storage';
import type { AppProfile } from '@/features/auth/profile/types';

interface UseProfileSourceOptions {
  locale: string;
  t: (key: string) => string;
  theme: ThemeMode;
  user: AuthUserSnapshot | null;
}

export function useProfileSource({ locale, t, theme, user }: UseProfileSourceOptions) {
  const [profile, setProfile] = useState<AppProfile>(() => {
    const cachedProfile = user ? profileCache.get(user.id) : null;

    return buildProfileFromSource({
      existing: cachedProfile ?? undefined,
      locale,
      theme,
      user,
    });
  });
  const [isLoading, setIsLoading] = useState(user ? !profileCache.has(user.id) : true);

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

    const cachedProfile = profileCache.get(user.id);

    if (!cancelled) {
      setIsLoading(!cachedProfile);
      setProfile(
        buildProfileFromSource({
          existing: cachedProfile ?? undefined,
          locale,
          theme,
          user,
        })
      );
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
    if (!user) {
      return subscribeToLocalProfileUpdates(() => {
        const localProfile = readLocalProfile();

        setProfile(
          buildProfileFromSource({
            existing: localProfile ?? undefined,
            locale,
            theme,
            user: null,
          })
        );
      });
    }

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Partial<AppProfile>>).detail;

      if (!detail || detail.id !== user.id) {
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

  return {
    isLoading,
    profile,
    setProfile,
  };
}
