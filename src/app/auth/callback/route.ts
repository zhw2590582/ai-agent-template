import { NextResponse } from 'next/server';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@/config/i18n';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { upsertProfileFromAuthUser } from '@/server/storage';

function getSafeNext(nextParam: string | null) {
  if (!nextParam || !nextParam.startsWith('/')) {
    return `/${DEFAULT_LOCALE}`;
  }

  // Block protocol-relative URLs (e.g. //attacker.com) and embedded protocols
  if (nextParam.startsWith('//') || nextParam.includes('://')) {
    return `/${DEFAULT_LOCALE}`;
  }

  // Only allow paths under known locales
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

function getRedirectOrigin(request: Request, origin: string) {
  if (process.env.NODE_ENV === 'development') {
    return origin;
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';

  if (!forwardedHost) {
    return origin;
  }

  return `${forwardedProto}://${forwardedHost}`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeNext(requestUrl.searchParams.get('next'));
  const origin = getRedirectOrigin(request, requestUrl.origin);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (data.user) {
        await upsertProfileFromAuthUser(data.user, { locale: getLocaleFromPath(next) }, supabase);
      }

      return NextResponse.redirect(new URL(next, origin));
    }

    logger.error('OAuth code exchange failed', { error: error.message });
  }

  const locale = getLocaleFromPath(next);
  const errorRedirectUrl = new URL(`/${locale}/login`, origin);
  errorRedirectUrl.searchParams.set('error', 'oauth_callback');

  return NextResponse.redirect(errorRedirectUrl);
}
