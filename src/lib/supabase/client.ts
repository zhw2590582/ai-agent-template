import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/supabase/database.types';

function getSupabaseBrowserEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
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
