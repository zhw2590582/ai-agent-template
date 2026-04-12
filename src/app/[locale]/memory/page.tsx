import { loadChatPageData } from '@/features/chat/lib/chat-page-data';
import { ChatHomePage } from '@/features/chat/pages/chat-home-page';

type MemoryPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function MemoryPage({ searchParams }: MemoryPageProps) {
  const { conversation, id } = await searchParams;
  const pageData = await loadChatPageData(id ?? conversation);

  return (
    <ChatHomePage
      activeView="memory"
      initialConversationId={pageData.conversationId}
      initialConversations={pageData.conversations}
      initialConversationsHasMore={pageData.conversationsHasMore}
      initialMessages={pageData.messages}
    />
  );
}
