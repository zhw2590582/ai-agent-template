/**
 * Supabase Database type definitions.
 *
 * Derived from the SQL schema in supabase/migrations/20260412_profiles_conversations.sql.
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
          last_message_at?: string;
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
