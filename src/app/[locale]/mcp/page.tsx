import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type McpPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function McpPage({ searchParams }: McpPageProps) {
  return <ChatShellPage activeView="mcp" searchParams={searchParams} />;
}
