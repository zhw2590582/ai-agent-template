import { createHash } from 'node:crypto';

import type { SupabaseClient } from '@supabase/supabase-js';

import { RAG_CONFIG } from '@/config/rag';
import type { Database } from '@/lib/supabase/database.types';
import { chunkDocumentText } from '@/features/rag/server/chunking';
import { embedDocumentsWithProvider } from '@/features/rag/server/embeddings';
import {
  ensureDefaultKnowledgeBase,
  insertRagChunks,
  insertRagDocument,
} from '@/features/rag/storage/rag-documents';
import type { RagDocument } from '@/features/rag/types';

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
  source?: string | null;
  supabase: SupabaseClient<Database>;
  title: string;
  userId: string;
}): Promise<{ chunkCount: number; document: RagDocument }> {
  const normalizedContent = content.trim();
  const chunks = chunkDocumentText(normalizedContent);

  if (chunks.length === 0) {
    throw new Error('RAG document content is empty after normalization.');
  }

  const embeddings = await embedDocumentsWithProvider(chunks, apiKey);
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
      importedAt: new Date().toISOString(),
      mimeType: mimeType || null,
    },
    source: source?.trim() || null,
    title,
  });

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

  return {
    chunkCount: chunks.length,
    document,
  };
}
