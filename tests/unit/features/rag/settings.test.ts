import { describe, expect, it } from 'vitest';

import { RAG_CONFIG } from '@/config/rag';
import { DEFAULT_RAG_SETTINGS, normalizeRagSettings } from '@/features/rag/settings';

describe('normalizeRagSettings', () => {
  it('defaults the provider to voyage', () => {
    expect(DEFAULT_RAG_SETTINGS.provider).toBe(RAG_CONFIG.DEFAULT_PROVIDER);
    expect(normalizeRagSettings().provider).toBe(RAG_CONFIG.DEFAULT_PROVIDER);
  });

  it('keeps a supported provider and falls back for unsupported values', () => {
    expect(normalizeRagSettings({ provider: 'voyage' }).provider).toBe('voyage');
    expect(normalizeRagSettings({ provider: 'other' as 'voyage' }).provider).toBe(
      RAG_CONFIG.DEFAULT_PROVIDER
    );
  });
});
