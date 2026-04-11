import { NextRequest } from 'next/server';

import {
  handleTestDeepseekGet,
  handleTestDeepseekPost,
} from '@/server/http/routes/test-deepseek-route';

export async function POST(request: NextRequest) {
  return handleTestDeepseekPost(request);
}

export async function GET() {
  return handleTestDeepseekGet();
}
