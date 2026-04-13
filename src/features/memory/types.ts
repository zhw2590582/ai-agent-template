import type { Tables } from '@/lib/supabase/database.types';

export type MemoryRecord = Tables<'memories'>;
export type MemoryKind = 'fact' | 'manual' | 'preference' | 'profile' | 'workflow';

/**
 * Canonical memory kinds used across extraction, editing, merge, and injection.
 *
 * - `manual`: user-authored memory that should never be auto-overwritten.
 * - `preference`: stable stylistic or behavioral preferences.
 * - `profile`: durable identity/background information about the user.
 * - `workflow`: default tools, stacks, or repeated working patterns.
 * - `fact`: other stable facts that do not clearly fit the categories above.
 */
export const MEMORY_KINDS = [
  'preference',
  'profile',
  'workflow',
  'fact',
  'manual',
] as const satisfies readonly MemoryKind[];

export function isMemoryKind(value: string): value is MemoryKind {
  return (MEMORY_KINDS as readonly string[]).includes(value);
}

export interface MemoryListItem {
  content: string;
  conversationId: string | null;
  id: string;
  kind: MemoryKind;
  source: string;
  updatedAt: string;
}
