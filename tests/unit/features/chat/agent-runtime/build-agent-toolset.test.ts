/** @vitest-environment node */

import { describe, expect, it } from 'vitest';

import { buildSearchAgentTools } from '@/features/chat/agent-runtime/build-agent-toolset';
import { normalizeSearchSettings } from '@/features/search/settings';

describe('buildSearchAgentTools', () => {
  it('does not expose web tools when search is disabled', () => {
    const searchSettings = normalizeSearchSettings({
      apiKey: 'test-key',
      enabled: false,
    });

    expect(buildSearchAgentTools({ searchSettings })).toEqual({});
  });

  it('exposes web tools when search is enabled and configured', () => {
    const searchSettings = normalizeSearchSettings({
      apiKey: 'test-key',
      enabled: true,
    });

    expect(Object.keys(buildSearchAgentTools({ searchSettings })).sort()).toEqual([
      'web_crawl',
      'web_extract',
      'web_search',
    ]);
  });
});
