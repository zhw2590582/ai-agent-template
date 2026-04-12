import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type SearchPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  return <ChatShellPage activeView="search" searchParams={searchParams} />;
}
