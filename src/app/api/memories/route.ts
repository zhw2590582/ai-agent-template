import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { TEXT_LIMITS } from '@/config/limits';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import {
  deleteMemoryForUser,
  listMemoriesForUser,
  updateMemoryForUser,
} from '@/features/memory/storage/memories';
import { MEMORY_KINDS } from '@/features/memory/types';
import { upsertProfileFromAuthUser } from '@/features/auth/storage/profiles';

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ErrorCode.INPUT_INVALID, 'Authentication required.', 401);
  }

  return { supabase, user };
}

const deleteMemorySchema = z.object({
  id: z.string().min(1),
});

const updateMemorySchema = z.object({
  content: z.string().trim().min(1).max(TEXT_LIMITS.MEMORY_CONTENT),
  id: z.string().min(1),
  kind: z.enum(MEMORY_KINDS),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MEMORIES_READ,
      identityKey: user.id,
      namespace: 'api:memories:read',
    });
    await upsertProfileFromAuthUser(user, {}, supabase);
    const memories = await listMemoriesForUser(user.id, supabase);

    return Response.json({ memories });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await validateRequest(request, deleteMemorySchema);
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MEMORIES_WRITE,
      identityKey: user.id,
      namespace: 'api:memories:write',
    });
    await upsertProfileFromAuthUser(user, {}, supabase);
    await deleteMemoryForUser({ id, userId: user.id }, supabase);

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const input = await validateRequest(request, updateMemorySchema);
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MEMORIES_WRITE,
      identityKey: user.id,
      namespace: 'api:memories:write',
    });
    await upsertProfileFromAuthUser(user, {}, supabase);
    await updateMemoryForUser({ ...input, userId: user.id }, supabase);

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
