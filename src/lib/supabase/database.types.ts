/**
 * Supabase Database type definitions.
 *
 * Derived from the SQL schema in supabase/migrations/20260412_profiles_conversations.sql
 * and supabase/migrations/20260413_memory_v1.sql
 * and supabase/migrations/20260415_rag_v1.sql.
 * When the schema changes, update this file to match.
 * If supabase CLI is configured, regenerate with: npx supabase gen types typescript --local
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          locale: string | null;
          theme: string | null;
          settings: Record<string, unknown>;
          memory_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string | null;
          theme?: string | null;
          settings?: Record<string, unknown>;
          memory_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string | null;
          theme?: string | null;
          settings?: Record<string, unknown>;
          memory_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          messages: unknown[]; // UIMessage[] at runtime
          analysis: Record<string, unknown>;
          summary: string | null;
          summary_updated_at: string | null;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          messages?: unknown[];
          analysis?: Record<string, unknown>;
          summary?: string | null;
          summary_updated_at?: string | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          messages?: unknown[];
          analysis?: Record<string, unknown>;
          summary?: string | null;
          summary_updated_at?: string | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      memories: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string | null;
          kind: string;
          content: string;
          source: string;
          status: string;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id?: string | null;
          kind: string;
          content: string;
          source?: string;
          status?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conversation_id?: string | null;
          kind?: string;
          content?: string;
          source?: string;
          status?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      rag_knowledge_bases: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rag_documents: {
        Row: {
          id: string;
          knowledge_base_id: string;
          title: string;
          source: string | null;
          content_hash: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          knowledge_base_id: string;
          title: string;
          source?: string | null;
          content_hash?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          knowledge_base_id?: string;
          title?: string;
          source?: string | null;
          content_hash?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      rag_chunks: {
        Row: {
          id: string;
          document_id: string;
          chunk_index: number;
          content: string;
          metadata: Record<string, unknown>;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          chunk_index: number;
          content: string;
          metadata?: Record<string, unknown>;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          chunk_index?: number;
          content?: string;
          metadata?: Record<string, unknown>;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
