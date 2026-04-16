import { describe, expect, it } from 'vitest';

import { SANDBOX_CONFIG } from '@/config/sandbox';
import { normalizeSandboxSettings } from '@/features/sandbox/settings';

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
});
