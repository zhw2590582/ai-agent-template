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

function slugifyProviderId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function buildProviderMonogram(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);

  return letters || 'CP';
}

function buildProviderModels(existing?: ProviderModelItem[]) {
  if (!existing || existing.length === 0) {
    return [];
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
    defaultBaseUrl: existing?.defaultBaseUrl ?? preset.defaultBaseUrl,
    docsUrl: existing?.docsUrl ?? preset.docsUrl,
    enabled: existing?.enabled ?? preset.id === 'deepseek',
    id: preset.id,
    isCustom: false,
    logoId: existing?.logoId ?? preset.logoId ?? null,
    monogram: existing?.monogram ?? preset.monogram,
    models: buildProviderModels(existing?.models),
    name: existing?.name ?? preset.name,
  };
}

export function buildCustomProviderSettings(options: {
  existingIds?: string[];
  existing?: Partial<ProviderSettings>;
  name: string;
}) {
  const normalizedName = options.name.trim();
  const requestedId = options.existing?.id?.trim();
  const baseId = requestedId || slugifyProviderId(normalizedName) || 'custom-provider';
  const existingIds = new Set(options.existingIds ?? []);
  let nextId = baseId;
  let index = 2;

  if (!options.existing?.id) {
    while (existingIds.has(nextId)) {
      nextId = `${baseId}-${index}`;
      index += 1;
    }
  }

  return {
    apiFormat: options.existing?.apiFormat ?? 'openai',
    apiKey: options.existing?.apiKey ?? '',
    baseUrl: options.existing?.baseUrl ?? '',
    defaultBaseUrl: options.existing?.defaultBaseUrl ?? '',
    docsUrl: options.existing?.docsUrl ?? null,
    enabled: options.existing?.enabled ?? false,
    id: options.existing?.id ?? nextId,
    isCustom: true,
    logoId: options.existing?.logoId ?? null,
    monogram: options.existing?.monogram ?? buildProviderMonogram(normalizedName),
    models: buildProviderModels(options.existing?.models),
    name: normalizedName,
  } satisfies ProviderSettings;
}

function readExistingProviders(input: unknown) {
  if (
    typeof input === 'object' &&
    input != null &&
    'models' in input &&
    typeof input.models === 'object' &&
    input.models != null &&
    'providers' in input.models &&
    typeof input.models.providers === 'object' &&
    input.models.providers != null
  ) {
    return input.models.providers as Record<string, Partial<ProviderSettings>>;
  }

  return {};
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
  const existingProviders = readExistingProviders(input);
  const providers = Object.fromEntries(
    MODEL_PROVIDER_PRESETS.map((preset) => [
      preset.id,
      buildProviderSettings(preset, readExistingProviderSettings(input, preset.id)),
    ])
  ) as Record<string, ProviderSettings>;

  for (const [providerId, provider] of Object.entries(existingProviders)) {
    if (providers[providerId]) {
      continue;
    }

    const providerName = provider.name?.trim();
    if (!providerName) {
      continue;
    }

    providers[providerId] = buildCustomProviderSettings({
      existing: {
        ...provider,
        id: providerId,
      },
      name: providerName,
    });
  }

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

export function getOrderedProviders(settings: AppProfileSettings) {
  const presetIds = new Set(MODEL_PROVIDER_PRESETS.map((preset) => preset.id));
  const providers = settings.models.providers;

  return [
    ...MODEL_PROVIDER_PRESETS.map((preset) => providers[preset.id]).filter(Boolean),
    ...Object.values(providers).filter((provider) => !presetIds.has(provider.id)),
  ];
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

    return provider.models.filter(isModelConfigured).map((model) => ({
      id: `${provider.id}::${model.id.trim()}`,
      modelId: model.id.trim(),
      providerId: provider.id,
      providerName: provider.name.trim() || provider.id,
      title: model.name.trim() || model.id.trim(),
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
