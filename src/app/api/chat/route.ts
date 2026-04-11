import { handleChatPost, maxDuration } from '@/server/chat';

export { maxDuration };

export async function POST(request: Request) {
  return handleChatPost(request);
}
