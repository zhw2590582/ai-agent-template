import { createWebSearchTool } from '@/features/chat/ai/tools/web_search';
import type { SearchSettings } from '@/features/search/types';

export function buildAgentTools(options: { searchSettings?: SearchSettings | null }) {
  const webSearchTool = createWebSearchTool(options.searchSettings);

  return {
    ...(webSearchTool ? { web_search: webSearchTool } : {}),
  };
}
