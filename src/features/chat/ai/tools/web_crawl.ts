import { tool } from 'ai';
import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import { assertTavilyEnabled, tavilyRequest } from '@/features/search/server/tavily-client';
import type { SearchSettings } from '@/features/search/types';

const tavilyCrawlResultSchema = z.object({
  raw_content: z.string().nullable().optional(),
  url: z.string().url(),
});

const tavilyCrawlResponseSchema = z.object({
  results: z.array(tavilyCrawlResultSchema).default([]),
});

export function createWebCrawlTool(settings: SearchSettings | null | undefined) {
  if (!settings || !assertTavilyEnabled(settings)) {
    return null;
  }

  const resolvedSettings = settings;

  return tool({
    description:
      'Crawl a website starting from a single URL and collect content across multiple pages. Use this when the user asks you to inspect a docs site, knowledge base, or section of a website instead of a single page.',
    inputSchema: z.object({
      instructions: z
        .string()
        .min(1)
        .optional()
        .describe('Optional crawl instructions describing what pages or content to prioritize.'),
      url: z.string().min(1).describe('The website or page URL to start crawling from.'),
    }),
    execute: async ({ instructions, url }) => {
      const parsed = await tavilyRequest({
        apiKey: resolvedSettings.tavilyApiKey,
        body: {
          url,
          instructions,
          max_depth: resolvedSettings.crawl.maxDepth ?? SEARCH_CONFIG.DEFAULT_CRAWL_MAX_DEPTH,
          limit: resolvedSettings.crawl.pageLimit ?? SEARCH_CONFIG.DEFAULT_CRAWL_PAGE_LIMIT,
          allow_external: resolvedSettings.crawl.allowExternal ?? true,
          extract_depth:
            resolvedSettings.extract.extractDepth ?? SEARCH_CONFIG.DEFAULT_EXTRACT_DEPTH,
          format: resolvedSettings.extract.format ?? SEARCH_CONFIG.DEFAULT_EXTRACT_FORMAT,
          chunks_per_source:
            resolvedSettings.extract.chunksPerSource ??
            SEARCH_CONFIG.DEFAULT_EXTRACT_CHUNKS_PER_SOURCE,
          include_favicon: true,
          include_images: false,
        },
        endpoint: SEARCH_CONFIG.TAVILY_CRAWL_ENDPOINT,
        responseSchema: tavilyCrawlResponseSchema,
        scope: 'crawl',
      });

      return {
        resultCount: parsed.results.length,
        results: parsed.results.map((result) => ({
          content: result.raw_content?.trim() || null,
          url: result.url,
        })),
      };
    },
  });
}
