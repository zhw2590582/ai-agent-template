import { tool } from 'ai';
import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import { assertTavilyEnabled, tavilyRequest } from '@/features/search/server/tavily-client';
import type { SearchSettings } from '@/features/search/types';

const tavilySearchResultSchema = z.object({
  content: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  title: z.string().nullable().optional(),
  url: z.string().url(),
});

const tavilySearchResponseSchema = z.object({
  answer: z.string().nullable().optional(),
  query: z.string().optional(),
  results: z.array(tavilySearchResultSchema).default([]),
});

export function createWebSearchTool(settings: SearchSettings | null | undefined) {
  if (!settings || !assertTavilyEnabled(settings)) {
    return null;
  }

  const resolvedSettings = settings;

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
      const parsed = await tavilyRequest({
        apiKey: resolvedSettings.tavilyApiKey,
        body: {
          query,
          topic: topic ?? resolvedSettings.search.topic ?? SEARCH_CONFIG.DEFAULT_TOPIC,
          search_depth: resolvedSettings.search.searchDepth ?? SEARCH_CONFIG.DEFAULT_SEARCH_DEPTH,
          max_results: resolvedSettings.search.maxResults ?? SEARCH_CONFIG.DEFAULT_MAX_RESULTS,
          include_answer: true,
          include_favicon: true,
        },
        endpoint: SEARCH_CONFIG.TAVILY_ENDPOINT,
        responseSchema: tavilySearchResponseSchema,
        scope: 'search',
      });

      return {
        answer: parsed.answer?.trim() || null,
        query: parsed.query ?? query,
        results: parsed.results.map((result) => ({
          title: result.title?.trim() || result.url,
          url: result.url,
          content: result.content?.trim() || null,
          score: result.score ?? null,
        })),
      };
    },
  });
}
