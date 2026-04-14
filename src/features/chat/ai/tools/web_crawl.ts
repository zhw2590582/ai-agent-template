import { tool } from 'ai';
import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import type { SearchSettings } from '@/features/search/types';

const tavilyCrawlResultSchema = z.object({
  raw_content: z.string().nullable().optional(),
  url: z.string().url(),
});

const tavilyCrawlResponseSchema = z.object({
  results: z.array(tavilyCrawlResultSchema).default([]),
});

function assertCrawlEnabled(settings: SearchSettings | null | undefined) {
  return Boolean(settings?.enabled && settings.tavilyApiKey.trim().length > 0);
}

export function createWebCrawlTool(settings: SearchSettings | null | undefined) {
  if (!assertCrawlEnabled(settings)) {
    return null;
  }

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
      const response = await fetch(SEARCH_CONFIG.TAVILY_CRAWL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings?.tavilyApiKey.trim()}`,
        },
        body: JSON.stringify({
          url,
          instructions,
          max_depth: settings?.crawl.maxDepth ?? SEARCH_CONFIG.DEFAULT_CRAWL_MAX_DEPTH,
          limit: settings?.crawl.pageLimit ?? SEARCH_CONFIG.DEFAULT_CRAWL_PAGE_LIMIT,
          allow_external: settings?.crawl.allowExternal ?? true,
          extract_depth: settings?.extract.extractDepth ?? SEARCH_CONFIG.DEFAULT_EXTRACT_DEPTH,
          format: settings?.extract.format ?? SEARCH_CONFIG.DEFAULT_EXTRACT_FORMAT,
          chunks_per_source:
            settings?.extract.chunksPerSource ?? SEARCH_CONFIG.DEFAULT_EXTRACT_CHUNKS_PER_SOURCE,
          include_favicon: true,
          include_images: false,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Tavily crawl failed (${response.status}): ${text.slice(0, 240)}`);
      }

      const parsed = tavilyCrawlResponseSchema.parse(await response.json());

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
