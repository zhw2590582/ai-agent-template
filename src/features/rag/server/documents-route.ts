import { z } from 'zod';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { TEXT_LIMITS } from '@/config/limits';
import { API_NAMESPACES } from '@/config/namespaces';
import { RAG_CONFIG } from '@/config/rag';
import { requireAuthenticatedUser } from '@/features/auth/server/session';
import { upsertProfileFromAuthUser } from '@/features/auth/storage/profiles';
import { parseRagDocumentFile } from '@/features/rag/server/document-parser';
import { ingestRagTextDocument, reindexRagDocument } from '@/features/rag/server/ingestion';
import {
  deleteRagDocumentForUser,
  listRagDocumentsForUser,
} from '@/features/rag/storage/rag-documents';
import { AppError, ErrorCode, handleError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';

const createRagFileDocumentSchema = z.object({
  apiKey: z.string().min(1),
  provider: z.enum(RAG_CONFIG.PROVIDER_IDS).optional(),
  source: z.string().trim().max(TEXT_LIMITS.RAG_DOCUMENT_SOURCE).optional().or(z.literal('')),
  title: z.string().trim().max(TEXT_LIMITS.RAG_DOCUMENT_TITLE).optional().or(z.literal('')),
});

const deleteRagDocumentSchema = z.object({
  id: z.string().min(1),
});

const reindexRagDocumentSchema = z.object({
  apiKey: z.string().min(1),
  id: z.string().min(1),
  provider: z.enum(RAG_CONFIG.PROVIDER_IDS).optional(),
});

async function parseCreateRagDocumentInput(request: Request) {
  const contentType = request.headers.get('content-type') || '';

  if (!contentType.includes('multipart/form-data')) {
    throw new AppError(
      ErrorCode.INPUT_INVALID,
      'RAG document import only supports file upload for now.',
      400
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    throw new AppError(
      ErrorCode.INPUT_INVALID,
      'A .txt, .md, or .pdf file is required for upload.',
      400
    );
  }

  const metadata = createRagFileDocumentSchema.safeParse({
    apiKey: formData.get('apiKey'),
    provider: formData.get('provider'),
    source: formData.get('source'),
    title: formData.get('title'),
  });

  if (!metadata.success) {
    throw new AppError(
      ErrorCode.INPUT_INVALID,
      'The uploaded RAG document metadata is invalid.',
      400,
      metadata.error.flatten().fieldErrors
    );
  }

  const parsedFile = await parseRagDocumentFile(file);

  return {
    apiKey: metadata.data.apiKey,
    content: parsedFile.content,
    fileName: parsedFile.fileName,
    fileSize: parsedFile.fileSize,
    fileType: parsedFile.fileType,
    mimeType: parsedFile.mimeType,
    provider: metadata.data.provider ?? RAG_CONFIG.DEFAULT_PROVIDER,
    source: metadata.data.source || null,
    title: metadata.data.title?.trim() || parsedFile.title,
  };
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser();

    enforceRateLimit(request, {
      config: API_RATE_LIMITS.RAG_READ,
      identityKey: user.id,
      namespace: API_NAMESPACES.RAG_READ,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    return Response.json(await listRagDocumentsForUser(supabase));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser();

    enforceRateLimit(request, {
      config: API_RATE_LIMITS.RAG_WRITE,
      identityKey: user.id,
      namespace: API_NAMESPACES.RAG_WRITE,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    const input = await parseCreateRagDocumentInput(request);

    return Response.json(
      await ingestRagTextDocument({
        apiKey: input.apiKey,
        content: input.content,
        fileName: input.fileName,
        fileSize: input.fileSize,
        fileType: input.fileType,
        mimeType: input.mimeType,
        provider: input.provider,
        source: input.source,
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
    const { supabase, user } = await requireAuthenticatedUser();

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

export async function PATCH(request: Request) {
  try {
    const input = await validateRequest(request, reindexRagDocumentSchema);
    const { supabase, user } = await requireAuthenticatedUser();

    enforceRateLimit(request, {
      config: API_RATE_LIMITS.RAG_WRITE,
      identityKey: user.id,
      namespace: API_NAMESPACES.RAG_WRITE,
    });
    await upsertProfileFromAuthUser(user, {}, supabase);

    return Response.json(
      await reindexRagDocument({
        apiKey: input.apiKey,
        documentId: input.id,
        provider: input.provider ?? RAG_CONFIG.DEFAULT_PROVIDER,
        supabase,
      })
    );
  } catch (error) {
    return handleError(error);
  }
}
