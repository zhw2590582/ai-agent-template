import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { getSupabaseEnv, isSupabaseConfigured } from '@/config/env';

export async function updateSession(request: NextRequest, response: NextResponse) {
  if (!isSupabaseConfigured()) {
    return response;
  }

  const { url, publishableKey } = getSupabaseEnv();
  type CookieOptions = Parameters<typeof response.cookies.set>[2];
  type SupabaseCookie = {
    name: string;
    value: string;
    options?: CookieOptions;
  };

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getClaims();

  return response;
}
