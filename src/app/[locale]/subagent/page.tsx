import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type SubagentPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function SubagentPage({ searchParams }: SubagentPageProps) {
  return <ChatShellPage activeView="subagent" searchParams={searchParams} />;
}
