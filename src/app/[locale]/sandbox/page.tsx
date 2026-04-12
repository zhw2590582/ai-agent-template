import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type SandboxPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function SandboxPage({ searchParams }: SandboxPageProps) {
  return <ChatShellPage activeView="sandbox" searchParams={searchParams} />;
}
