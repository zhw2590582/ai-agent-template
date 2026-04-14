import { MEMORY_CONFIG } from '@/config/memory';
import { MODEL_PROVIDER_PRESETS } from '@/features/models/catalog';
import type { AppProfileSettings, MemorySettings } from '@/features/auth/profile/types';
import type { ModelsSettings, ProviderSettings } from '@/features/models/types';
import type { SearchSettings } from '@/features/search/types';
import { SEARCH_CONFIG } from '@/config/search';
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

function clampSearchMaxResults(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return SEARCH_CONFIG.DEFAULT_MAX_RESULTS;
  }

  return Math.min(
    SEARCH_CONFIG.MAX_RESULTS_MAX,
    Math.max(SEARCH_CONFIG.MAX_RESULTS_MIN, Math.round(value))
  );
}

function clampExtractChunksPerSource(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return SEARCH_CONFIG.DEFAULT_EXTRACT_CHUNKS_PER_SOURCE;
  }

  return Math.min(
    SEARCH_CONFIG.EXTRACT_CHUNKS_PER_SOURCE_MAX,
    Math.max(SEARCH_CONFIG.EXTRACT_CHUNKS_PER_SOURCE_MIN, Math.round(value))
  );
}

function clampCrawlMaxDepth(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return SEARCH_CONFIG.DEFAULT_CRAWL_MAX_DEPTH;
  }

  return Math.min(
    SEARCH_CONFIG.CRAWL_MAX_DEPTH_MAX,
    Math.max(SEARCH_CONFIG.CRAWL_MAX_DEPTH_MIN, Math.round(value))
  );
}

function clampCrawlPageLimit(value: unknown) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return SEARCH_CONFIG.DEFAULT_CRAWL_PAGE_LIMIT;
  }

  return Math.min(
    SEARCH_CONFIG.CRAWL_PAGE_LIMIT_MAX,
    Math.max(SEARCH_CONFIG.CRAWL_PAGE_LIMIT_MIN, Math.round(value))
  );
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
    crawl: {
      allowExternal: existingSearch?.crawl?.allowExternal ?? true,
      maxDepth: clampCrawlMaxDepth(existingSearch?.crawl?.maxDepth),
      pageLimit: clampCrawlPageLimit(existingSearch?.crawl?.pageLimit),
    },
    enabled: existingSearch?.enabled ?? false,
    extract: {
      chunksPerSource: clampExtractChunksPerSource(existingSearch?.extract?.chunksPerSource),
      extractDepth:
        existingSearch?.extract?.extractDepth === 'advanced' ||
        existingSearch?.extract?.extractDepth === 'basic'
          ? existingSearch.extract.extractDepth
          : SEARCH_CONFIG.DEFAULT_EXTRACT_DEPTH,
      format:
        existingSearch?.extract?.format === 'markdown' || existingSearch?.extract?.format === 'text'
          ? existingSearch.extract.format
          : SEARCH_CONFIG.DEFAULT_EXTRACT_FORMAT,
    },
    search: {
      maxResults: clampSearchMaxResults(existingSearch?.search?.maxResults),
      searchDepth:
        existingSearch?.search?.searchDepth === 'advanced' ||
        existingSearch?.search?.searchDepth === 'basic'
          ? existingSearch.search.searchDepth
          : SEARCH_CONFIG.DEFAULT_SEARCH_DEPTH,
      topic:
        existingSearch?.search?.topic === 'finance' ||
        existingSearch?.search?.topic === 'general' ||
        existingSearch?.search?.topic === 'news'
          ? existingSearch.search.topic
          : SEARCH_CONFIG.DEFAULT_TOPIC,
    },
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
