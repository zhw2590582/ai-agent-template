import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import { tavilyRequest } from '@/features/search/server/tavily-client';

const tavilySearchTestResponseSchema = z.object({
  answer: z.string().nullable().optional(),
  results: z.array(z.unknown()).optional(),
});

export async function testTavilyConnection(input: {
  apiKey: string;
  maxResults?: number;
  searchDepth?: 'advanced' | 'basic';
  topic?: 'finance' | 'general' | 'news';
}) {
  const data = await tavilyRequest({
    apiKey: input.apiKey,
    body: {
      query: 'latest technology news',
      topic: input.topic ?? SEARCH_CONFIG.DEFAULT_TOPIC,
      search_depth: input.searchDepth ?? SEARCH_CONFIG.DEFAULT_SEARCH_DEPTH,
      max_results: input.maxResults ?? SEARCH_CONFIG.DEFAULT_MAX_RESULTS,
      include_answer: true,
      include_favicon: false,
    },
    endpoint: SEARCH_CONFIG.TAVILY_ENDPOINT,
    responseSchema: tavilySearchTestResponseSchema,
    scope: 'test',
  });

  return {
    answer: typeof data.answer === 'string' ? data.answer.trim() : null,
    resultCount: Array.isArray(data.results) ? data.results.length : 0,
  };
}
