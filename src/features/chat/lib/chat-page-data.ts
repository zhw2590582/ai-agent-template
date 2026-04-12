import type { UIMessage } from 'ai';

import { CONVERSATION_SIDEBAR_PAGE_SIZE } from '@/config/conversations';
import { isSupabaseConfigured } from '@/config/env';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {
  getConversationById,
  listConversationsForUserPage,
  mapConversationSummary,
} from '@/server/storage';
import type { ConversationSummary } from '@/server/storage/types';

export interface ChatPageData {
  conversationId: string | null;
  conversations: ConversationSummary[];
  /** Whether more conversations exist beyond `conversations` (sidebar infinite scroll). */
  conversationsHasMore: boolean;
  invalidConversationId: boolean;
  messages: UIMessage[];
}

export async function loadChatPageData(conversationId?: string): Promise<ChatPageData> {
  if (!isSupabaseConfigured()) {
    return {
      conversationId: null,
      conversations: [],
      conversationsHasMore: false,
      invalidConversationId: false,
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
      messages: [],
    };
  }

  const { hasMore, rows } = await listConversationsForUserPage(user.id, supabase, {
    limit: CONVERSATION_SIDEBAR_PAGE_SIZE,
    offset: 0,
  });
  const conversations = rows.map(mapConversationSummary);
  const activeConversation =
    conversationId != null ? await getConversationById(conversationId, supabase) : null;

  return {
    conversationId: activeConversation?.id ?? null,
    conversations,
    conversationsHasMore: hasMore,
    invalidConversationId: Boolean(conversationId && !activeConversation),
    messages: activeConversation?.messages ?? [],
  };
}
