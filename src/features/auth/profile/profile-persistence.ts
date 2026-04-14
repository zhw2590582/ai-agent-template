'use client';

import type { MutableRefObject } from 'react';
import { toast } from 'sonner';

import type { ThemeMode } from '@/config/theme';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import {
  buildProfileFromSource,
  emitProfileUpdated,
  profileCache,
  writeLocalProfile,
} from '@/features/auth/profile/profile-storage';
import type { AppProfile } from '@/features/models/types';
import { getApiErrorToastMessage } from '@/lib/api-client';

interface PersistProfileOptions {
  silent?: boolean;
}

interface CreatePersistProfileOptions {
  locale: string;
  queuedSaveRef: MutableRefObject<{
    nextProfile: AppProfile;
    options?: PersistProfileOptions;
  } | null>;
  saveInFlightRef: MutableRefObject<Promise<boolean> | null>;
  setProfile: (profile: AppProfile) => void;
  t: (key: string) => string;
  theme: ThemeMode;
  user: AuthUserSnapshot | null;
}

export function createPersistProfile({
  locale,
  queuedSaveRef,
  saveInFlightRef,
  setProfile,
  t,
  theme,
  user,
}: CreatePersistProfileOptions) {
  const persistProfile = async (nextProfile: AppProfile, options?: PersistProfileOptions) => {
    if (!user) {
      writeLocalProfile(nextProfile);
      emitProfileUpdated(nextProfile);
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
          toast.error(await getApiErrorToastMessage(response, t, 'models_page.toast.save_failed'));
        }
        return false;
      }

      const data = (await response.json()) as { profile: Partial<AppProfile> };
      profileCache.set(user.id, data.profile ?? nextProfile);
      emitProfileUpdated(data.profile ?? nextProfile);
      setProfile(
        buildProfileFromSource({
          existing: data.profile,
          locale,
          theme,
          user,
        })
      );
      return true;
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
  };

  return persistProfile;
}
