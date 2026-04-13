import { z } from 'zod';

import { handleError } from '@/lib/errors';
import { validateRequest } from '@/lib/validation';
import { probeProviderModels } from '@/features/models/server/providers';

const providerProbeSchema = z.object({
  apiFormat: z.enum(['anthropic', 'openai']),
  apiKey: z.string().min(1),
  baseUrl: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const input = await validateRequest(request, providerProbeSchema);
    const result = await probeProviderModels(input);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
