import { tool } from 'ai';
import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import type { SearchSettings } from '@/features/models/types';

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

function assertSearchEnabled(settings: SearchSettings | null | undefined) {
  return Boolean(settings?.enabled && settings.tavilyApiKey.trim().length > 0);
}

export function createWebSearchTool(settings: SearchSettings | null | undefined) {
  if (!assertSearchEnabled(settings)) {
    return null;
  }

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
      const response = await fetch(SEARCH_CONFIG.TAVILY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings?.tavilyApiKey.trim()}`,
        },
        body: JSON.stringify({
          query,
          topic,
          search_depth: 'basic',
          max_results: SEARCH_CONFIG.TAVILY_MAX_RESULTS,
          include_answer: true,
          include_favicon: true,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Tavily search failed (${response.status}): ${text.slice(0, 240)}`);
      }

      const parsed = tavilySearchResponseSchema.parse(await response.json());

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
