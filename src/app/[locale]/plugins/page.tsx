import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type PluginsPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function PluginsPage({ searchParams }: PluginsPageProps) {
  return <ChatShellPage activeView="sandbox" searchParams={searchParams} />;
}
