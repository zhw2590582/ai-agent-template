import type { User } from '@supabase/supabase-js';

type ProfilesClient = {
  from: (table: 'profiles') => unknown;
};

type ProfilesTable = {
  upsert: (
    values: {
      avatar_url: string | null;
      display_name: string | null;
      email: string | null;
      id: string;
      locale: string | null;
    },
    options: { onConflict: 'id' }
  ) => PromiseLike<unknown>;
};

export async function upsertProfileFromAuthUser(
  user: User,
  options: {
    locale?: string;
  },
  client: ProfilesClient
) {
  const profiles = client.from('profiles') as ProfilesTable;

  return profiles.upsert(
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
