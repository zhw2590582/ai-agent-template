import { z } from 'zod';

import { SEARCH_CONFIG } from '@/config/search';
import type { SearchProvider } from '@/features/search/server/providers/search-provider';
import { tavilyRequest } from '@/features/search/server/tavily-client';

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

const tavilyCrawlResultSchema = z.object({
  raw_content: z.string().nullable().optional(),
  url: z.string().url(),
});

const tavilyCrawlResponseSchema = z.object({
  results: z.array(tavilyCrawlResultSchema).default([]),
});

const tavilySearchTestResponseSchema = z.object({
  answer: z.string().nullable().optional(),
  results: z.array(z.unknown()).optional(),
});

export class TavilySearchProvider implements SearchProvider {
  constructor(private readonly apiKey: string) {}

  async testConnection(input: {
    maxResults: number;
    searchDepth: 'advanced' | 'basic';
    topic: 'finance' | 'general' | 'news';
  }) {
    const data = await tavilyRequest({
      apiKey: this.apiKey,
      body: {
        query: 'latest technology news',
        topic: input.topic,
        search_depth: input.searchDepth,
        max_results: input.maxResults,
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

  async search(input: {
    maxResults: number;
    query: string;
    searchDepth: 'advanced' | 'basic';
    topic: 'finance' | 'general' | 'news';
  }) {
    const parsed = await tavilyRequest({
      apiKey: this.apiKey,
      body: {
        query: input.query,
        topic: input.topic,
        search_depth: input.searchDepth,
        max_results: input.maxResults,
        include_answer: true,
        include_favicon: true,
      },
      endpoint: SEARCH_CONFIG.TAVILY_ENDPOINT,
      responseSchema: tavilySearchResponseSchema,
      scope: 'search',
    });

    return {
      answer: parsed.answer?.trim() || null,
      query: parsed.query ?? input.query,
      results: parsed.results.map((result) => ({
        title: result.title?.trim() || result.url,
        url: result.url,
        content: result.content?.trim() || null,
        score: result.score ?? null,
      })),
    };
  }

  async extract(input: {
    chunksPerSource: number;
    extractDepth: 'advanced' | 'basic';
    format: 'markdown' | 'text';
    query?: string;
    urls: string[];
  }) {
    const parsed = await tavilyRequest({
      apiKey: this.apiKey,
      body: {
        urls: input.urls,
        query: input.query,
        chunks_per_source: input.chunksPerSource,
        extract_depth: input.extractDepth,
        format: input.format,
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
  }

  async crawl(input: {
    allowExternal: boolean;
    chunksPerSource: number;
    extractDepth: 'advanced' | 'basic';
    format: 'markdown' | 'text';
    instructions?: string;
    maxDepth: number;
    pageLimit: number;
    url: string;
  }) {
    const parsed = await tavilyRequest({
      apiKey: this.apiKey,
      body: {
        url: input.url,
        instructions: input.instructions,
        max_depth: input.maxDepth,
        limit: input.pageLimit,
        allow_external: input.allowExternal,
        extract_depth: input.extractDepth,
        format: input.format,
        chunks_per_source: input.chunksPerSource,
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
  }
}
