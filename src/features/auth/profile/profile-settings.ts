import { MEMORY_CONFIG } from '@/config/memory';
import { MODEL_PROVIDER_PRESETS } from '@/features/models/catalog';
import type {
  AppProfileSettings,
  MemorySettings,
  ModelsSettings,
  ProviderSettings,
  SearchSettings,
} from '@/features/models/types';
import {
  buildCustomProviderSettings,
  buildProviderSettings,
} from '@/features/models/utils/provider-factories';

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

function readMemorySettings(input: unknown): Partial<MemorySettings> | undefined {
  if (
    typeof input === 'object' &&
    input != null &&
    'memory' in input &&
    typeof input.memory === 'object' &&
    input.memory != null
  ) {
    return input.memory as Partial<MemorySettings>;
  }

  return undefined;
}

function readSearchSettings(input: unknown): Partial<SearchSettings> | undefined {
  if (
    typeof input === 'object' &&
    input != null &&
    'search' in input &&
    typeof input.search === 'object' &&
    input.search != null
  ) {
    return input.search as Partial<SearchSettings>;
  }

  return undefined;
}

function clampMemoryNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
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

  const existingMemory = readMemorySettings(input);
  const memory: MemorySettings = {
    autoWrite: existingMemory?.autoWrite ?? true,
    contextMaxItems: clampMemoryNumber(
      existingMemory?.contextMaxItems,
      MEMORY_CONFIG.CONTEXT_MAX_ITEMS,
      1,
      20
    ),
    crossConversation: existingMemory?.crossConversation ?? true,
    enabled: existingMemory?.enabled ?? true,
    recentMessageWindow: clampMemoryNumber(
      existingMemory?.recentMessageWindow,
      MEMORY_CONFIG.SUMMARY_RECENT_MESSAGE_WINDOW,
      2,
      20
    ),
    summaryMinMessages: clampMemoryNumber(
      existingMemory?.summaryMinMessages,
      MEMORY_CONFIG.SUMMARY_MIN_MESSAGES,
      2,
      30
    ),
  };

  const existingSearch = readSearchSettings(input);
  const search: SearchSettings = {
    enabled: existingSearch?.enabled ?? false,
    tavilyApiKey:
      typeof existingSearch?.tavilyApiKey === 'string' ? existingSearch.tavilyApiKey : '',
  };

  return { memory, models, search } satisfies AppProfileSettings;
}

export function getOrderedProviders(settings: AppProfileSettings) {
  const providers = settings.models.providers;

  return Object.values(providers).sort((left, right) =>
    left.name.localeCompare(right.name, 'en', {
      sensitivity: 'base',
    })
  );
}
