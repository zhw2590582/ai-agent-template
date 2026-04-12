import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type SkillsPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  return <ChatShellPage activeView="skills" searchParams={searchParams} />;
}
