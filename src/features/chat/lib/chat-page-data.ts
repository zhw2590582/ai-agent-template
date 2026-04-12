import type { UIMessage } from 'ai';

import { isSupabaseConfigured } from '@/config/env';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {
  getConversationById,
  listConversationsForUser,
  mapConversationSummary,
} from '@/server/storage/conversations';
import type { ConversationSummary } from '@/server/storage/types';

export interface ChatPageData {
  conversationId: string | null;
  conversations: ConversationSummary[];
  messages: UIMessage[];
}

export async function loadChatPageData(conversationId?: string): Promise<ChatPageData> {
  if (!isSupabaseConfigured()) {
    return {
      conversationId: null,
      conversations: [],
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
      messages: [],
    };
  }

  const conversations = (await listConversationsForUser(user.id, supabase)).map(mapConversationSummary);
  const activeConversation =
    conversationId != null ? await getConversationById(conversationId, supabase) : null;

  return {
    conversationId: activeConversation?.id ?? null,
    conversations,
    messages: activeConversation?.messages ?? [],
  };
}
