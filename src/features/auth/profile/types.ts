import type { ProfileRecord } from '@/features/auth/storage/types';
import type { McpSettings } from '@/features/mcp/types';
import type { ModelsSettings } from '@/features/models/types';
import type { RagSettings } from '@/features/rag/types';
import type { SandboxSettings } from '@/features/sandbox/types';
import type { SearchSettings } from '@/features/search/types';
import type { SkillsSettings } from '@/features/skills/types';

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
  mcp: McpSettings;
  models: ModelsSettings;
  rag: RagSettings;
  sandbox: SandboxSettings;
  search: SearchSettings;
  skills: SkillsSettings;
}

export interface AppProfile extends Omit<ProfileRecord, 'settings'> {
  settings: AppProfileSettings;
}
