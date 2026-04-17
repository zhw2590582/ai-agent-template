import type { Metadata } from 'next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@/config/i18n';

const APP_NAME = 'AI Agent Template';
const APP_TITLE_TEMPLATE = `%s | ${APP_NAME}`;
const DEFAULT_IMAGE_PATH = '/opengraph-image';
const DEFAULT_TWITTER_IMAGE_PATH = '/twitter-image';

type LocalizedSeoCopy = {
  description: string;
  homeTitle: string;
  localeCode: string;
  privacyDescription: string;
  privacyTitle: string;
  termsDescription: string;
  termsTitle: string;
};

const SEO_COPY: Record<Locale, LocalizedSeoCopy> = {
  'en-US': {
    description:
      'Open-source AI agent template built with Next.js and AI SDK, featuring local-first chat, Memory, Search, Sandbox, RAG, MCP, and Subagents.',
    homeTitle: 'Open Source AI Agent Template',
    localeCode: 'en_US',
    privacyDescription:
      'Privacy policy for the AI Agent Template preview, including data flow, local-first storage, and third-party provider usage.',
    privacyTitle: 'Privacy Policy',
    termsDescription:
      'Terms for using the AI Agent Template preview, including account usage, provider responsibility, and third-party services.',
    termsTitle: 'Terms of Service',
  },
  'zh-CN': {
    description:
      '一个基于 Next.js 和 AI SDK 的开源 AI Agent 模板，包含 local-first 聊天、Memory、Search、Sandbox、RAG、MCP 和 Subagents。',
    homeTitle: '开源 AI Agent 模板',
    localeCode: 'zh_CN',
    privacyDescription:
      'AI Agent Template 预览版的隐私政策，说明数据流向、本地优先存储方式以及第三方模型服务的使用边界。',
    privacyTitle: '隐私政策',
    termsDescription:
      'AI Agent Template 预览版的服务条款，说明账号使用、第三方 provider 配置责任与外部服务边界。',
    termsTitle: '服务条款',
  },
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function normalizeHostLikeUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return trimTrailingSlash(value);
  }

  return `https://${trimTrailingSlash(value)}`;
}

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (explicit) {
    return normalizeHostLikeUrl(explicit);
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return normalizeHostLikeUrl(vercelUrl);
  }

  return 'http://localhost:3000';
}

export function getAbsoluteUrl(pathname = '/') {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(normalizedPath, getSiteUrl()).toString();
}

export function getLocaleUrl(locale: Locale, pathname = '') {
  const normalizedPath = pathname ? (pathname.startsWith('/') ? pathname : `/${pathname}`) : '';
  return getAbsoluteUrl(`/${locale}${normalizedPath}`);
}

export function getLocaleAlternates(pathname = '') {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, getLocaleUrl(locale, pathname)])
  );
}

export function getSeoCopy(locale: Locale) {
  return SEO_COPY[locale] ?? SEO_COPY[DEFAULT_LOCALE];
}

export function createLocaleLayoutMetadata(locale: Locale): Metadata {
  const copy = getSeoCopy(locale);
  const siteUrl = getSiteUrl();
  const imageUrl = getAbsoluteUrl(DEFAULT_IMAGE_PATH);
  const twitterImageUrl = getAbsoluteUrl(DEFAULT_TWITTER_IMAGE_PATH);

  return {
    applicationName: APP_NAME,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: APP_NAME,
    },
    category: 'technology',
    description: copy.description,
    formatDetection: {
      telephone: false,
    },
    keywords: [
      'AI agent template',
      'Next.js AI template',
      'AI SDK template',
      'open source AI chat',
      'local-first AI app',
      'RAG template',
      'subagents template',
    ],
    metadataBase: new URL(siteUrl),
    openGraph: {
      description: copy.description,
      images: [
        {
          alt: `${APP_NAME} share image`,
          height: 630,
          url: imageUrl,
          width: 1200,
        },
      ],
      locale: copy.localeCode,
      siteName: APP_NAME,
      title: copy.homeTitle,
      type: 'website',
      url: getLocaleUrl(locale),
    },
    title: {
      default: APP_NAME,
      template: APP_TITLE_TEMPLATE,
    },
    twitter: {
      card: 'summary_large_image',
      description: copy.description,
      images: [twitterImageUrl],
      title: copy.homeTitle,
    },
  };
}

type PageSeoMetadataOptions = {
  description: string;
  locale: Locale;
  pathname?: string;
  title: string;
};

export function createPageMetadata({
  description,
  locale,
  pathname = '',
  title,
}: PageSeoMetadataOptions): Metadata {
  const copy = getSeoCopy(locale);
  const imageUrl = getAbsoluteUrl(DEFAULT_IMAGE_PATH);
  const twitterImageUrl = getAbsoluteUrl(DEFAULT_TWITTER_IMAGE_PATH);
  const url = getLocaleUrl(locale, pathname);

  return {
    alternates: {
      canonical: url,
      languages: getLocaleAlternates(pathname),
    },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: `${APP_NAME} share image`,
          height: 630,
          url: imageUrl,
          width: 1200,
        },
      ],
      locale: copy.localeCode,
      siteName: APP_NAME,
      title,
      type: 'website',
      url,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [twitterImageUrl],
      title,
    },
  };
}

export { APP_NAME };
