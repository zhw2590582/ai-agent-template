import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { SANDBOX_CONFIG } from '@/config/sandbox';
import { API_NAMESPACES } from '@/config/namespaces';
import { handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { normalizeSandboxSettings } from '@/features/sandbox/settings';
import { runSandboxConnectionTest } from '@/features/sandbox/server/test';

const sandboxTestSchema = z.object({
  access: z.object({
    allowCommands: z.boolean().optional(),
    allowFileDownload: z.boolean().optional(),
    allowFileUpload: z.boolean().optional(),
    allowFilesystem: z.boolean().optional(),
    allowInternetAccess: z.boolean().optional(),
    allowPty: z.boolean().optional(),
  }),
  apiKey: z.string().min(1),
  autoPause: z.boolean().optional(),
  enabled: z.boolean().optional(),
  envVarsText: z.string().optional(),
  provider: z.enum(SANDBOX_CONFIG.PROVIDER_IDS).optional(),
  secure: z.boolean().optional(),
  template: z.string().optional(),
  timeoutSeconds: z.number().int().optional(),
  workingDirectory: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.SANDBOX_TEST,
      namespace: API_NAMESPACES.SANDBOX_TEST,
    });

    const input = await validateRequest(request, sandboxTestSchema);
    const result = await runSandboxConnectionTest(normalizeSandboxSettings(input));

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
