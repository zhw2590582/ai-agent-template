import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { listRemoteMcpTools } from '@/features/mcp/server/mcp-client';
import { normalizeMcpSettings } from '@/features/mcp/settings';

const mcpTestSchema = z.object({
  server: z.object({
    bearerToken: z.string().optional(),
    enabled: z.boolean().optional(),
    id: z.string().optional(),
    serverName: z.string().optional(),
    serverUrl: z.string().optional(),
    transport: z.enum(['http', 'sse']).optional(),
  }),
});

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MCP,
      namespace: API_NAMESPACES.MCP,
    });

    const { server } = await validateRequest(request, mcpTestSchema);
    const normalizedSettings = normalizeMcpSettings({
      enabled: true,
      servers: [server],
    });
    const result = await listRemoteMcpTools(normalizedSettings.servers[0]!);

    return Response.json(result ?? { serverName: null, serverVersion: null, toolNames: [] });
  } catch (error) {
    return handleError(error);
  }
}
