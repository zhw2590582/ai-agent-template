export type TavilySearchDepth = 'advanced' | 'basic';
export type TavilySearchTopic = 'finance' | 'general' | 'news';
export type TavilyExtractDepth = 'advanced' | 'basic';
export type TavilyExtractFormat = 'markdown' | 'text';
export type SearchProviderId = 'tavily';

export interface SearchSettings {
  crawl: {
    allowExternal: boolean;
    maxDepth: number;
    pageLimit: number;
  };
  enabled: boolean;
  extract: {
    chunksPerSource: number;
    extractDepth: TavilyExtractDepth;
    format: TavilyExtractFormat;
  };
  search: {
    maxResults: number;
    searchDepth: TavilySearchDepth;
    topic: TavilySearchTopic;
  };
  apiKey: string;
  provider: SearchProviderId;
}
