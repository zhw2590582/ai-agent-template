import { z } from 'zod';

import type { SearchSettings } from '@/features/search/types';
import { hasSearchAccess } from '@/features/search/settings';

function getTavilyErrorMessage(scope: string, status: number, body: string) {
  const suffix = body.slice(0, 240);
  return `Tavily ${scope} failed (${status}): ${suffix}`;
}

function getTavilyNetworkErrorMessage(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return `Tavily ${scope} request failed: ${message}`;
}

export function assertTavilyEnabled(settings: SearchSettings | null | undefined) {
  return hasSearchAccess(settings);
}

export async function tavilyRequest<TSchema extends z.ZodTypeAny>(options: {
  apiKey: string;
  body: Record<string, unknown>;
  endpoint: string;
  responseSchema: TSchema;
  scope: 'crawl' | 'extract' | 'search' | 'test';
}) {
  let response: Response;

  try {
    response = await fetch(options.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey.trim()}`,
      },
      body: JSON.stringify(options.body),
    });
  } catch (error) {
    throw new Error(getTavilyNetworkErrorMessage(options.scope, error), {
      cause: error instanceof Error ? error : undefined,
    });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(getTavilyErrorMessage(options.scope, response.status, text));
  }

  return options.responseSchema.parse(await response.json());
}
