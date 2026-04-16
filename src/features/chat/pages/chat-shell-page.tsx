import { isSupabaseConfigured } from '@/config/env';
import { loadChatPageData } from '@/features/chat/data/chat-page-data';
import { ChatHomePage } from '@/features/chat/pages/chat-home-page';

type ChatShellPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export async function ChatShellPage({ searchParams }: ChatShellPageProps) {
  const { conversation, id } = await searchParams;
  const pageData = await loadChatPageData(id ?? conversation);

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
