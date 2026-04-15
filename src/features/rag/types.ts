export interface RagSettings {
  apiKey: string;
  enabled: boolean;
  matchCount: number;
  matchThreshold: number;
  maxContextCharacters: number;
}

export interface RagDocumentMetadata {
  canReindex?: boolean;
  characterCount?: number;
  chunkCount?: number;
  excerpt?: string;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  importedAt?: string;
  indexedAt?: string;
  mimeType?: string | null;
  originalText?: string;
  reindexedAt?: string;
}

export interface RagKnowledgeBase {
  created_at: string;
  description: string | null;
  id: string;
  name: string;
  updated_at: string;
  user_id: string;
}

export interface RagDocument {
  content_hash: string | null;
  created_at: string;
  id: string;
  knowledge_base_id: string;
  metadata: RagDocumentMetadata;
  source: string | null;
  title: string;
  updated_at: string;
}

export interface RetrievedRagChunk {
  content: string;
  documentId: string;
  documentTitle: string;
  id: string;
  knowledgeBaseId: string;
  metadata: Record<string, unknown>;
  score: number;
  source: string | null;
}

export interface RagSourceItem {
  content: string;
  documentId: string;
  documentTitle: string;
  id: string;
  score: number;
  source: string | null;
}
