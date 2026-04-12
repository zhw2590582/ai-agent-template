import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ui-settings/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { isSupabaseConfigured } from '@/config/env';
import { SUPPORTED_LOCALES } from '@/config/i18n';
import { AuthUserProvider } from '@/features/auth/components/auth-user-provider';
import { toAuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { THEME_COOKIE_KEY, type ThemeMode } from '@/config/app';
import type { Locale } from '@/config/i18n';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Agent Template',
  description: 'A general AI agent chat interface built with Next.js and AI SDK.',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // 验证 locale 是否支持
  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  // 获取翻译消息
  const messages = await getMessages();
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const theme: ThemeMode = storedTheme === 'light' ? 'light' : 'dark';
  const authUser = isSupabaseConfigured()
    ? toAuthUserSnapshot((await (await createSupabaseServerClient()).auth.getUser()).data.user)
    : null;

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
