import { getLocale, getTranslations } from 'next-intl/server';

import { PlaceholderPage } from '@/components/placeholder-page';

export default async function SkillsPage() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);

  return (
    <PlaceholderPage
      backHref={`/${locale}`}
      backLabel={t('common.back_to_chat')}
      description={t('placeholders.skills.description')}
      eyebrow={t('navigation.skills')}
      title={t('placeholders.skills.title')}
    />
  );
}
