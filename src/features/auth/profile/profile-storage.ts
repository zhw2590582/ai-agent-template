'use client';

import { API_ROUTES } from '@/config/api';
import { STORAGE_KEYS, WINDOW_EVENTS } from '@/config/keys';
import { SERVER_MESSAGES } from '@/config/strings';
import type { ThemeMode } from '@/config/theme';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { createProfileDraft } from '@/features/auth/profile/profile-draft';
import type { AppProfile } from '@/features/auth/profile/types';
import { createLocalStorageStore } from '@/lib/local-storage-store';

export const LOCAL_APP_PROFILE_STORAGE_KEY = STORAGE_KEYS.LOCAL_MODEL_PROFILE;
export const APP_PROFILE_UPDATED_EVENT = WINDOW_EVENTS.MODEL_PROFILE_UPDATED;

export const profileCache = new Map<string, Partial<AppProfile>>();
export const profileRequestCache = new Map<string, Promise<Partial<AppProfile> | null>>();

function parseLocalProfile(input: unknown) {
  if (typeof input !== 'object' || input == null) {
    return null;
  }

  return input as Partial<AppProfile>;
}

const localProfileStore = createLocalStorageStore<Partial<AppProfile> | null>({
  emptyValue: null,
  eventName: APP_PROFILE_UPDATED_EVENT,
  parse: parseLocalProfile,
  storageKey: LOCAL_APP_PROFILE_STORAGE_KEY,
});

export function emitProfileUpdated(profile: Partial<AppProfile>) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<Partial<AppProfile>>(APP_PROFILE_UPDATED_EVENT, {
      detail: profile,
    })
  );
}

export function readLocalProfile() {
  return localProfileStore.read();
}

export function writeLocalProfile(profile: AppProfile) {
  localProfileStore.write(profile);
}

export function subscribeToLocalProfileUpdates(onChange: () => void) {
  return localProfileStore.subscribe(onChange);
}

export async function loadRemoteProfile(userId: string) {
  const cachedProfile = profileCache.get(userId);
  if (cachedProfile) {
    return cachedProfile;
  }

  const inFlightRequest = profileRequestCache.get(userId);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  const request = (async () => {
    const response = await fetch(API_ROUTES.profile, {
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(SERVER_MESSAGES.PROFILE_LOAD_FAILED);
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

export function buildProfileFromSource(options: {
  existing?: Partial<AppProfile>;
  locale: string;
  theme: ThemeMode;
  user: AuthUserSnapshot | null;
}) {
  return createProfileDraft(options);
}
