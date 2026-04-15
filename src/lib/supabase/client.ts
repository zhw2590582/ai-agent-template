import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/config/env';

import type { Database } from '@/lib/supabase/database.types';

function getSupabaseBrowserEnv() {
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function isSupabaseBrowserConfigured() {
  const { url, publishableKey } = getSupabaseBrowserEnv();

  return Boolean(url && publishableKey);
}

export function createClient() {
  const { url, publishableKey } = getSupabaseBrowserEnv();

  if (!url || !publishableKey) {
    throw new Error(
      'Supabase browser configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  return createBrowserClient<Database>(url, publishableKey);
}
