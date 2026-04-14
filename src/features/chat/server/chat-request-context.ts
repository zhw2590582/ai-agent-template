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
  crawl: {
    allowExternal: boolean;
    maxDepth: number;
    pageLimit: number;
  };
  enabled: boolean;
  extract: {
    chunksPerSource: number;
    extractDepth: 'advanced' | 'basic';
    format: 'markdown' | 'text';
  };
  search: {
    maxResults: number;
    searchDepth: 'advanced' | 'basic';
    topic: 'finance' | 'general' | 'news';
  };
  tavilyApiKey: string;
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
      crawl: {
        allowExternal:
          'crawl' in input &&
          typeof input.crawl === 'object' &&
          input.crawl != null &&
          'allowExternal' in input.crawl &&
          typeof input.crawl.allowExternal === 'boolean'
            ? input.crawl.allowExternal
            : true,
        maxDepth:
          'crawl' in input &&
          typeof input.crawl === 'object' &&
          input.crawl != null &&
          'maxDepth' in input.crawl &&
          typeof input.crawl.maxDepth === 'number'
            ? input.crawl.maxDepth
            : 1,
        pageLimit:
          'crawl' in input &&
          typeof input.crawl === 'object' &&
          input.crawl != null &&
          'pageLimit' in input.crawl &&
          typeof input.crawl.pageLimit === 'number'
            ? input.crawl.pageLimit
            : 25,
      },
      enabled: input.enabled,
      extract: {
        chunksPerSource:
          'extract' in input &&
          typeof input.extract === 'object' &&
          input.extract != null &&
          'chunksPerSource' in input.extract &&
          typeof input.extract.chunksPerSource === 'number'
            ? input.extract.chunksPerSource
            : 3,
        extractDepth:
          'extract' in input &&
          typeof input.extract === 'object' &&
          input.extract != null &&
          'extractDepth' in input.extract &&
          (input.extract.extractDepth === 'advanced' || input.extract.extractDepth === 'basic')
            ? input.extract.extractDepth
            : 'basic',
        format:
          'extract' in input &&
          typeof input.extract === 'object' &&
          input.extract != null &&
          'format' in input.extract &&
          (input.extract.format === 'markdown' || input.extract.format === 'text')
            ? input.extract.format
            : 'markdown',
      },
      search: {
        maxResults:
          'search' in input &&
          typeof input.search === 'object' &&
          input.search != null &&
          'maxResults' in input.search &&
          typeof input.search.maxResults === 'number'
            ? input.search.maxResults
            : 5,
        searchDepth:
          'search' in input &&
          typeof input.search === 'object' &&
          input.search != null &&
          'searchDepth' in input.search &&
          (input.search.searchDepth === 'advanced' || input.search.searchDepth === 'basic')
            ? input.search.searchDepth
            : 'basic',
        topic:
          'search' in input &&
          typeof input.search === 'object' &&
          input.search != null &&
          'topic' in input.search &&
          (input.search.topic === 'finance' ||
            input.search.topic === 'general' ||
            input.search.topic === 'news')
            ? input.search.topic
            : 'general',
      },
      tavilyApiKey: input.tavilyApiKey,
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
