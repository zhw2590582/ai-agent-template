/** @vitest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toastError, toastSuccess } = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: toastError,
    success: toastSuccess,
  },
}));

import { normalizeSearchSettings } from '@/features/search/settings';
import { useSearchSettings } from '@/features/search/hooks/use-search-settings';

describe('useSearchSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the structured server error message when the connection test fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        clone() {
          return this;
        },
        headers: new Headers(),
        json: async () => ({
          error: {
            code: 'API_KEY_INVALID',
            message: 'Search authentication failed.',
          },
        }),
        ok: false,
      })
    );

    const { result } = renderHook(() =>
      useSearchSettings({
        onSearchSettingsChange: async () => true,
        saveFailedMessage: 'save failed',
        saveSuccessMessage: 'save success',
        settings: normalizeSearchSettings({
          apiKey: 'test-key',
          enabled: true,
        }),
        testFailedMessage: 'test failed',
        testSuccessMessage: (count) => `ok ${count}`,
      })
    );

    await act(async () => {
      await result.current.runConnectionTest();
    });

    expect(toastError).toHaveBeenCalledWith('Search authentication failed.');
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
