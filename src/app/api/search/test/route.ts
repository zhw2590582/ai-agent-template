import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { testTavilyConnection } from '@/features/search/server/tavily';

const searchTestSchema = z.object({
  apiKey: z.string().min(1),
  maxResults: z.number().int().optional(),
  searchDepth: z.enum(['advanced', 'basic']).optional(),
  topic: z.enum(['finance', 'general', 'news']).optional(),
});

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.SEARCH_TEST,
      namespace: API_NAMESPACES.SEARCH_TEST,
    });

    const input = await validateRequest(request, searchTestSchema);
    const result = await testTavilyConnection(input);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
