import type { User } from '@supabase/supabase-js';
import type { ProfileRecord } from '@/features/auth/storage/types';

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
  select: (columns: string) => {
    eq: (
      column: 'id',
      value: string
    ) => {
      single: () => PromiseLike<{ data: ProfileRecord | null; error: unknown }>;
    };
  };
  update: (values: { settings: Record<string, unknown> }) => {
    eq: (column: 'id', value: string) => PromiseLike<{ error: unknown }>;
  };
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

export async function getProfileById(id: string, client: ProfilesClient) {
  const profiles = client.from('profiles') as ProfilesTable;
  const { data, error } = await profiles
    .select(
      'id, email, display_name, avatar_url, locale, theme, settings, memory_summary, created_at, updated_at'
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfileSettings(
  id: string,
  settings: Record<string, unknown>,
  client: ProfilesClient
) {
  const profiles = client.from('profiles') as ProfilesTable;
  const { error } = await profiles.update({ settings }).eq('id', id);

  if (error) {
    throw error;
  }
}
