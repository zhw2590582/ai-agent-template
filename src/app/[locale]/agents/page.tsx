import { getLocale, getTranslations } from 'next-intl/server';

import { PlaceholderPage } from '@/components/placeholder-page';

export default async function AgentsPage() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);

  return (
    <PlaceholderPage
      backHref={`/${locale}`}
      backLabel={t('common.back_to_chat')}
      description={t('placeholders.agents.description')}
      eyebrow={t('navigation.agents')}
      title={t('placeholders.agents.title')}
    />
  );
}
