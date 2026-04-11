import { getLocale, getTranslations } from 'next-intl/server';

import { PlaceholderPage } from '@/components/placeholder-page';

export default async function PluginsPage() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);

  return (
    <PlaceholderPage
      backHref={`/${locale}`}
      backLabel={t('common.back_to_chat')}
      description={t('placeholders.plugins.description')}
      eyebrow={t('navigation.plugins')}
      title={t('placeholders.plugins.title')}
    />
  );
}
