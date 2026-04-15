import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { listSandboxTemplates } from '@/features/sandbox/server/test';

const sandboxTemplatesSchema = z.object({
  apiKey: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.SANDBOX_TEMPLATES,
      namespace: API_NAMESPACES.SANDBOX_TEMPLATES,
    });

    const input = await validateRequest(request, sandboxTemplatesSchema);
    const templates = await listSandboxTemplates(input.apiKey);

    return Response.json({
      templates,
    });
  } catch (error) {
    return handleError(error);
  }
}
