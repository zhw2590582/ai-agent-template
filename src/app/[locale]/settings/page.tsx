import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';

type SettingsPageProps = {
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  return <ChatShellPage activeView="settings" searchParams={searchParams} />;
}
