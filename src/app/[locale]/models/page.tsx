import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type ModelsPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function ModelsRoutePage({ searchParams }: ModelsPageProps) {
  return <ChatShellPage activeView="models" searchParams={searchParams} />;
}
