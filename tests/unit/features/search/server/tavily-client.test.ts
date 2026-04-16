import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { tavilyRequest } from '@/features/search/server/tavily-client';

describe('tavilyRequest', () => {
  it('wraps network failures with Tavily scope context', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('fetch failed'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      tavilyRequest({
        apiKey: 'test-key',
        body: {
          query: 'latest news',
        },
        endpoint: 'https://api.tavily.com/search',
        responseSchema: z.object({
          results: z.array(z.unknown()).default([]),
        }),
        scope: 'search',
      })
    ).rejects.toThrow('Tavily search request failed: fetch failed');

    vi.unstubAllGlobals();
  });

  it('preserves HTTP error messages from Tavily responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('invalid api key', {
        status: 401,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      tavilyRequest({
        apiKey: 'test-key',
        body: {
          query: 'latest news',
        },
        endpoint: 'https://api.tavily.com/search',
        responseSchema: z.object({
          results: z.array(z.unknown()).default([]),
        }),
        scope: 'search',
      })
    ).rejects.toThrow('Tavily search failed (401): invalid api key');

    vi.unstubAllGlobals();
  });
});
