import type { ToolSet } from 'ai';

import { createWebCrawlTool } from '@/features/chat/ai/tools/web_crawl';
import { createWebExtractTool } from '@/features/chat/ai/tools/web_extract';
import { createWebSearchTool } from '@/features/chat/ai/tools/web_search';
import type { SearchSettings } from '@/features/search/types';

export function buildSearchAgentTools(options: {
  searchSettings?: SearchSettings | null;
}): ToolSet {
  const webCrawlTool = createWebCrawlTool(options.searchSettings);
  const webExtractTool = createWebExtractTool(options.searchSettings);
  const webSearchTool = createWebSearchTool(options.searchSettings);

  return {
    ...(webCrawlTool ? { web_crawl: webCrawlTool } : {}),
    ...(webExtractTool ? { web_extract: webExtractTool } : {}),
    ...(webSearchTool ? { web_search: webSearchTool } : {}),
  };
}
