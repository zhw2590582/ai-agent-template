import type { SupabaseClient, User } from '@supabase/supabase-js';

import {
  DEFAULT_LOCALE,
  LOCALE_DETECTION_STRATEGY,
  isSupportedLocale,
  type Locale,
} from '@/config/i18n';
import { logger } from '@/lib/logger';
import { buildAgentTools } from '@/features/chat/ai/tools';
import { verifyConversationOwnership } from '@/features/chat/storage';
import { getProfileById } from '@/features/auth/storage/profiles';
import { buildMemoryContext, listMemoriesForUser } from '@/features/memory/storage/memories';

export interface ChatProfileMemorySettings {
  autoWrite?: boolean;
  contextMaxItems?: number;
  crossConversation?: boolean;
  enabled?: boolean;
  recentMessageWindow?: number;
  summaryMinMessages?: number;
}

export interface ChatSearchSettings {
  enabled: boolean;
  maxResults: number;
  searchDepth: 'advanced' | 'basic';
  tavilyApiKey: string;
  topic: 'finance' | 'general' | 'news';
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

export function resolveSearchSettings(input: unknown): ChatSearchSettings | null {
  if (
    typeof input === 'object' &&
    input != null &&
    'enabled' in input &&
    typeof input.enabled === 'boolean' &&
    'tavilyApiKey' in input &&
    typeof input.tavilyApiKey === 'string'
  ) {
    return {
      enabled: input.enabled,
      maxResults:
        'maxResults' in input && typeof input.maxResults === 'number' ? input.maxResults : 5,
      searchDepth:
        'searchDepth' in input &&
        (input.searchDepth === 'advanced' || input.searchDepth === 'basic')
          ? input.searchDepth
          : 'basic',
      tavilyApiKey: input.tavilyApiKey,
      topic:
        'topic' in input &&
        (input.topic === 'finance' || input.topic === 'general' || input.topic === 'news')
          ? input.topic
          : 'general',
    };
  }

  return null;
}

interface LoadChatRequestContextOptions {
  conversationId: string | null;
  searchSettings: unknown;
  supabase: SupabaseClient;
  user: User | null;
}

export async function loadChatRequestContext({
  conversationId,
  searchSettings,
  supabase,
  user,
}: LoadChatRequestContextOptions) {
  let persistedConversationSummary: string | null = null;
  let memoryContext: string | null = null;
  let memorySettings: ChatProfileMemorySettings | null = null;

  const resolvedSearchSettings = resolveSearchSettings(searchSettings);
  const agentTools = buildAgentTools({
    searchSettings: resolvedSearchSettings,
  });

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
    hasAgentTools: Object.keys(agentTools).length > 0,
    memoryContext,
    memorySettings,
    persistedConversationSummary,
  };
}
