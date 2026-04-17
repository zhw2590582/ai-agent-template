import { handleMemoryExtractPost } from '@/features/memory/server/extract-route';

export async function POST(request: Request) {
  return handleMemoryExtractPost(request);
}
