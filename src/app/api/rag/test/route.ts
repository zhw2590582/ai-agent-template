import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { API_NAMESPACES } from '@/config/namespaces';
import { SERVER_MESSAGES } from '@/config/strings';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import { upsertProfileFromAuthUser } from '@/features/auth/storage/profiles';
import { runRagConnectionTest } from '@/features/rag/server/test';

const ragTestSchema = z.object({
  apiKey: z.string().min(1),
});

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ErrorCode.INPUT_INVALID, SERVER_MESSAGES.AUTHENTICATION_REQUIRED, 401);
  }

  return { supabase, user };
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.RAG_TEST,
      identityKey: user.id,
      namespace: API_NAMESPACES.RAG_TEST,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    const input = await validateRequest(request, ragTestSchema);
    const result = await runRagConnectionTest(input.apiKey);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
