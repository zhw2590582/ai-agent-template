import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { TEXT_LIMITS } from '@/config/limits';
import { API_NAMESPACES } from '@/config/namespaces';
import { SERVER_MESSAGES } from '@/config/strings';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import {
  deletePersistedMemoryForUser,
  listPersistedMemoriesForUser,
  updatePersistedMemoryForUser,
} from '@/features/memory/server/server-memory-source';
import { MEMORY_KINDS } from '@/features/memory/types';
import { upsertProfileFromAuthUser } from '@/features/auth/storage/profiles';

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

const deleteMemorySchema = z.object({
  id: z.string().min(1),
});

const updateMemorySchema = z.object({
  content: z.string().trim().min(1).max(TEXT_LIMITS.MEMORY_CONTENT),
  id: z.string().min(1),
  kind: z.enum(MEMORY_KINDS),
});

export async function handleMemoriesGet(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MEMORIES_READ,
      identityKey: user.id,
      namespace: API_NAMESPACES.MEMORIES_READ,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);
    const memories = await listPersistedMemoriesForUser({
      client: supabase,
      userId: user.id,
    });

    return Response.json({ memories });
  } catch (error) {
    return handleError(error);
  }
}

export async function handleMemoriesDelete(request: Request) {
  try {
    const { id } = await validateRequest(request, deleteMemorySchema);
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MEMORIES_WRITE,
      identityKey: user.id,
      namespace: API_NAMESPACES.MEMORIES_WRITE,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);
    await deletePersistedMemoryForUser({
      client: supabase,
      id,
      userId: user.id,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function handleMemoriesPatch(request: Request) {
  try {
    const input = await validateRequest(request, updateMemorySchema);
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.MEMORIES_WRITE,
      identityKey: user.id,
      namespace: API_NAMESPACES.MEMORIES_WRITE,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);
    await updatePersistedMemoryForUser({
      client: supabase,
      content: input.content,
      id: input.id,
      kind: input.kind,
      userId: user.id,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
