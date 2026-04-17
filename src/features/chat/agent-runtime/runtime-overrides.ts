import type { AppProfileSettings, MemorySettings } from '@/features/settings/types';
import type { McpSettings } from '@/features/mcp/types';
import { normalizeMcpSettings } from '@/features/mcp/settings';
import type { RagSettings } from '@/features/rag/types';
import { normalizeRagSettings } from '@/features/rag/settings';
import type { SandboxSettings } from '@/features/sandbox/types';
import { normalizeSandboxSettings } from '@/features/sandbox/settings';
import type { SearchSettings } from '@/features/search/types';
import { normalizeSearchSettings } from '@/features/search/settings';
import type { SubagentSettings } from '@/features/subagents/types';
import { normalizeSubagentSettings } from '@/features/subagents/settings';

export interface AgentRuntimeOverrides {
  mcp?: McpSettings;
  memory?: MemorySettings;
  rag?: RagSettings;
  sandbox?: SandboxSettings;
  search?: SearchSettings;
  subagent?: SubagentSettings;
}

export function buildAgentRuntimeOverrides(
  settings: AppProfileSettings | null | undefined
): AgentRuntimeOverrides | null {
  if (!settings) {
    return null;
  }

  return {
    mcp: settings.mcp,
    memory: settings.memory,
    rag: settings.rag,
    sandbox: settings.sandbox,
    search: settings.search,
    subagent: settings.subagent,
  };
}

export function normalizeAgentRuntimeOverrides(input: unknown): AgentRuntimeOverrides | null {
  if (typeof input !== 'object' || input == null) {
    return null;
  }

  const record = input as Record<keyof AgentRuntimeOverrides, unknown>;

  return {
    mcp:
      typeof record.mcp === 'object' && record.mcp != null
        ? normalizeMcpSettings(record.mcp)
        : undefined,
    memory:
      typeof record.memory === 'object' && record.memory != null
        ? (record.memory as MemorySettings)
        : undefined,
    rag:
      typeof record.rag === 'object' && record.rag != null
        ? normalizeRagSettings(record.rag)
        : undefined,
    sandbox:
      typeof record.sandbox === 'object' && record.sandbox != null
        ? normalizeSandboxSettings(record.sandbox)
        : undefined,
    search:
      typeof record.search === 'object' && record.search != null
        ? normalizeSearchSettings(record.search)
        : undefined,
    subagent:
      typeof record.subagent === 'object' && record.subagent != null
        ? normalizeSubagentSettings(record.subagent)
        : undefined,
  };
}
