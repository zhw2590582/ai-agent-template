export type TavilySearchDepth = 'advanced' | 'basic';
export type TavilySearchTopic = 'finance' | 'general' | 'news';

export interface SearchSettings {
  enabled: boolean;
  maxResults: number;
  searchDepth: TavilySearchDepth;
  tavilyApiKey: string;
  topic: TavilySearchTopic;
}
