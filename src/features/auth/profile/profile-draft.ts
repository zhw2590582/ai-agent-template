import type { ThemeMode } from '@/config/theme';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import type { AppProfile } from '@/features/models/types';
import { createProfileDraft as createBaseProfileDraft } from '@/features/models/utils/provider-factories';
import { normalizeProfileSettings } from '@/features/auth/profile/profile-settings';

export function createProfileDraft(options: {
  existing?: Partial<AppProfile>;
  locale: string;
  theme: ThemeMode;
  user: AuthUserSnapshot | null;
}): AppProfile {
  const profile = createBaseProfileDraft(options);

  return {
    ...profile,
    settings: normalizeProfileSettings(options.existing?.settings),
  };
}
