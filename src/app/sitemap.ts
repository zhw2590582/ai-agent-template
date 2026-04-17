import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES, type Locale } from '@/config/i18n';
import { getAbsoluteUrl, getLocaleAlternates, getLocaleUrl } from '@/config/seo';

function createLocaleEntry(locale: Locale, pathname = ''): MetadataRoute.Sitemap[number] {
  const isHome = pathname === '';

  return {
    alternates: {
      languages: getLocaleAlternates(pathname),
    },
    changeFrequency: isHome ? 'weekly' : 'monthly',
    images: isHome ? [getAbsoluteUrl('/opengraph-image')] : undefined,
    lastModified: new Date(),
    priority: isHome ? 1 : 0.4,
    url: getLocaleUrl(locale, pathname),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return SUPPORTED_LOCALES.flatMap((locale) => [
    createLocaleEntry(locale),
    createLocaleEntry(locale, '/privacy'),
    createLocaleEntry(locale, '/terms'),
  ]);
}
