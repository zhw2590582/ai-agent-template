import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type MemoryPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function MemoryPage({ searchParams }: MemoryPageProps) {
  return <ChatShellPage activeView="memory" searchParams={searchParams} />;
}
