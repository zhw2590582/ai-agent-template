'use client';

import type { MutableRefObject } from 'react';
import { toast } from 'sonner';

import type { ThemeMode } from '@/config/app';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import type { AppProfile } from '@/features/models/types';
import {
  buildProfileFromSource,
  emitProfileUpdated,
  profileCache,
  writeLocalProfile,
} from '@/features/models/hooks/profile-storage';

interface PersistProfileOptions {
  silent?: boolean;
  trackSavingState?: boolean;
}

interface CreatePersistProfileOptions {
  locale: string;
  setSaveStatus: (status: 'idle' | 'saved' | 'saving') => void;
  setIsSaving: (saving: boolean) => void;
  setProfile: (profile: AppProfile) => void;
  t: (key: string) => string;
  theme: ThemeMode;
  user: AuthUserSnapshot | null;
  queuedSaveRef: MutableRefObject<{
    nextProfile: AppProfile;
    options?: PersistProfileOptions;
  } | null>;
  saveInFlightRef: MutableRefObject<Promise<boolean> | null>;
}

export function createPersistProfile({
  locale,
  queuedSaveRef,
  saveInFlightRef,
  setSaveStatus,
  setIsSaving,
  setProfile,
  t,
  theme,
  user,
}: CreatePersistProfileOptions) {
  const persistProfile = async (nextProfile: AppProfile, options?: PersistProfileOptions) => {
    if (!user) {
      writeLocalProfile(nextProfile);
      emitProfileUpdated(nextProfile);
      if (options?.trackSavingState !== false) {
        setSaveStatus('saved');
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
        setSaveStatus('saving');
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
          if (options?.trackSavingState !== false) {
            setSaveStatus('idle');
          }
          if (!options?.silent) {
            toast.error(t('models_page.toast.save_failed'));
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

        if (options?.trackSavingState !== false) {
          setSaveStatus('saved');
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
  };

  return persistProfile;
}
