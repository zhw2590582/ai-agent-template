import { getLocale, getTranslations } from 'next-intl/server';

import { PlaceholderPage } from '@/components/placeholder-page';

export default async function ProvidersPage() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);

  return (
    <PlaceholderPage
      backHref={`/${locale}`}
      backLabel={t('common.back_to_chat')}
      description={t('placeholders.providers.description')}
      eyebrow={t('navigation.providers')}
      title={t('placeholders.providers.title')}
    />
  );
}
