import { loadChatPageData } from '@/features/chat/lib/chat-page-data';
import { ChatHomePage } from '@/features/chat/pages/chat-home-page';

type ChatShellPageProps = {
  activeView?: Parameters<typeof ChatHomePage>[0]['activeView'];
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export async function ChatShellPage({ activeView, searchParams }: ChatShellPageProps) {
  const { conversation, id } = await searchParams;
  const pageData = await loadChatPageData(id ?? conversation);

  return (
    <ChatHomePage
      activeView={activeView}
      initialConversationId={pageData.conversationId}
      initialConversations={pageData.conversations}
      initialConversationsHasMore={pageData.conversationsHasMore}
      invalidConversationId={pageData.invalidConversationId}
      initialMessages={pageData.messages}
    />
  );
}
