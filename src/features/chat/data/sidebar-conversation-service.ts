import { API_ROUTES } from '@/config/api';
import { CONVERSATION_SIDEBAR_PAGE_SIZE } from '@/config/chat';
import type { ConversationSummary } from '@/features/chat/storage/types';

export interface ConversationPageResult {
  conversations: ConversationSummary[];
  hasMore: boolean;
}

export async function fetchConversationPage(options: {
  offset: number;
  limit?: number;
  query?: string;
  signal?: AbortSignal;
}): Promise<ConversationPageResult> {
  const params = new URLSearchParams({
    limit: String(options.limit ?? CONVERSATION_SIDEBAR_PAGE_SIZE),
    offset: String(options.offset),
  });

  if (options.query) {
    params.set('query', options.query);
  }

  const response = await fetch(`${API_ROUTES.conversations}?${params.toString()}`, {
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error('Failed to load conversations');
  }

  return response.json() as Promise<ConversationPageResult>;
}
