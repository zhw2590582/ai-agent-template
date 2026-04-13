import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { getSupabaseAdminEnv } from '@/config/env';
import type { Database } from '@/lib/supabase/database.types';

export function createAdminClient() {
  const { serviceRoleKey, url } = getSupabaseAdminEnv();

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
