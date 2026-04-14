import type { ProfileRecord } from '@/features/auth/storage/types';
import type { ModelsSettings } from '@/features/models/types';
import type { SearchSettings } from '@/features/search/types';

export interface MemorySettings {
  autoWrite: boolean;
  contextMaxItems: number;
  crossConversation: boolean;
  enabled: boolean;
  recentMessageWindow: number;
  summaryMinMessages: number;
}

export interface AppProfileSettings {
  memory: MemorySettings;
  models: ModelsSettings;
  search: SearchSettings;
}

export interface AppProfile extends Omit<ProfileRecord, 'settings'> {
  settings: AppProfileSettings;
}
