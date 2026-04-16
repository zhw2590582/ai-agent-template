import { tool } from 'ai';
import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import { createSearchProvider, hasResolvedSearchAccess } from '@/features/search/server/providers';
import type { SearchSettings } from '@/features/search/types';

export function createWebExtractTool(settings: SearchSettings | null | undefined) {
  if (!settings || !hasResolvedSearchAccess(settings)) {
    return null;
  }

  const resolvedSettings = settings;
  const provider = createSearchProvider(resolvedSettings);

  return tool({
    description:
      'Extract the contents of one or more specific webpages. Use this when the user gives URLs directly or asks you to read a specific page instead of doing a broad web search.',
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .optional()
        .describe('Optional extraction intent used to rerank the most relevant content chunks.'),
      urls: z
        .array(z.string().url())
        .min(1)
        .max(5)
        .describe('One or more webpage URLs to extract content from.'),
    }),
    execute: async ({ query, urls }) => {
      return provider.extract({
        chunksPerSource:
          resolvedSettings.extract.chunksPerSource ??
          SEARCH_CONFIG.DEFAULT_EXTRACT_CHUNKS_PER_SOURCE,
        extractDepth: resolvedSettings.extract.extractDepth ?? SEARCH_CONFIG.DEFAULT_EXTRACT_DEPTH,
        format: resolvedSettings.extract.format ?? SEARCH_CONFIG.DEFAULT_EXTRACT_FORMAT,
        query,
        urls,
      });
    },
  });
}
