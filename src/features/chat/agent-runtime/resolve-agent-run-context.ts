import type { SupabaseClient } from '@supabase/supabase-js';

import {
  DEFAULT_LOCALE,
  LOCALE_DETECTION_STRATEGY,
  isSupportedLocale,
  type Locale,
} from '@/config/i18n';
import { getProfileById } from '@/features/auth/storage/profiles';
import { createAgentRunMetadataBase } from '@/features/chat/agent-runtime/run-metadata';
import { buildAgentToolset } from '@/features/chat/agent-runtime/build-agent-toolset';
import { normalizeAgentRuntimeOverrides } from '@/features/chat/agent-runtime/runtime-overrides';
import type {
  AgentRunContext,
  ChatProfileMemorySettings,
  ChatProfileRagSettings,
  ResolveAgentRunContextOptions,
} from '@/features/chat/agent-runtime/types';
import { verifyConversationOwnership } from '@/features/chat/storage';
import { buildPersistedMemoryContextForUser } from '@/features/memory/server/server-memory-source';
import { normalizeRagSettings } from '@/features/rag/settings';
import type { RagSettings } from '@/features/rag/types';
import type { RuntimeSkill } from '@/features/skills/types';
import { normalizeSubagentSettings } from '@/features/subagents/settings';
import type { SubagentSettings } from '@/features/subagents/types';
import { logger } from '@/lib/logger';

