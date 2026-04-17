import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { RAG_CONFIG } from '@/config/rag';
import { API_NAMESPACES } from '@/config/namespaces';
import { handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { runRagConnectionTest } from '@/features/rag/server/test';

const ragTestSchema = z.object({
  apiKey: z.string().min(1),
  provider: z.enum(RAG_CONFIG.PROVIDER_IDS).optional(),
});

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.RAG_TEST,
      namespace: API_NAMESPACES.RAG_TEST,
    });

    const input = await validateRequest(request, ragTestSchema);
    const result = await runRagConnectionTest({
      apiKey: input.apiKey,
      provider: input.provider ?? RAG_CONFIG.DEFAULT_PROVIDER,
    });

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
