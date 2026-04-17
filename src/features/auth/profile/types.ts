import type { ProfileRecord } from '@/features/auth/storage/types';
import type { AppProfileSettings } from '@/features/settings/types';

export type { AppProfileSettings, MemorySettings } from '@/features/settings/types';

export interface AppProfile extends Omit<ProfileRecord, 'settings'> {
  settings: AppProfileSettings;
}
