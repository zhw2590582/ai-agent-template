import { tool } from 'ai';
import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import { assertTavilyEnabled, tavilyRequest } from '@/features/search/server/tavily-client';
import type { SearchSettings } from '@/features/search/types';

const tavilyExtractResultSchema = z.object({
  favicon: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  raw_content: z.string().nullable().optional(),
  url: z.string().url(),
});

const tavilyExtractResponseSchema = z.object({
  failed_results: z.array(z.unknown()).default([]),
  results: z.array(tavilyExtractResultSchema).default([]),
});

export function createWebExtractTool(settings: SearchSettings | null | undefined) {
  if (!settings || !assertTavilyEnabled(settings)) {
    return null;
  }

  const resolvedSettings = settings;

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
      const parsed = await tavilyRequest({
        apiKey: resolvedSettings.tavilyApiKey,
        body: {
          urls,
          query,
          chunks_per_source:
            resolvedSettings.extract.chunksPerSource ??
            SEARCH_CONFIG.DEFAULT_EXTRACT_CHUNKS_PER_SOURCE,
          extract_depth:
            resolvedSettings.extract.extractDepth ?? SEARCH_CONFIG.DEFAULT_EXTRACT_DEPTH,
          format: resolvedSettings.extract.format ?? SEARCH_CONFIG.DEFAULT_EXTRACT_FORMAT,
          include_favicon: true,
          include_images: false,
        },
        endpoint: SEARCH_CONFIG.TAVILY_EXTRACT_ENDPOINT,
        responseSchema: tavilyExtractResponseSchema,
        scope: 'extract',
      });

      return {
        failedCount: parsed.failed_results.length,
        results: parsed.results.map((result) => ({
          content: result.raw_content?.trim() || null,
          favicon: result.favicon?.trim() || null,
          url: result.url,
        })),
      };
    },
  });
}
