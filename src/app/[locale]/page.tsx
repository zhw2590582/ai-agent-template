import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type HomePageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  return <ChatShellPage searchParams={searchParams} />;
}
