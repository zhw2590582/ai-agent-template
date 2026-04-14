import type { UIMessage } from 'ai';
import { unstable_noStore as noStore } from 'next/cache';

import { CONVERSATION_SIDEBAR_PAGE_SIZE } from '@/config/chat';
import { isSupabaseConfigured } from '@/config/env';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {
  getConversationById,
  listConversationsForUserPage,
  mapConversationSummary,
} from '@/features/chat/storage';
import { listMemoriesForUser } from '@/features/memory/storage/memories';
import type { MemoryListItem } from '@/features/memory/types';
import type { ConversationSummary } from '@/features/chat/storage/types';

export interface ChatPageData {
  conversationId: string | null;
  conversations: ConversationSummary[];
  /** Whether more conversations exist beyond `conversations` (sidebar infinite scroll). */
  conversationsHasMore: boolean;
  invalidConversationId: boolean;
  memories: MemoryListItem[];
  messages: UIMessage[];
}

export async function loadChatPageData(conversationId?: string): Promise<ChatPageData> {
  noStore();

  if (!isSupabaseConfigured()) {
    return {
      conversationId: null,
      conversations: [],
      conversationsHasMore: false,
      invalidConversationId: false,
      memories: [],
      messages: [],
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      conversationId: null,
      conversations: [],
      conversationsHasMore: false,
      invalidConversationId: false,
      memories: [],
      messages: [],
    };
  }

  const { hasMore, rows } = await listConversationsForUserPage(user.id, supabase, {
    limit: CONVERSATION_SIDEBAR_PAGE_SIZE,
    offset: 0,
  });
  const memories = await listMemoriesForUser(user.id, supabase);
  const conversations = rows.map(mapConversationSummary);
  const activeConversation =
    conversationId != null ? await getConversationById(conversationId, supabase) : null;

  return {
    conversationId: activeConversation?.id ?? null,
    conversations,
    conversationsHasMore: hasMore,
    invalidConversationId: Boolean(conversationId && !activeConversation),
    memories,
    messages: activeConversation?.messages ?? [],
  };
}
