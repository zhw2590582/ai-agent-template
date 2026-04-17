import { NextResponse, type NextRequest } from 'next/server';

import { isSupabaseConfigured } from '@/config/env';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@/config/i18n';
import { createClient } from '@/lib/supabase/server';

function getSafeNext(nextParam: string | null) {
  if (!nextParam || !nextParam.startsWith('/')) {
    return `/${DEFAULT_LOCALE}`;
  }

  if (nextParam.startsWith('//') || nextParam.includes('://')) {
    return `/${DEFAULT_LOCALE}`;
  }

  const isAllowed = SUPPORTED_LOCALES.some(
    (locale) => nextParam === `/${locale}` || nextParam.startsWith(`/${locale}/`)
  );

  return isAllowed ? nextParam : `/${DEFAULT_LOCALE}`;
}

function getLocaleFromPath(pathname: string): Locale {
  return (
    SUPPORTED_LOCALES.find(
      (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    ) ?? DEFAULT_LOCALE
  );
}

export async function GET(request: NextRequest) {
  const next = getSafeNext(request.nextUrl.searchParams.get('next'));

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const locale = getLocaleFromPath(next);
  return NextResponse.redirect(new URL(next || `/${locale}`, request.url));
}
