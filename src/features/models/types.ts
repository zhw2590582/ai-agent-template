import type { ProfileRecord } from '@/features/auth/storage/types';

export type ModelApiFormat = 'anthropic' | 'openai';

export interface ProviderModelItem {
  enabled: boolean;
  id: string;
  isCustom?: boolean;
  name: string;
}

export interface ProviderPreset {
  apiFormat: ModelApiFormat;
  defaultBaseUrl: string;
  docsUrl: string;
  id: string;
  logoId?: string;
  monogram: string;
  name: string;
}

export interface ProviderSettings {
  apiFormat: ModelApiFormat;
  apiKey: string;
  baseUrl: string;
  defaultBaseUrl: string;
  docsUrl: string | null;
  enabled: boolean;
  id: string;
  isCustom?: boolean;
  logoId?: string | null;
  monogram: string;
  models: ProviderModelItem[];
  name: string;
}

export interface ModelsSettings {
  selectedChatModelId: string | null;
  providers: Record<string, ProviderSettings>;
  selectedProviderId: string;
}

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
}

export interface AppProfile extends Omit<ProfileRecord, 'settings'> {
  settings: AppProfileSettings;
}

export interface ChatRuntimeModel {
  apiFormat: ModelApiFormat;
  apiKey: string;
  baseUrl: string;
  modelId: string;
  providerId: string;
}

export interface ChatModelOption {
  id: string;
  modelId: string;
  providerId: string;
  providerName: string;
  title: string;
}

export interface ProviderProbeResult {
  latencyMs: number;
  models: Array<Pick<ProviderModelItem, 'id' | 'name'>>;
}
