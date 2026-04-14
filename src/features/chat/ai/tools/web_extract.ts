import { tool } from 'ai';
import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
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

function assertExtractEnabled(settings: SearchSettings | null | undefined) {
  return Boolean(settings?.enabled && settings.tavilyApiKey.trim().length > 0);
}

export function createWebExtractTool(settings: SearchSettings | null | undefined) {
  if (!assertExtractEnabled(settings)) {
    return null;
  }

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
      const response = await fetch(SEARCH_CONFIG.TAVILY_EXTRACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings?.tavilyApiKey.trim()}`,
        },
        body: JSON.stringify({
          urls,
          query,
          chunks_per_source:
            settings?.extract.chunksPerSource ?? SEARCH_CONFIG.DEFAULT_EXTRACT_CHUNKS_PER_SOURCE,
          extract_depth: settings?.extract.extractDepth ?? SEARCH_CONFIG.DEFAULT_EXTRACT_DEPTH,
          format: settings?.extract.format ?? SEARCH_CONFIG.DEFAULT_EXTRACT_FORMAT,
          include_favicon: true,
          include_images: false,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Tavily extract failed (${response.status}): ${text.slice(0, 240)}`);
      }

      const parsed = tavilyExtractResponseSchema.parse(await response.json());

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
