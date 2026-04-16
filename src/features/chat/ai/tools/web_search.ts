import { tool } from 'ai';
import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import { createSearchProvider, hasResolvedSearchAccess } from '@/features/search/server/providers';
import type { SearchSettings } from '@/features/search/types';

export function createWebSearchTool(settings: SearchSettings | null | undefined) {
  if (!settings || !hasResolvedSearchAccess(settings)) {
    return null;
  }

  const resolvedSettings = settings;
  const provider = createSearchProvider(resolvedSettings);

  return tool({
    description:
      'Search the web for up-to-date information, current events, recent product changes, and live facts. Use this when the user asks for current or web-based information.',
    inputSchema: z.object({
      query: z.string().min(1).describe('The search query to look up on the web'),
      topic: z
        .enum(['general', 'news', 'finance'])
        .optional()
        .describe('Optional search topic. Use news for current events when relevant.'),
    }),
    execute: async ({ query, topic }) => {
      return provider.search({
        maxResults: resolvedSettings.search.maxResults ?? SEARCH_CONFIG.DEFAULT_MAX_RESULTS,
        query,
        searchDepth: resolvedSettings.search.searchDepth ?? SEARCH_CONFIG.DEFAULT_SEARCH_DEPTH,
        topic: topic ?? resolvedSettings.search.topic ?? SEARCH_CONFIG.DEFAULT_TOPIC,
      });
    },
  });
}
