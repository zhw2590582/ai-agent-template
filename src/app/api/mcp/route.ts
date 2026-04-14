import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { SERVER_MESSAGES } from '@/config/strings';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  enforceRateLimit(request, {
    config: API_RATE_LIMITS.MCP,
    namespace: API_NAMESPACES.MCP,
  });

  return Response.json({ message: SERVER_MESSAGES.MCP_UNDER_CONSTRUCTION });
}
