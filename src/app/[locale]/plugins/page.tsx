import { loadChatPageData } from '@/features/chat/lib/chat-page-data';
import { ChatHomePage } from '@/features/chat/pages/chat-home-page';

type PluginsPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function PluginsPage({ searchParams }: PluginsPageProps) {
  const { conversation, id } = await searchParams;
  const pageData = await loadChatPageData(id ?? conversation);

  return (
    <ChatHomePage
      activeView="sandbox"
      initialConversationId={pageData.conversationId}
      initialConversations={pageData.conversations}
      initialConversationsHasMore={pageData.conversationsHasMore}
      initialMessages={pageData.messages}
    />
  );
}
