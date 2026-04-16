import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { probeProviderModels } from '@/features/models/server/providers';

const providerProbeSchema = z.object({
  apiFormat: z.enum(['anthropic', 'openai']),
  apiKey: z.string().min(1),
  baseUrl: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MODEL_PROBE,
      namespace: API_RATE_LIMITS.MODEL_PROBE.namespace,
    });

    const input = await validateRequest(request, providerProbeSchema);
    const result = await probeProviderModels(input);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
