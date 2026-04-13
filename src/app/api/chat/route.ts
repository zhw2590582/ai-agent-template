import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { handleChatPost, maxDuration } from '@/features/chat/server/chat';
import { enforceRateLimit } from '@/lib/rate-limit';

export { maxDuration };

export async function POST(request: Request) {
  enforceRateLimit(request, {
    config: API_RATE_LIMITS.CHAT,
    namespace: 'api:chat',
  });
  return handleChatPost(request);
}
