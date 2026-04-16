import { describe, expect, it } from 'vitest';

import { SEARCH_CONFIG } from '@/config/search';
import { normalizeSearchSettings } from '@/features/search/settings';

describe('normalizeSearchSettings', () => {
  it('defaults the provider to tavily', () => {
    expect(normalizeSearchSettings(undefined).provider).toBe(SEARCH_CONFIG.DEFAULT_PROVIDER);
  });

  it('keeps a supported provider and falls back for unsupported values', () => {
    expect(normalizeSearchSettings({ provider: 'tavily' }).provider).toBe('tavily');
    expect(normalizeSearchSettings({ provider: 'other' as 'tavily' }).provider).toBe(
      SEARCH_CONFIG.DEFAULT_PROVIDER
    );
  });

  it('defaults apiKey to an empty string', () => {
    expect(normalizeSearchSettings(undefined).apiKey).toBe('');
  });
});
