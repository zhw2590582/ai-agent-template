/** @vitest-environment jsdom */

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useProfileSource } from '@/features/auth/profile/use-profile-source';

const {
  toastError,
  buildProfileFromSource,
  loadRemoteProfile,
  readLocalProfile,
  subscribeToLocalProfileUpdates,
  profileCache,
} = vi.hoisted(() => ({
  toastError: vi.fn(),
  buildProfileFromSource: vi.fn(),
  loadRemoteProfile: vi.fn(),
  readLocalProfile: vi.fn(),
  subscribeToLocalProfileUpdates: vi.fn(),
  profileCache: new Map<string, Record<string, unknown>>(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: toastError,
  },
}));

vi.mock('@/features/auth/profile/profile-storage', () => ({
  APP_PROFILE_UPDATED_EVENT: 'app-profile-updated',
  buildProfileFromSource: (...args: unknown[]) => buildProfileFromSource(...args),
  loadRemoteProfile: (...args: unknown[]) => loadRemoteProfile(...args),
  profileCache,
  readLocalProfile: (...args: unknown[]) => readLocalProfile(...args),
  subscribeToLocalProfileUpdates: (...args: unknown[]) => subscribeToLocalProfileUpdates(...args),
}));

describe('useProfileSource', () => {
  beforeEach(() => {
    toastError.mockReset();
    buildProfileFromSource.mockReset();
    loadRemoteProfile.mockReset();
    profileCache.clear();
    readLocalProfile.mockReset();
    subscribeToLocalProfileUpdates.mockReset();

    buildProfileFromSource.mockImplementation(({ existing, user }) => ({
      id: user?.id ?? 'guest',
      marker: existing?.marker ?? 'fresh',
      settings: {},
    }));
    subscribeToLocalProfileUpdates.mockReturnValue(() => {});
    readLocalProfile.mockReturnValue(null);
  });

  it('preserves the current cached profile when remote loading fails', async () => {
    const translate = (key: string) => key;
    const user = {
      avatarUrl: null,
      email: 'user@example.com',
      fullName: null,
      id: 'user-1',
    };

    profileCache.set('user-1', {
      id: 'user-1',
      marker: 'cached-profile',
      settings: {},
    });
    loadRemoteProfile.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() =>
      useProfileSource({
        locale: 'en-US',
        t: translate,
        theme: 'dark',
        user,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toMatchObject({
      id: 'user-1',
      marker: 'cached-profile',
    });
    expect(toastError).toHaveBeenCalledWith('models_page.toast.load_failed');
  });
});
