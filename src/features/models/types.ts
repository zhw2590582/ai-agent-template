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
  enabled: boolean;
  id: string;
  models: ProviderModelItem[];
}

export interface ModelsSettings {
  selectedChatModelId: string | null;
  providers: Record<string, ProviderSettings>;
  selectedProviderId: string;
}

export interface AppProfileSettings {
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
