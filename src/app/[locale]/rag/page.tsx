import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type RagPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function RagPage({ searchParams }: RagPageProps) {
  return <ChatShellPage activeView="rag" searchParams={searchParams} />;
}
