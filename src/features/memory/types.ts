import type { Tables } from '@/lib/supabase/database.types';

export type MemoryRecord = Tables<'memories'>;

export interface MemoryListItem {
  content: string;
  conversationId: string | null;
  id: string;
  kind: string;
  source: string;
  updatedAt: string;
}
