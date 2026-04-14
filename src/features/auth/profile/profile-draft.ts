import type { ThemeMode } from '@/config/theme';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { normalizeProfileSettings } from '@/features/auth/profile/profile-settings';
import type { AppProfile } from '@/features/auth/profile/types';

export function createProfileDraft(options: {
  existing?: Partial<AppProfile>;
  locale: string;
  theme: ThemeMode;
  user: AuthUserSnapshot | null;
}): AppProfile {
  const now = new Date().toISOString();

  return {
    avatar_url: options.existing?.avatar_url ?? options.user?.avatarUrl ?? null,
    created_at: options.existing?.created_at ?? now,
    display_name: options.existing?.display_name ?? options.user?.fullName ?? null,
    email: options.existing?.email ?? options.user?.email ?? null,
    id: options.existing?.id ?? options.user?.id ?? 'guest-local',
    locale: options.existing?.locale ?? options.locale,
    memory_summary: options.existing?.memory_summary ?? null,
    settings: normalizeProfileSettings(options.existing?.settings),
    theme: options.existing?.theme ?? options.theme,
    updated_at: now,
  };
}
