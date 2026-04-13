import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  enforceRateLimit(request, {
    config: API_RATE_LIMITS.MCP,
    namespace: 'api:mcp',
  });
  return Response.json({ message: 'MCP endpoint is under construction.' });
}
