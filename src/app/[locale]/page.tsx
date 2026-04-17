import type { Metadata } from 'next';
import { ChatShellPage } from '@/features/chat/pages/chat-shell-page';
import { normalizeLocale } from '@/config/i18n';
import { createPageMetadata, getSeoCopy } from '@/config/seo';

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    conversation?: string;
    id?: string;
  }>;
};

export async function generateMetadata({
  params,
}: Pick<HomePageProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const copy = getSeoCopy(normalizedLocale);

  return createPageMetadata({
    description: copy.description,
    locale: normalizedLocale,
    title: copy.homeTitle,
  });
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { conversation, id } = await searchParams;

  return <ChatShellPage conversationId={id ?? conversation ?? null} />;
}
