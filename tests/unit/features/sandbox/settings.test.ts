import { describe, expect, it } from 'vitest';

import { SANDBOX_CONFIG } from '@/config/sandbox';
import { getSandboxToolPolicy, normalizeSandboxSettings } from '@/features/sandbox/settings';

describe('normalizeSandboxSettings', () => {
  it('defaults the provider to e2b', () => {
    expect(normalizeSandboxSettings(undefined).provider).toBe(SANDBOX_CONFIG.DEFAULT_PROVIDER);
  });

  it('keeps a supported provider and falls back for unsupported values', () => {
    expect(normalizeSandboxSettings({ provider: 'e2b' }).provider).toBe('e2b');
    expect(normalizeSandboxSettings({ provider: 'other' as 'e2b' }).provider).toBe(
      SANDBOX_CONFIG.DEFAULT_PROVIDER
    );
  });

  it('derives tool policy from both enabled and access settings', () => {
    expect(
      getSandboxToolPolicy({
        ...normalizeSandboxSettings(undefined),
        access: {
          allowCommands: false,
          allowFileDownload: true,
          allowFileUpload: true,
          allowFilesystem: true,
          allowInternetAccess: true,
          allowPty: false,
        },
        enabled: true,
      })
    ).toEqual({
      allowCommands: false,
      allowFilesystem: true,
    });

    expect(
      getSandboxToolPolicy({
        ...normalizeSandboxSettings(undefined),
        access: {
          allowCommands: true,
          allowFileDownload: true,
          allowFileUpload: true,
          allowFilesystem: true,
          allowInternetAccess: true,
          allowPty: false,
        },
        enabled: false,
      })
    ).toEqual({
      allowCommands: false,
      allowFilesystem: false,
    });
  });
});
