import { getLocale, getTranslations } from 'next-intl/server';

import { PlaceholderPage } from '@/components/placeholder-page';

export default async function LoginPage() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);

  return (
    <PlaceholderPage
      backHref={`/${locale}`}
      backLabel={t('common.back_to_chat')}
      description={t('auth.description')}
      eyebrow={t('auth.sign_in')}
      title={t('auth.title')}
    />
  );
}
