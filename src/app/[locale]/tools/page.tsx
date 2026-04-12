import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type ToolsPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  return <ChatShellPage activeView="mcp" searchParams={searchParams} />;
}
