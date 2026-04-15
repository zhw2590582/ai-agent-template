import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { TEXT_LIMITS } from '@/config/limits';
import { API_NAMESPACES } from '@/config/namespaces';
import { SERVER_MESSAGES } from '@/config/strings';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import { upsertProfileFromAuthUser } from '@/features/auth/storage/profiles';
import { ingestRagTextDocument } from '@/features/rag/server/ingestion';
import {
  deleteRagDocumentForUser,
  listRagDocumentsForUser,
} from '@/features/rag/storage/rag-documents';

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

const createRagDocumentSchema = z.object({
  apiKey: z.string().min(1),
  content: z.string().trim().min(1).max(TEXT_LIMITS.RAG_DOCUMENT_CONTENT),
  source: z.string().trim().max(TEXT_LIMITS.RAG_DOCUMENT_SOURCE).optional().or(z.literal('')),
  title: z.string().trim().min(1).max(TEXT_LIMITS.RAG_DOCUMENT_TITLE),
});

const deleteRagDocumentSchema = z.object({
  id: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.RAG_READ,
      identityKey: user.id,
      namespace: API_NAMESPACES.RAG_READ,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    return Response.json(await listRagDocumentsForUser(supabase, user.id));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await validateRequest(request, createRagDocumentSchema);
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.RAG_WRITE,
      identityKey: user.id,
      namespace: API_NAMESPACES.RAG_WRITE,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    return Response.json(
      await ingestRagTextDocument({
        apiKey: input.apiKey,
        content: input.content,
        source: input.source || null,
        supabase,
        title: input.title,
        userId: user.id,
      })
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const input = await validateRequest(request, deleteRagDocumentSchema);
    const { supabase, user } = await requireAuth();
    enforceRateLimit(request, {
      config: API_RATE_LIMITS.RAG_WRITE,
      identityKey: user.id,
      namespace: API_NAMESPACES.RAG_WRITE,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);
    await deleteRagDocumentForUser(supabase, input.id);

    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
