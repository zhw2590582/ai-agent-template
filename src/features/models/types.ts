export type ModelApiFormat = 'anthropic' | 'openai';
export type ModelCapability = 'audio' | 'chat' | 'embedding' | 'image' | 'moderation' | 'unknown';

export interface ProviderModelItem {
  capabilities?: ModelCapability[];
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

export interface ChatRuntimeModel {
  apiFormat: ModelApiFormat;
  apiKey: string;
  baseUrl: string;
  modelId: string;
  providerId: string;
}

export interface ChatModelOption {
  capabilities?: ModelCapability[];
  id: string;
  modelId: string;
  providerId: string;
  providerName: string;
  title: string;
}

export interface ProviderProbeResult {
  latencyMs: number;
  models: Array<Pick<ProviderModelItem, 'capabilities' | 'id' | 'name'>>;
}
