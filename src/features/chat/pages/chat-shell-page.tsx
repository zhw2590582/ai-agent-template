import { isSupabaseConfigured } from '@/config/env';
import { loadChatPageData } from '@/features/chat/data/chat-page-data';
import { ChatHomePage } from '@/features/chat/pages/chat-home-page';

type ChatShellPageProps = {
  conversationId?: string | null;
};

export async function ChatShellPage({ conversationId = null }: ChatShellPageProps) {
  const pageData = await loadChatPageData(conversationId ?? undefined);

  return (
    <ChatHomePage
      initialConversationId={pageData.conversationId}
      initialConversations={pageData.conversations}
      initialConversationsHasMore={pageData.conversationsHasMore}
      invalidConversationId={pageData.invalidConversationId}
      initialMemories={pageData.memories}
      initialMessages={pageData.messages}
      supabaseConfigured={isSupabaseConfigured()}
    />
  );
}
