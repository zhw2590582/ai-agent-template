import type { User } from '@supabase/supabase-js';

import type { ProfileRecord } from '@/server/storage/types';

export async function upsertProfileFromAuthUser(
  user: User,
  options: {
    locale?: string;
  },
  client: {
    from: (table: 'profiles') => any;
  }
) {
  return client.from('profiles').upsert(
    {
      avatar_url:
        typeof user.user_metadata.avatar_url === 'string' ? user.user_metadata.avatar_url : null,
      display_name:
        typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : null,
      email: user.email ?? null,
      id: user.id,
      locale: options.locale ?? null,
    },
    { onConflict: 'id' }
  );
}
