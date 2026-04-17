import { handleMemoryConsolidatePost } from '@/features/memory/server/consolidate-route';

export async function POST(request: Request) {
  return handleMemoryConsolidatePost(request);
}
