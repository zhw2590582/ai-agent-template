import { API_ROUTES } from '@/config/api';
import { CONVERSATION_SUMMARY_PAGE_SIZE } from '@/config/chat';
import type { ConversationSummary } from '@/features/chat/storage/types';

export interface ConversationSummaryPageResult {
  conversations: ConversationSummary[];
  total: number;
}

export async function fetchConversationSummaryPage(options: {
  offset: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<ConversationSummaryPageResult> {
  const params = new URLSearchParams({
    limit: String(options.limit ?? CONVERSATION_SUMMARY_PAGE_SIZE),
    offset: String(options.offset),
  });

  const response = await fetch(`${API_ROUTES.conversationSummaries}?${params.toString()}`, {
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error('Failed to load conversation summaries');
  }

  return response.json() as Promise<ConversationSummaryPageResult>;
}
