import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type ProvidersPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function ProvidersPage({ searchParams }: ProvidersPageProps) {
  return <ChatShellPage activeView="providers" searchParams={searchParams} />;
}
