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
import type {
  AgentRunContext,
  ChatProfileMemorySettings,
  ChatProfileRagSettings,
  ResolveAgentRunContextOptions,
} from '@/features/chat/agent-runtime/types';
import { verifyConversationOwnership } from '@/features/chat/storage';
import { buildMemoryContext, listMemoriesForUser } from '@/features/memory/storage/memories';
import { normalizeMcpSettings } from '@/features/mcp/settings';
import type { McpSettings } from '@/features/mcp/types';
import { normalizeRagSettings } from '@/features/rag/settings';
import type { RagSettings } from '@/features/rag/types';
import { normalizeSandboxSettings } from '@/features/sandbox/settings';
import type { SandboxSettings } from '@/features/sandbox/types';
import { normalizeSearchSettings } from '@/features/search/settings';
import type { SearchSettings } from '@/features/search/types';
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

export function resolveSearchSettings(input: unknown): SearchSettings | null {
  if (typeof input !== 'object' || input == null) {
    return null;
  }

  return normalizeSearchSettings(input);
}

export function resolveMcpSettings(input: unknown): McpSettings | null {
  if (typeof input !== 'object' || input == null) {
    return null;
  }

  return normalizeMcpSettings(input);
}

export function resolveSandboxSettings(input: unknown): SandboxSettings | null {
  if (typeof input !== 'object' || input == null) {
    return null;
  }

  return normalizeSandboxSettings(input);
}

export function resolveRagSettings(input: unknown): RagSettings | null {
  if (typeof input !== 'object' || input == null) {
    return null;
  }

  return normalizeRagSettings(input);
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
  mcpSettings,
  ragSettings,
  runtimeModel,
  sandboxSettings,
  searchSettings,
  supabase,
  user,
}: ResolveAgentRunContextOptions): Promise<AgentRunContext> {
  let memoryContext: string | null = null;
  let memorySettings: ChatProfileMemorySettings | null = null;
  let persistedConversationSummary: string | null = null;
  let resolvedProfileRagSettings: RagSettings | null = null;

  const resolvedSearchSettings = resolveSearchSettings(searchSettings);
  const resolvedMcpSettings = resolveMcpSettings(mcpSettings);
  const resolvedRequestRagSettings = resolveRagSettings(ragSettings);
  const resolvedSandboxSettings = resolveSandboxSettings(sandboxSettings);
  const toolset = await buildAgentToolset({
    mcpSettings: resolvedMcpSettings,
    sandboxSettings: resolvedSandboxSettings,
    searchSettings: resolvedSearchSettings,
  });

  try {
    if (user) {
      const profile = await getProfileById(user.id, supabase);
      memorySettings = resolveProfileMemorySettings(profile);
      resolvedProfileRagSettings = normalizeRagSettings(
        resolvedRequestRagSettings ?? resolveProfileRagSettings(profile)
      );

      if (memorySettings?.enabled && memorySettings.crossConversation) {
        const memories = await listMemoriesForUser(user.id, supabase);
        memoryContext = buildMemoryContext(memories, {
          memorySettings,
        });
      }

      persistedConversationSummary = await loadPersistedConversationSummary({
        conversationId,
        supabase,
        userId: user.id,
      });
    }

    return {
      agentTools: toolset.agentTools,
      closeAgentResources: toolset.closeAgentResources,
      hasAgentTools: Object.keys(toolset.agentTools).length > 0,
      mcpInjectedTools: toolset.mcpInjectedTools,
      memoryContext,
      memorySettings,
      persistedConversationSummary,
      ragSettings: resolvedProfileRagSettings ?? resolvedRequestRagSettings,
      runMetadataBase: createAgentRunMetadataBase({
        conversationId,
        hasAgentTools: Object.keys(toolset.agentTools).length > 0,
        hasSearchTools: toolset.hasSearchTools,
        mcpServerNames: toolset.mcpServerNames,
        runtimeModel,
        userId: user?.id ?? null,
        workspaceManifest: toolset.workspaceManifest,
        workspaceTelemetry: toolset.workspaceTelemetry,
      }),
    };
  } catch (error) {
    await toolset.closeAgentResourcesOnError();
    throw error;
  }
}
