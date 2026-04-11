import { handleChatPost, maxDuration } from '@/server/http/routes/chat-route';

export { maxDuration };

export async function POST(request: Request) {
  return handleChatPost(request);
}
