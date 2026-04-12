import { handleChatPost, maxDuration } from '@/features/chat/server/chat';

export { maxDuration };

export async function POST(request: Request) {
  return handleChatPost(request);
}
