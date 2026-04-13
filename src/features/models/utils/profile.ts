import { MODEL_PROVIDER_PRESETS } from '@/features/models/catalog';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import type {
  AppProfile,
  AppProfileSettings,
  ChatModelOption,
  ChatRuntimeModel,
  ModelsSettings,
  ProviderModelItem,
  ProviderSettings,
} from '@/features/models/types';
import type { ThemeMode } from '@/config/app';

function buildProviderModels(
  models: Array<Pick<ProviderModelItem, 'id' | 'name'>>,
  existing?: ProviderModelItem[]
) {
  if (!existing || existing.length === 0) {
    return models.map((model) => ({
      enabled: true,
      id: model.id,
      name: model.name,
    }));
  }

  return existing.map((model) => ({
    enabled: model.enabled ?? true,
    id: model.id,
    isCustom: model.isCustom ?? false,
    name: model.name,
  }));
}

function buildProviderSettings(
  preset: (typeof MODEL_PROVIDER_PRESETS)[number],
  existing?: Partial<ProviderSettings>
): ProviderSettings {
  return {
    apiFormat: existing?.apiFormat ?? preset.apiFormat,
    apiKey: existing?.apiKey ?? '',
    baseUrl: existing?.baseUrl ?? preset.defaultBaseUrl,
    enabled: existing?.enabled ?? preset.id === 'deepseek',
    id: preset.id,
    models: buildProviderModels(preset.models, existing?.models),
  };
}

function readExistingProviderSettings(input: unknown, providerId: string) {
  if (
    typeof input === 'object' &&
    input != null &&
    'models' in input &&
    typeof input.models === 'object' &&
    input.models != null &&
    'providers' in input.models &&
    typeof input.models.providers === 'object' &&
    input.models.providers != null &&
    providerId in input.models.providers
  ) {
    const providers = input.models.providers as Record<string, unknown>;
    return providers[providerId] as Partial<ProviderSettings>;
  }

  return undefined;
}

function readSelectedProviderId(input: unknown) {
  if (
    typeof input === 'object' &&
    input != null &&
    'models' in input &&
    typeof input.models === 'object' &&
    input.models != null &&
    'selectedProviderId' in input.models &&
    typeof input.models.selectedProviderId === 'string'
  ) {
    return input.models.selectedProviderId;
  }

  return undefined;
}

function readSelectedChatModelId(input: unknown) {
  if (
    typeof input === 'object' &&
    input != null &&
    'models' in input &&
    typeof input.models === 'object' &&
    input.models != null &&
    'selectedChatModelId' in input.models &&
    (typeof input.models.selectedChatModelId === 'string' ||
      input.models.selectedChatModelId == null)
  ) {
    return input.models.selectedChatModelId;
  }

  return undefined;
}

export function normalizeProfileSettings(input?: unknown) {
  const providers = Object.fromEntries(
    MODEL_PROVIDER_PRESETS.map((preset) => [
      preset.id,
      buildProviderSettings(preset, readExistingProviderSettings(input, preset.id)),
    ])
  );

  const inputSelectedProviderId = readSelectedProviderId(input);
  const inputSelectedChatModelId = readSelectedChatModelId(input);
  const selectedProviderId =
    inputSelectedProviderId && providers[inputSelectedProviderId]
      ? inputSelectedProviderId
      : (MODEL_PROVIDER_PRESETS[0]?.id ?? 'deepseek');

  const models: ModelsSettings = {
    providers,
    selectedChatModelId:
      typeof inputSelectedChatModelId === 'string' ? inputSelectedChatModelId : null,
    selectedProviderId,
  };
  return { models };
}

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

function getProviderPreset(providerId: string) {
  return MODEL_PROVIDER_PRESETS.find((preset) => preset.id === providerId);
}

export function normalizeProviderBaseUrl(
  apiFormat: ProviderSettings['apiFormat'],
  baseUrl: string
) {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/, '');

  if (!trimmedBaseUrl) {
    return '';
  }

  if (apiFormat === 'anthropic' && !trimmedBaseUrl.endsWith('/v1')) {
    return `${trimmedBaseUrl}/v1`;
  }

  return trimmedBaseUrl;
}

function isProviderConfigured(provider: ProviderSettings) {
  return (
    provider.enabled && provider.apiKey.trim().length > 0 && provider.baseUrl.trim().length > 0
  );
}

function isModelConfigured(model: ProviderModelItem) {
  return model.enabled && model.id.trim().length > 0;
}

export function getChatModelOptions(settings: AppProfileSettings): ChatModelOption[] {
  return Object.values(settings.models.providers).flatMap((provider) => {
    if (!isProviderConfigured(provider)) {
      return [];
    }

    const preset = getProviderPreset(provider.id);
    const providerName = preset?.name ?? provider.id;

    return provider.models.filter(isModelConfigured).map((model) => ({
      id: `${provider.id}::${model.id.trim()}`,
      modelId: model.id.trim(),
      providerId: provider.id,
      providerName,
      title: `${providerName} / ${model.name.trim() || model.id.trim()}`,
    }));
  });
}

export function resolveChatRuntimeModel(
  settings: AppProfileSettings,
  requestedModelId?: string | null
): ChatRuntimeModel | null {
  const availableModels = getChatModelOptions(settings);
  const selectedOption =
    availableModels.find(
      (model) => model.id === requestedModelId || model.modelId === requestedModelId
    ) ?? availableModels[0];

  if (!selectedOption) {
    return null;
  }

  const provider = settings.models.providers[selectedOption.providerId];

  if (!provider || !isProviderConfigured(provider)) {
    return null;
  }

  return {
    apiFormat: provider.apiFormat,
    apiKey: provider.apiKey.trim(),
    baseUrl: normalizeProviderBaseUrl(provider.apiFormat, provider.baseUrl),
    modelId: selectedOption.modelId,
    providerId: selectedOption.providerId,
  };
}
