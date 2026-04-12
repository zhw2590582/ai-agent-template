import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type AgentsPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  return <ChatShellPage activeView="agents" searchParams={searchParams} />;
}
