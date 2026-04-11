import { getLocale, getTranslations } from 'next-intl/server';

import { PlaceholderPage } from '@/components/placeholder-page';

export default async function ToolsPage() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);

  return (
    <PlaceholderPage
      backHref={`/${locale}`}
      backLabel={t('common.back_to_chat')}
      description={t('placeholders.tools.description')}
      eyebrow={t('navigation.tools')}
      title={t('placeholders.tools.title')}
    />
  );
}
