import { MEMORY_CONFIG } from '@/config/memory';
import { MODEL_PROVIDER_PRESETS } from '@/features/models/catalog';
import type { McpSettings } from '@/features/mcp/types';
import { normalizeMcpSettings } from '@/features/mcp/settings';
import type { ModelsSettings, ProviderSettings } from '@/features/models/types';
import type { RagSettings } from '@/features/rag/types';
import { normalizeRagSettings } from '@/features/rag/settings';
import type { SandboxSettings } from '@/features/sandbox/types';
import { normalizeSandboxSettings } from '@/features/sandbox/settings';
import type { SearchSettings } from '@/features/search/types';
import { normalizeSearchSettings } from '@/features/search/settings';
import type { SkillsSettings } from '@/features/skills/types';
import { normalizeSkillsSettings } from '@/features/skills/settings';
import { normalizeSubagentSettings } from '@/features/subagents/settings';
import type { SubagentSettings } from '@/features/subagents/types';
import type { AppProfileSettings, MemorySettings } from '@/features/settings/types';
import {
  buildCustomProviderSettings,
  buildProviderSettings,
} from '@/features/models/utils/provider-factories';

function readSettingsSection<T>(input: unknown, key: keyof AppProfileSettings) {
  if (typeof input !== 'object' || input == null || !(key in input)) {
    return undefined;
  }

  const record = input as Partial<Record<keyof AppProfileSettings, unknown>>;
  const value = record[key];
  return typeof value === 'object' && value != null ? (value as Partial<T>) : undefined;
}

function readExistingProviders(input: unknown) {
  const models = readSettingsSection<{ providers?: Record<string, Partial<ProviderSettings>> }>(
    input,
    'models'
  );
  return models?.providers ?? {};
}

function readExistingProviderSettings(input: unknown, providerId: string) {
  return readExistingProviders(input)[providerId];
}

function readSelectedChatModelId(input: unknown) {
  const models = readSettingsSection<{ selectedChatModelId?: string | null }>(input, 'models');
  return models?.selectedChatModelId;
}

function clampMemoryNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeAppProfileSettings(input?: unknown) {
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

  const inputSelectedChatModelId = readSelectedChatModelId(input);

  const models: ModelsSettings = {
    providers,
    selectedChatModelId:
      typeof inputSelectedChatModelId === 'string' ? inputSelectedChatModelId : null,
  };

  const existingMemory = readSettingsSection<MemorySettings>(input, 'memory');
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

  const search = normalizeSearchSettings(readSettingsSection<SearchSettings>(input, 'search'));
  const rag = normalizeRagSettings(readSettingsSection<RagSettings>(input, 'rag'));
  const sandbox = normalizeSandboxSettings(readSettingsSection<SandboxSettings>(input, 'sandbox'));
  const mcp = normalizeMcpSettings(readSettingsSection<McpSettings>(input, 'mcp'));
  const skills = normalizeSkillsSettings(readSettingsSection<SkillsSettings>(input, 'skills'));
  const subagent = normalizeSubagentSettings(
    readSettingsSection<SubagentSettings>(input, 'subagent')
  );

  return {
    memory,
    mcp,
    models,
    rag,
    sandbox,
    search,
    skills,
    subagent,
  } satisfies AppProfileSettings;
}
