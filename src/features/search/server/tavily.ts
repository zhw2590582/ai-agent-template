import { SEARCH_CONFIG } from '@/config/search';

export async function testTavilyConnection(input: {
  apiKey: string;
  maxResults?: number;
  searchDepth?: 'advanced' | 'basic';
  topic?: 'finance' | 'general' | 'news';
}) {
  const response = await fetch(SEARCH_CONFIG.TAVILY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey.trim()}`,
    },
    body: JSON.stringify({
      query: 'latest technology news',
      topic: input.topic ?? SEARCH_CONFIG.DEFAULT_TOPIC,
      search_depth: input.searchDepth ?? SEARCH_CONFIG.DEFAULT_SEARCH_DEPTH,
      max_results: input.maxResults ?? SEARCH_CONFIG.DEFAULT_MAX_RESULTS,
      include_answer: true,
      include_favicon: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tavily test failed (${response.status}): ${text.slice(0, 240)}`);
  }

  const data = (await response.json()) as {
    answer?: string | null;
    results?: Array<unknown>;
  };

  return {
    answer: typeof data.answer === 'string' ? data.answer.trim() : null,
    resultCount: Array.isArray(data.results) ? data.results.length : 0,
  };
}
