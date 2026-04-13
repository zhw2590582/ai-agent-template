export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en-US';

export const LOCALE_CONFIG: Record<Locale, { name: string; flag: string }> = {
  'zh-CN': {
    name: '简体中文',
    flag: '🇨🇳',
  },
  'en-US': {
    name: 'English',
    flag: '🇺🇸',
  },
};

export const LOCALE_DETECTION_STRATEGY = {
  urlParam: 'lang',
  cookieName: 'NEXT_LOCALE',
  useAcceptLanguage: true,
  fallback: DEFAULT_LOCALE,
} as const;

export function isSupportedLocale(locale: string | null | undefined): locale is Locale {
  return !!locale && SUPPORTED_LOCALES.includes(locale as Locale);
}

export function normalizeLocale(locale: string | null | undefined): Locale {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}
