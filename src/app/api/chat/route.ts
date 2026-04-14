import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { handleChatPost, maxDuration } from '@/features/chat/server/chat';
import { enforceRateLimit } from '@/lib/rate-limit';

export { maxDuration };

export async function POST(request: Request) {
  enforceRateLimit(request, {
    config: API_RATE_LIMITS.CHAT,
    namespace: API_NAMESPACES.CHAT,
  });
  return handleChatPost(request);
}
