import { createHash } from 'node:crypto';

import type { SupabaseClient } from '@supabase/supabase-js';

import { RAG_CONFIG } from '@/config/rag';
import type { Database } from '@/lib/supabase/database.types';
import { logger } from '@/lib/logger';
import { chunkDocumentText } from '@/features/rag/server/chunking';
import { embedDocumentsWithProvider } from '@/features/rag/server/embeddings';
import {
  deleteRagDocumentForUser,
  deleteRagChunksForDocument,
  ensureDefaultKnowledgeBase,
  getRagDocumentForUser,
  insertRagChunks,
  insertRagDocument,
  listRagChunksForDocument,
  updateRagDocument,
} from '@/features/rag/storage/rag-documents';
import type { RagDocument, RagProviderId } from '@/features/rag/types';

function buildContentHash(content: string) {
  return createHash('sha256').update(content).digest('hex');
}

function buildExcerpt(content: string) {
  return content.length > RAG_CONFIG.IMPORT_PREVIEW_CHARACTERS
    ? `${content.slice(0, RAG_CONFIG.IMPORT_PREVIEW_CHARACTERS).trimEnd()}…`
    : content;
}

export async function ingestRagTextDocument({
  apiKey,
  content,
  fileName,
  fileSize,
  fileType,
  mimeType,
  provider,
  source,
  supabase,
  title,
  userId,
}: {
  apiKey: string;
  content: string;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  mimeType?: string | null;
  provider: RagProviderId;
  source?: string | null;
  supabase: SupabaseClient<Database>;
  title: string;
  userId: string;
}): Promise<{ chunkCount: number; document: RagDocument }> {
  const normalizedContent = content.trim();
  const chunks = chunkDocumentText(normalizedContent);
  const indexedAt = new Date().toISOString();

  if (chunks.length === 0) {
    throw new Error('RAG document content is empty after normalization.');
  }

  const embeddings = await embedDocumentsWithProvider(chunks, {
    apiKey,
    provider,
  });
  const knowledgeBase = await ensureDefaultKnowledgeBase(supabase, userId);
  const document = await insertRagDocument(supabase, {
    content_hash: buildContentHash(normalizedContent),
    knowledge_base_id: knowledgeBase.id,
    metadata: {
      characterCount: normalizedContent.length,
      chunkCount: chunks.length,
      excerpt: buildExcerpt(normalizedContent),
      fileName: fileName || null,
      fileSize: fileSize ?? null,
      fileType: fileType || null,
      importedAt: indexedAt,
      indexedAt,
      mimeType: mimeType || null,
      originalText: normalizedContent,
    },
    source: source?.trim() || null,
    title,
  });

  try {
    await insertRagChunks(
      supabase,
      chunks.map((chunk, index) => ({
        chunk_index: index,
        content: chunk,
        document_id: document.id,
        embedding: embeddings[index],
        metadata: {
          characterCount: chunk.length,
        },
      }))
    );
  } catch (error) {
    try {
      await deleteRagDocumentForUser(supabase, document.id);
    } catch (rollbackError) {
      logger.error('RAG import rollback failed after chunk insert error', {
        documentId: document.id,
        rollbackError,
      });
    }

    throw error;
  }

  return {
    chunkCount: chunks.length,
    document,
  };
}

export async function reindexRagDocument({
  apiKey,
  documentId,
  provider,
  supabase,
}: {
  apiKey: string;
  documentId: string;
  provider: RagProviderId;
  supabase: SupabaseClient<Database>;
}): Promise<{ chunkCount: number; document: RagDocument }> {
  const documentRow = await getRagDocumentForUser(supabase, documentId);
  const metadata = (documentRow.metadata ?? {}) as Record<string, unknown>;
  const originalText =
    typeof metadata.originalText === 'string' ? metadata.originalText.trim() : '';

  if (!originalText) {
    throw new Error('This document cannot be reindexed because its original text is unavailable.');
  }

  const chunks = chunkDocumentText(originalText);

  if (chunks.length === 0) {
    throw new Error('RAG document content is empty after normalization.');
  }

  const embeddings = await embedDocumentsWithProvider(chunks, {
    apiKey,
    provider,
  });
  const indexedAt = new Date().toISOString();
  const existingChunks = await listRagChunksForDocument(supabase, documentId);

  await deleteRagChunksForDocument(supabase, documentId);

  try {
    await insertRagChunks(
      supabase,
      chunks.map((chunk, index) => ({
        chunk_index: index,
        content: chunk,
        document_id: documentId,
        embedding: embeddings[index],
        metadata: {
          characterCount: chunk.length,
        },
      }))
    );
  } catch (error) {
    if (existingChunks.length > 0) {
      try {
        await insertRagChunks(
          supabase,
          existingChunks.map((chunk) => ({
            chunk_index: chunk.chunk_index,
            content: chunk.content,
            document_id: chunk.document_id,
            embedding: chunk.embedding,
            metadata: chunk.metadata,
          }))
        );
      } catch (rollbackError) {
        logger.error('RAG reindex rollback failed after chunk replacement error', {
          documentId,
          rollbackError,
        });
      }
    }

    throw error;
  }

  const document = await updateRagDocument(supabase, documentId, {
    content_hash: buildContentHash(originalText),
    metadata: {
      ...metadata,
      chunkCount: chunks.length,
      characterCount: originalText.length,
      excerpt: buildExcerpt(originalText),
      indexedAt,
      reindexedAt: indexedAt,
    },
  });

  return {
    chunkCount: chunks.length,
    document,
  };
}
