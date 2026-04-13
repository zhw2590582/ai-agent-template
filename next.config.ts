import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const isSentryConfigured = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'models.dev',
      },
    ],
  },
};

const configuredNextConfig = withNextIntl(nextConfig);

export default isSentryConfigured
  ? withSentryConfig(configuredNextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      tunnelRoute: '/monitoring',
      widenClientFileUpload: true,
    })
  : configuredNextConfig;
