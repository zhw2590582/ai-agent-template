import { SEARCH_CONFIG } from '@/config/search';
import type { SearchSettings } from '@/features/search/types';

function clamp(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

export function hasSearchAccess(settings: SearchSettings | null | undefined) {
  return Boolean(settings?.enabled && settings.tavilyApiKey.trim().length > 0);
}

export function normalizeSearchSettings(input: unknown): SearchSettings {
  const existingSearch =
    typeof input === 'object' && input != null ? (input as Partial<SearchSettings>) : undefined;

  return {
    crawl: {
      allowExternal: existingSearch?.crawl?.allowExternal ?? true,
      maxDepth: clamp(
        existingSearch?.crawl?.maxDepth,
        SEARCH_CONFIG.DEFAULT_CRAWL_MAX_DEPTH,
        SEARCH_CONFIG.CRAWL_MAX_DEPTH_MIN,
        SEARCH_CONFIG.CRAWL_MAX_DEPTH_MAX
      ),
      pageLimit: clamp(
        existingSearch?.crawl?.pageLimit,
        SEARCH_CONFIG.DEFAULT_CRAWL_PAGE_LIMIT,
        SEARCH_CONFIG.CRAWL_PAGE_LIMIT_MIN,
        SEARCH_CONFIG.CRAWL_PAGE_LIMIT_MAX
      ),
    },
    enabled: existingSearch?.enabled ?? false,
    extract: {
      chunksPerSource: clamp(
        existingSearch?.extract?.chunksPerSource,
        SEARCH_CONFIG.DEFAULT_EXTRACT_CHUNKS_PER_SOURCE,
        SEARCH_CONFIG.EXTRACT_CHUNKS_PER_SOURCE_MIN,
        SEARCH_CONFIG.EXTRACT_CHUNKS_PER_SOURCE_MAX
      ),
      extractDepth:
        existingSearch?.extract?.extractDepth === 'advanced' ||
        existingSearch?.extract?.extractDepth === 'basic'
          ? existingSearch.extract.extractDepth
          : SEARCH_CONFIG.DEFAULT_EXTRACT_DEPTH,
      format:
        existingSearch?.extract?.format === 'markdown' || existingSearch?.extract?.format === 'text'
          ? existingSearch.extract.format
          : SEARCH_CONFIG.DEFAULT_EXTRACT_FORMAT,
    },
    search: {
      maxResults: clamp(
        existingSearch?.search?.maxResults,
        SEARCH_CONFIG.DEFAULT_MAX_RESULTS,
        SEARCH_CONFIG.MAX_RESULTS_MIN,
        SEARCH_CONFIG.MAX_RESULTS_MAX
      ),
      searchDepth:
        existingSearch?.search?.searchDepth === 'advanced' ||
        existingSearch?.search?.searchDepth === 'basic'
          ? existingSearch.search.searchDepth
          : SEARCH_CONFIG.DEFAULT_SEARCH_DEPTH,
      topic:
        existingSearch?.search?.topic === 'finance' ||
        existingSearch?.search?.topic === 'general' ||
        existingSearch?.search?.topic === 'news'
          ? existingSearch.search.topic
          : SEARCH_CONFIG.DEFAULT_TOPIC,
    },
    tavilyApiKey:
      typeof existingSearch?.tavilyApiKey === 'string' ? existingSearch.tavilyApiKey : '',
  };
}
