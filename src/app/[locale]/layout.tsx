import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/features/chat/components/preferences/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SUPPORTED_LOCALES } from '@/config/i18n';
import { AuthUserProvider } from '@/features/auth/components/auth-user-provider';
import { getInitialAuthUserSnapshot } from '@/features/auth/server/session';
import { resolveThemeMode, THEME_COOKIE_KEY } from '@/config/theme';
import { createLocaleLayoutMetadata } from '@/config/seo';
import { normalizeLocale, type Locale } from '@/config/i18n';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: [
    { color: '#fafafa', media: '(prefers-color-scheme: light)' },
    { color: '#0f1115', media: '(prefers-color-scheme: dark)' },
  ],
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  return createLocaleLayoutMetadata(normalizeLocale(locale));
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const [messages, cookieStore, authUser] = await Promise.all([
    getMessages(),
    cookies(),
    getInitialAuthUserSnapshot(),
  ]);
  const theme = resolveThemeMode(cookieStore.get(THEME_COOKIE_KEY)?.value);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${theme} h-full antialiased`}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider initialTheme={theme} key={theme}>
            <AuthUserProvider initialUser={authUser}>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster position="top-center" />
            </AuthUserProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
