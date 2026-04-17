import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type ChatConversationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatConversationPage({ params }: ChatConversationPageProps) {
  const { id } = await params;

  return <ChatShellPage conversationId={id} />;
}
