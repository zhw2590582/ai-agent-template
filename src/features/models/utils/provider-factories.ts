import { MODEL_PROVIDER_PRESETS } from '@/features/models/catalog';
import type { AppProfile, ProviderModelItem, ProviderSettings } from '@/features/models/types';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
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

export function buildProviderSettings(
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
    settings: (options.existing?.settings as AppProfile['settings'] | undefined) ?? {
      memory: {
        autoWrite: false,
        crossConversation: true,
        enabled: false,
      },
      models: { providers: {}, selectedChatModelId: null, selectedProviderId: '' },
    },
    theme: options.existing?.theme ?? options.theme,
    updated_at: now,
  };
}
