import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/database.types';
import type { RagDocument, RagDocumentMetadata, RagKnowledgeBase } from '@/features/rag/types';

type RagKnowledgeBaseRow = Database['public']['Tables']['rag_knowledge_bases']['Row'];
type RagDocumentInsert = Database['public']['Tables']['rag_documents']['Insert'];
type RagDocumentRow = Database['public']['Tables']['rag_documents']['Row'];
type RagDocumentUpdate = Database['public']['Tables']['rag_documents']['Update'];
type RagChunkInsert = Database['public']['Tables']['rag_chunks']['Insert'];

type RagKnowledgeBasesTable = {
  insert: (values: Database['public']['Tables']['rag_knowledge_bases']['Insert']) => {
    select: (columns: string) => {
      single: () => PromiseLike<{ data: RagKnowledgeBaseRow; error: unknown }>;
    };
  };
  select: (columns: string) => {
    eq: (
      column: 'user_id',
      value: string
    ) => {
      order: (
        column: 'created_at',
        options: { ascending: boolean }
      ) => {
        limit: (value: number) => {
          maybeSingle: () => PromiseLike<{ data: RagKnowledgeBaseRow | null; error: unknown }>;
        };
      };
    };
  };
};

type RagDocumentsTable = {
  delete: () => {
    eq: (
      column: 'id',
      value: string
    ) => {
      select: (columns: string) => {
        maybeSingle: () => PromiseLike<{ data: Pick<RagDocumentRow, 'id'> | null; error: unknown }>;
      };
    };
  };
  insert: (values: RagDocumentInsert) => {
    select: (columns: string) => {
      single: () => PromiseLike<{ data: RagDocumentRow; error: unknown }>;
    };
  };
  select: (columns: string) => {
    eq: (
      column: 'id',
      value: string
    ) => {
      maybeSingle: () => PromiseLike<{ data: RagDocumentRow | null; error: unknown }>;
    };
    order: (
      column: 'updated_at',
      options: { ascending: boolean }
    ) => PromiseLike<{ data: RagDocumentRow[] | null; error: unknown }>;
  };
  update: (values: RagDocumentUpdate) => {
    eq: (
      column: 'id',
      value: string
    ) => {
      select: (columns: string) => {
        single: () => PromiseLike<{ data: RagDocumentRow; error: unknown }>;
      };
    };
  };
};

type RagChunksTable = {
  delete: () => {
    eq: (column: 'document_id', value: string) => PromiseLike<{ error: unknown }>;
  };
  insert: (values: RagChunkInsert[]) => PromiseLike<{ error: unknown }>;
};

function mapKnowledgeBase(row: RagKnowledgeBaseRow): RagKnowledgeBase {
  return row;
}

function sanitizeMetadata(metadata: RagDocumentMetadata): RagDocumentMetadata {
  const { originalText, ...safeMetadata } = metadata;
  return {
    ...safeMetadata,
    canReindex: Boolean(typeof originalText === 'string' && originalText.trim().length > 0),
  };
}

function mapDocument(row: RagDocumentRow): RagDocument {
  const metadata = (row.metadata ?? {}) as RagDocumentMetadata;
  return {
    content_hash: row.content_hash,
    created_at: row.created_at,
    id: row.id,
    knowledge_base_id: row.knowledge_base_id,
    metadata: sanitizeMetadata(metadata),
    source: row.source,
    title: row.title,
    updated_at: row.updated_at,
  };
}

export async function ensureDefaultKnowledgeBase(client: SupabaseClient<Database>, userId: string) {
  const ragKnowledgeBases = client.from('rag_knowledge_bases') as unknown as RagKnowledgeBasesTable;
  const { data, error } = await ragKnowledgeBases
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return mapKnowledgeBase(data);
  }

  const { data: created, error: insertError } = await ragKnowledgeBases
    .insert({
      description: 'Default private knowledge base',
      name: 'Default Knowledge Base',
      user_id: userId,
    })
    .select('*')
    .single();

  if (insertError) {
    throw insertError;
  }

  return mapKnowledgeBase(created);
}

export async function listRagDocumentsForUser(client: SupabaseClient<Database>) {
  const ragDocuments = client.from('rag_documents') as unknown as RagDocumentsTable;
  const { data, error } = await ragDocuments
    .select('id, knowledge_base_id, title, source, content_hash, metadata, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return {
    documents: (data ?? []).map(mapDocument),
  };
}

export async function insertRagDocument(
  client: SupabaseClient<Database>,
  values: RagDocumentInsert
) {
  const ragDocuments = client.from('rag_documents') as unknown as RagDocumentsTable;
  const { data, error } = await ragDocuments
    .insert(values)
    .select('id, knowledge_base_id, title, source, content_hash, metadata, created_at, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return mapDocument(data);
}

export async function getRagDocumentForUser(client: SupabaseClient<Database>, documentId: string) {
  const ragDocuments = client.from('rag_documents') as unknown as RagDocumentsTable;
  const { data, error } = await ragDocuments
    .select('id, knowledge_base_id, title, source, content_hash, metadata, created_at, updated_at')
    .eq('id', documentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('RAG document not found.');
  }

  return data;
}

export async function insertRagChunks(client: SupabaseClient<Database>, values: RagChunkInsert[]) {
  const ragChunks = client.from('rag_chunks') as unknown as RagChunksTable;
  const { error } = await ragChunks.insert(values);

  if (error) {
    throw error;
  }
}

export async function deleteRagChunksForDocument(
  client: SupabaseClient<Database>,
  documentId: string
) {
  const ragChunks = client.from('rag_chunks') as unknown as RagChunksTable;
  const { error } = await ragChunks.delete().eq('document_id', documentId);

  if (error) {
    throw error;
  }
}

export async function updateRagDocument(
  client: SupabaseClient<Database>,
  documentId: string,
  values: RagDocumentUpdate
) {
  const ragDocuments = client.from('rag_documents') as unknown as RagDocumentsTable;
  const { data, error } = await ragDocuments
    .update(values)
    .eq('id', documentId)
    .select('id, knowledge_base_id, title, source, content_hash, metadata, created_at, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return mapDocument(data);
}

export async function deleteRagDocumentForUser(
  client: SupabaseClient<Database>,
  documentId: string
) {
  const ragDocuments = client.from('rag_documents') as unknown as RagDocumentsTable;
  const { data, error } = await ragDocuments
    .delete()
    .eq('id', documentId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('RAG document not found.');
  }
}
