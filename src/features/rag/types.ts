export interface RagSettings {
  apiKey: string;
  enabled: boolean;
  matchCount: number;
  matchThreshold: number;
  maxContextCharacters: number;
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
  metadata: Record<string, unknown>;
  source: string | null;
  title: string;
  updated_at: string;
}

export interface RagChunkRecord {
  chunk_index: number;
  content: string;
  created_at: string;
  document_id: string;
  embedding: number[] | null;
  id: string;
  metadata: Record<string, unknown>;
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
