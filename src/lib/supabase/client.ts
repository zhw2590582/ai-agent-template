import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv, isSupabaseConfigured } from '@/config/env';

import type { Database } from '@/lib/supabase/database.types';

export function isSupabaseBrowserConfigured() {
  return isSupabaseConfigured();
}

export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();

  return createBrowserClient<Database>(url, publishableKey);
}
