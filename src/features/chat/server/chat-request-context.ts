import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { ToolSet } from 'ai';

import {
  DEFAULT_LOCALE,
  LOCALE_DETECTION_STRATEGY,
  isSupportedLocale,
  type Locale,
} from '@/config/i18n';
import { logger } from '@/lib/logger';
import { buildSearchAgentTools } from '@/features/chat/ai/tools';
import { verifyConversationOwnership } from '@/features/chat/storage';
import { getProfileById } from '@/features/auth/storage/profiles';
import { buildMemoryContext, listMemoriesForUser } from '@/features/memory/storage/memories';
import { createMcpAgentToolBundles } from '@/features/mcp/server/mcp-client';
import { normalizeMcpSettings } from '@/features/mcp/settings';
import type { McpSettings } from '@/features/mcp/types';
import { normalizeSearchSettings } from '@/features/search/settings';
import type { SearchSettings } from '@/features/search/types';

export interface ChatProfileMemorySettings {
  autoWrite?: boolean;
  contextMaxItems?: number;
  crossConversation?: boolean;
  enabled?: boolean;
  recentMessageWindow?: number;
  summaryMinMessages?: number;
}

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

interface LoadChatRequestContextOptions {
  conversationId: string | null;
  mcpSettings: unknown;
  searchSettings: unknown;
  supabase: SupabaseClient;
  user: User | null;
}

export async function loadChatRequestContext({
  conversationId,
  mcpSettings,
  searchSettings,
  supabase,
  user,
}: LoadChatRequestContextOptions) {
  let persistedConversationSummary: string | null = null;
  let memoryContext: string | null = null;
  let memorySettings: ChatProfileMemorySettings | null = null;
  let mcpServerNames: string[] = [];
  let mcpInjectedTools: Array<{
    injectedToolName: string;
    originalToolName: string;
    serverId: string;
    serverName: string;
  }> = [];
  let closeAgentResources: (() => Promise<void>) | undefined;

  const resolvedSearchSettings = resolveSearchSettings(searchSettings);
  const resolvedMcpSettings = resolveMcpSettings(mcpSettings);
  const searchAgentTools = buildSearchAgentTools({
    searchSettings: resolvedSearchSettings,
  });
  let agentTools: ToolSet = searchAgentTools;

  if (
    resolvedMcpSettings?.enabled &&
    resolvedMcpSettings.servers.some((server) => server.enabled)
  ) {
    try {
      const mcpBundle = await createMcpAgentToolBundles(resolvedMcpSettings);
      agentTools = {
        ...searchAgentTools,
        ...mcpBundle.tools,
      };
      mcpInjectedTools = mcpBundle.injectedTools;
      mcpServerNames = mcpBundle.serverNames;
      closeAgentResources = async () => {
        await Promise.all(mcpBundle.clients.map((client) => client.close()));
      };

      logger.info('Chat request: initialized MCP tools', {
        injectedToolNames: mcpBundle.injectedTools.map((tool) => tool.injectedToolName),
        mcpServerNames: mcpBundle.serverNames,
        serverCount: mcpBundle.serverNames.length,
        toolCount: mcpBundle.injectedTools.length,
      });
    } catch (error) {
      logger.warn('Chat request: failed to initialize MCP tools', {
        error: error instanceof Error ? error.message : String(error),
        serverCount: resolvedMcpSettings.servers.length,
      });
    }
  }

  try {
    if (user) {
      const profile = await getProfileById(user.id, supabase);
      memorySettings = resolveProfileMemorySettings(profile);

      if (memorySettings?.enabled && memorySettings.crossConversation) {
        const memories = await listMemoriesForUser(user.id, supabase);
        memoryContext = buildMemoryContext(memories, {
          memorySettings,
        });
      }
    }

    if (conversationId && user) {
      try {
        const conversation = await verifyConversationOwnership(conversationId, user.id, supabase);
        persistedConversationSummary = conversation.summary ?? null;
      } catch (error) {
        logger.warn('Chat request: failed to load persisted conversation summary', {
          conversationId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      agentTools,
      closeAgentResources,
      hasAgentTools: Object.keys(agentTools).length > 0,
      hasSearchTools: Object.keys(searchAgentTools).length > 0,
      memoryContext,
      memorySettings,
      mcpInjectedTools,
      mcpServerNames,
      persistedConversationSummary,
    };
  } catch (error) {
    await closeAgentResources?.();
    throw error;
  }
}
