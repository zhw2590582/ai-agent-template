import { SUBAGENT_CONFIG } from '@/config/subagent';
import type { SubagentDefinition, SubagentSettings } from '@/features/subagent/types';

interface SubagentSettingsInput {
  agents?: Array<Partial<SubagentDefinition>>;
  enabled?: boolean;
}

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function clampFloat(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function normalizeThemeColor(value: unknown) {
  if (typeof value !== 'string') {
    return SUBAGENT_CONFIG.DEFAULT_THEME_COLOR;
  }

  const trimmed = value.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return SUBAGENT_CONFIG.DEFAULT_THEME_COLOR;
}

function createSubagentId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `subagent-${crypto.randomUUID()}`;
  }

  return `subagent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSubagentDefinition(
  input: Partial<SubagentDefinition>,
  index: number
): SubagentDefinition | null {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) {
    return null;
  }

  return {
    description: typeof input.description === 'string' ? input.description.trim() : '',
    enabled: input.enabled ?? true,
    id:
      typeof input.id === 'string' && input.id.trim().length > 0
        ? input.id.trim()
        : `subagent-${index + 1}`,
    maxTokens: clampInteger(
      input.maxTokens,
      SUBAGENT_CONFIG.DEFAULT_MAX_TOKENS,
      SUBAGENT_CONFIG.MIN_TOKENS,
      SUBAGENT_CONFIG.MAX_TOKENS
    ),
    name,
    systemPrompt:
      typeof input.systemPrompt === 'string' && input.systemPrompt.trim().length > 0
        ? input.systemPrompt.trim()
        : SUBAGENT_CONFIG.DEFAULT_SYSTEM_PROMPT,
    temperature: clampFloat(
      input.temperature,
      SUBAGENT_CONFIG.DEFAULT_TEMPERATURE,
      SUBAGENT_CONFIG.MIN_TEMPERATURE,
      SUBAGENT_CONFIG.MAX_TEMPERATURE
    ),
    themeColor: normalizeThemeColor(input.themeColor),
  };
}

export function createSubagentDraft(): SubagentDefinition {
  return {
    description: '',
    enabled: true,
    id: createSubagentId(),
    maxTokens: SUBAGENT_CONFIG.DEFAULT_MAX_TOKENS,
    name: '',
    systemPrompt: SUBAGENT_CONFIG.DEFAULT_SYSTEM_PROMPT,
    temperature: SUBAGENT_CONFIG.DEFAULT_TEMPERATURE,
    themeColor: SUBAGENT_CONFIG.DEFAULT_THEME_COLOR,
  };
}

export function normalizeSubagentSettings(input?: SubagentSettingsInput | null): SubagentSettings {
  return {
    agents: Array.isArray(input?.agents)
      ? input.agents
          .map((agent, index) => normalizeSubagentDefinition(agent, index))
          .filter((agent): agent is SubagentDefinition => agent != null)
      : [],
    enabled: input?.enabled ?? false,
  };
}
