import { describe, expect, it } from 'vitest';

import { SEARCH_CONFIG } from '@/config/search';
import {
  createSearchProvider,
  getResolvedSearchProviderApiKey,
  hasResolvedSearchAccess,
  resolveSearchProvider,
} from '@/features/search/server/providers';
import { TavilySearchProvider } from '@/features/search/server/providers/tavily-provider';

describe('search provider registry', () => {
  it('resolves the current default provider', () => {
    expect(resolveSearchProvider()).toBe(SEARCH_CONFIG.DEFAULT_PROVIDER);
    expect(resolveSearchProvider('tavily')).toBe('tavily');
  });

  it('normalizes provider api keys and access checks through the registry', () => {
    expect(
      getResolvedSearchProviderApiKey({
        apiKey: '  test-key  ',
        provider: 'tavily',
      })
    ).toBe('test-key');
    expect(
      hasResolvedSearchAccess({
        apiKey: '   ',
        provider: 'tavily',
      })
    ).toBe(false);
  });

  it('creates the tavily provider through the factory surface', () => {
    expect(
      createSearchProvider({
        apiKey: 'test-key',
        provider: 'tavily',
      })
    ).toBeInstanceOf(TavilySearchProvider);
  });
});
