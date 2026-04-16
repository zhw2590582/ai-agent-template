import type {
  SearchSettings,
  TavilyExtractDepth,
  TavilyExtractFormat,
  TavilySearchDepth,
  TavilySearchTopic,
} from '@/features/search/types';

export interface SearchProviderConnection {
  apiKey: string;
  provider?: SearchSettings['provider'] | null;
}

export interface SearchProviderTestInput extends SearchProviderConnection {
  maxResults?: number;
  searchDepth?: TavilySearchDepth;
  topic?: TavilySearchTopic;
}

export interface SearchProvider {
  crawl(input: {
    allowExternal: boolean;
    chunksPerSource: number;
    extractDepth: TavilyExtractDepth;
    format: TavilyExtractFormat;
    instructions?: string;
    maxDepth: number;
    pageLimit: number;
    url: string;
  }): Promise<{
    resultCount: number;
    results: Array<{
      content: string | null;
      url: string;
    }>;
  }>;
  extract(input: {
    chunksPerSource: number;
    extractDepth: TavilyExtractDepth;
    format: TavilyExtractFormat;
    query?: string;
    urls: string[];
  }): Promise<{
    failedCount: number;
    results: Array<{
      content: string | null;
      favicon: string | null;
      url: string;
    }>;
  }>;
  search(input: {
    maxResults: number;
    query: string;
    searchDepth: TavilySearchDepth;
    topic: TavilySearchTopic;
  }): Promise<{
    answer: string | null;
    query: string;
    results: Array<{
      content: string | null;
      score: number | null;
      title: string;
      url: string;
    }>;
  }>;
  testConnection(input: {
    maxResults: number;
    searchDepth: TavilySearchDepth;
    topic: TavilySearchTopic;
  }): Promise<{
    answer: string | null;
    resultCount: number;
  }>;
}
