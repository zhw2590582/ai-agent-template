import { runSearchConnectionTest } from '@/features/search/server/providers';

export async function testTavilyConnection(input: {
  apiKey: string;
  maxResults?: number;
  searchDepth?: 'advanced' | 'basic';
  topic?: 'finance' | 'general' | 'news';
}) {
  return runSearchConnectionTest({
    ...input,
    provider: 'tavily',
  });
}
