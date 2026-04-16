import { tool } from 'ai';
import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import { createSearchProvider, hasResolvedSearchAccess } from '@/features/search/server/providers';
import type { SearchSettings } from '@/features/search/types';

export function createWebCrawlTool(settings: SearchSettings | null | undefined) {
  if (!settings || !hasResolvedSearchAccess(settings)) {
    return null;
  }

  const resolvedSettings = settings;
  const provider = createSearchProvider(resolvedSettings);

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
      return provider.crawl({
        allowExternal: resolvedSettings.crawl.allowExternal ?? true,
        chunksPerSource:
          resolvedSettings.extract.chunksPerSource ??
          SEARCH_CONFIG.DEFAULT_EXTRACT_CHUNKS_PER_SOURCE,
        extractDepth: resolvedSettings.extract.extractDepth ?? SEARCH_CONFIG.DEFAULT_EXTRACT_DEPTH,
        format: resolvedSettings.extract.format ?? SEARCH_CONFIG.DEFAULT_EXTRACT_FORMAT,
        instructions,
        maxDepth: resolvedSettings.crawl.maxDepth ?? SEARCH_CONFIG.DEFAULT_CRAWL_MAX_DEPTH,
        pageLimit: resolvedSettings.crawl.pageLimit ?? SEARCH_CONFIG.DEFAULT_CRAWL_PAGE_LIMIT,
        url,
      });
    },
  });
}
