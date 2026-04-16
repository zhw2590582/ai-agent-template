import { SEARCH_CONFIG } from '@/config/search';
import type {
  SearchProvider,
  SearchProviderConnection,
  SearchProviderTestInput,
} from '@/features/search/server/providers/search-provider';
import { TavilySearchProvider } from '@/features/search/server/providers/tavily-provider';
import type { SearchProviderId } from '@/features/search/types';

interface SearchProviderDefinition {
  createProvider: (apiKey: string) => SearchProvider;
  getResolvedApiKey: (apiKey: string) => string;
}

const searchProviderDefinitions: Record<SearchProviderId, SearchProviderDefinition> = {
  tavily: {
    createProvider: (apiKey) => new TavilySearchProvider(apiKey),
    getResolvedApiKey: (apiKey) => apiKey.trim(),
  },
};

export function resolveSearchProvider(provider?: SearchProviderId | null): SearchProviderId {
  return provider === 'tavily' ? provider : SEARCH_CONFIG.DEFAULT_PROVIDER;
}

function getSearchProviderDefinition(provider?: SearchProviderId | null) {
  return searchProviderDefinitions[resolveSearchProvider(provider)];
}

export function getResolvedSearchProviderApiKey({ apiKey, provider }: SearchProviderConnection) {
  return getSearchProviderDefinition(provider).getResolvedApiKey(apiKey);
}

export function hasResolvedSearchAccess(connection: SearchProviderConnection) {
  return Boolean(getResolvedSearchProviderApiKey(connection));
}

export function createSearchProvider({ apiKey, provider }: SearchProviderConnection) {
  const resolvedApiKey = getResolvedSearchProviderApiKey({
    apiKey,
    provider,
  });

  if (!resolvedApiKey) {
    throw new Error('Search provider configuration is missing.');
  }

  return getSearchProviderDefinition(provider).createProvider(resolvedApiKey);
}

export async function runSearchConnectionTest(input: SearchProviderTestInput) {
  return createSearchProvider(input).testConnection({
    maxResults: input.maxResults ?? SEARCH_CONFIG.DEFAULT_MAX_RESULTS,
    searchDepth: input.searchDepth ?? SEARCH_CONFIG.DEFAULT_SEARCH_DEPTH,
    topic: input.topic ?? SEARCH_CONFIG.DEFAULT_TOPIC,
  });
}
