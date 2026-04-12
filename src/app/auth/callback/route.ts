import { NextResponse } from 'next/server';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@/config/i18n';
import { createClient } from '@/lib/supabase/server';
import { upsertProfileFromAuthUser } from '@/server/storage/profiles';

function getSafeNext(nextParam: string | null) {
  if (!nextParam || !nextParam.startsWith('/')) {
    return `/${DEFAULT_LOCALE}`;
  }

  return nextParam;
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
  }

  const locale = getLocaleFromPath(next);
  const errorRedirectUrl = new URL(`/${locale}/login`, origin);
  errorRedirectUrl.searchParams.set('error', 'oauth_callback');

  return NextResponse.redirect(errorRedirectUrl);
}