export function resolveChatRequestLocale(request: Request): Locale {
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get('lang');

  if (isSupportedLocale(queryLocale)) {
    return queryLocale;
  }

  const cookie = request.headers.get('cookie') ?? '';
  const localeFromCookie = cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${LOCALE_DETECTION_STRATEGY.cookieName}=`))
    ?.split('=')[1]
    ?.slice(0, 10);

  if (isSupportedLocale(localeFromCookie)) {
    return localeFromCookie;
  }

  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
  if (acceptLanguage.includes('en')) {
    return 'en-US';
  }

  return DEFAULT_LOCALE;
}

export function resolveProfileMemorySettings(profile: Awaited<ReturnType<typeof getProfileById>>) {
  if (
    typeof profile?.settings === 'object' &&
    profile.settings != null &&
    'memory' in profile.settings &&
    typeof profile.settings.memory === 'object' &&
    profile.settings.memory != null
  ) {
    return profile.settings.memory as ChatProfileMemorySettings;
  }

  return null;
}

export function resolveProfileRagSettings(profile: Awaited<ReturnType<typeof getProfileById>>) {
  if (
    typeof profile?.settings === 'object' &&
    profile.settings != null &&
    'rag' in profile.settings &&
    typeof profile.settings.rag === 'object' &&
    profile.settings.rag != null
  ) {
    return profile.settings.rag as ChatProfileRagSettings;
  }

  return null;
}

export function resolveProfileSubagentSettings(
  profile: Awaited<ReturnType<typeof getProfileById>>
) {
  if (
    typeof profile?.settings === 'object' &&
    profile.settings != null &&
    'subagent' in profile.settings &&
    typeof profile.settings.subagent === 'object' &&
    profile.settings.subagent != null
  ) {
    return profile.settings.subagent as SubagentSettings;
  }

  return null;
}

export function resolveMemorySettings(input: unknown): ChatProfileMemorySettings | null {
  if (typeof input !== 'object' || input == null) {
    return null;
  }

  return input as ChatProfileMemorySettings;
}

function resolveRuntimeSkills(input: unknown): RuntimeSkill[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter(
    (skill): skill is RuntimeSkill =>
      !!skill &&
      typeof skill === 'object' &&
      typeof skill.id === 'string' &&
      typeof skill.name === 'string' &&
      typeof skill.description === 'string' &&
      typeof skill.source === 'string' &&
      typeof skill.skillPath === 'string' &&
      typeof skill.summary === 'string' &&
      Array.isArray(skill.files) &&
      skill.files.every(
        (file: unknown) =>
          !!file &&
          typeof file === 'object' &&
          typeof (file as Record<string, unknown>).path === 'string' &&
          typeof (file as Record<string, unknown>).content === 'string'
      )
  );
}

async function loadPersistedConversationSummary(options: {
  conversationId: string | null;
  supabase: SupabaseClient;
  userId: string;
}) {
  const { conversationId, supabase, userId } = options;

  if (!conversationId) {
    return null;
  }

  try {
    const conversation = await verifyConversationOwnership(conversationId, userId, supabase);
    return conversation.summary ?? null;
  } catch (error) {
    logger.warn('Chat request: failed to load persisted conversation summary', {
      conversationId,
      error: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}

export async function resolveAgentRunContext({
  conversationId,
  guestMemoryContext,
  runtimeOverrides,
  runtimeSkills,
  runtimeModel,
  supabase,
  user,
}: ResolveAgentRunContextOptions): Promise<AgentRunContext> {
  let memoryContext =
    typeof guestMemoryContext === 'string' && guestMemoryContext.trim().length > 0
      ? guestMemoryContext.trim()
      : null;
  const resolvedRuntimeOverrides = normalizeAgentRuntimeOverrides(runtimeOverrides);
  let memorySettings = resolveMemorySettings(resolvedRuntimeOverrides?.memory);
  let persistedConversationSummary: string | null = null;
  let resolvedProfileRagSettings: RagSettings | null = null;
  let resolvedProfileSubagentSettings: SubagentSettings | null = null;
  const resolvedSearchSettings = resolvedRuntimeOverrides?.search ?? null;
  const resolvedMcpSettings = resolvedRuntimeOverrides?.mcp ?? null;
  const resolvedRequestRagSettings = resolvedRuntimeOverrides?.rag
    ? normalizeRagSettings(resolvedRuntimeOverrides.rag)
    : null;
  const resolvedSandboxSettings = resolvedRuntimeOverrides?.sandbox ?? null;
  const resolvedRequestSubagentSettings = resolvedRuntimeOverrides?.subagent
    ? normalizeSubagentSettings(resolvedRuntimeOverrides.subagent)
    : null;
  const toolset = await buildAgentToolset({
    mcpSettings: resolvedMcpSettings,
    sandboxSettings: resolvedSandboxSettings,
    searchSettings: resolvedSearchSettings,
  });
  const hasAgentTools = Object.keys(toolset.agentTools).length > 0;
  const resolvedRuntimeSkills = resolveRuntimeSkills(runtimeSkills);

  try {
    if (user) {
      const profile = await getProfileById(user.id, supabase);
      memorySettings = memorySettings ?? resolveProfileMemorySettings(profile);
      resolvedProfileRagSettings = normalizeRagSettings(
        resolvedRequestRagSettings ?? resolveProfileRagSettings(profile)
      );
      resolvedProfileSubagentSettings = normalizeSubagentSettings(
        resolvedRequestSubagentSettings ?? resolveProfileSubagentSettings(profile)
      );

      if (memorySettings?.enabled && memorySettings.crossConversation) {
        memoryContext = await buildPersistedMemoryContextForUser({
          client: supabase,
          memorySettings,
          userId: user.id,
        });
      }

      persistedConversationSummary = await loadPersistedConversationSummary({
        conversationId,
        supabase,
        userId: user.id,
      });
    }
  } catch (error) {
    logger.warn('Chat request: failed to resolve user-specific run context, falling back', {
      conversationId,
      error: error instanceof Error ? error.message : String(error),
      userId: user?.id ?? null,
    });
  }

  return {
    agentTools: toolset.agentTools,
    closeAgentResources: toolset.closeAgentResources,
    hasAgentTools,
    mcpInjectedTools: toolset.mcpInjectedTools,
    memoryContext,
    memorySettings,
    persistedConversationSummary,
    ragSettings: resolvedProfileRagSettings ?? resolvedRequestRagSettings,
    runtimeSkills: resolvedRuntimeSkills,
    runMetadataBase: createAgentRunMetadataBase({
      conversationId,
      hasAgentTools,
      hasSearchTools: toolset.hasSearchTools,
      mcpServerNames: toolset.mcpServerNames,
      runtimeModel,
      userId: user?.id ?? null,
      workspaceManifest: toolset.workspaceManifest,
      workspaceTelemetry: toolset.workspaceTelemetry,
    }),
    subagentSettings: resolvedProfileSubagentSettings ?? resolvedRequestSubagentSettings,
  };
}
