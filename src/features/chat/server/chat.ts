import { convertToModelMessages, streamText, type UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/app';
import {
  DEFAULT_LOCALE,
  LOCALE_DETECTION_STRATEGY,
  isSupportedLocale,
  type Locale,
} from '@/config/i18n';
import { AppError, ErrorCode, handleErrorWithLocale } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { logger } from '@/lib/logger';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { validateRequest } from '@/lib/validation';
import { getRuntimeChatModel } from '@/features/chat/ai/models';
import { getSystemPrompt } from '@/features/chat/ai/prompts';
import {
  buildConversationSummaryContext,
  resolveConversationSummaryConfig,
} from '@/features/chat/ai/summary';
import { agentTools } from '@/features/chat/ai/tools';
import { chatPostSchema } from '@/features/chat/server/schemas';
import { saveConversationMessages, verifyConversationOwnership } from '@/features/chat/storage';
import { getProfileById } from '@/features/auth/storage/profiles';
import {
  buildMemoryContext,
  buildMemoryRetrievalQuery,
  listMemoriesForUser,
  saveConversationMemories,
} from '@/features/memory/storage/memories';

export const maxDuration = 30;

function getLocaleFromRequest(request: Request): Locale {
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
    ?.slice(0, 10); // Limit length to prevent abuse

  if (isSupportedLocale(localeFromCookie)) {
    return localeFromCookie;
  }

  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
  if (acceptLanguage.includes('en')) {
    return 'en-US';
  }

  return DEFAULT_LOCALE;
}

const hasAgentTools = Object.keys(agentTools).length > 0;

function getProfileMemorySettings(profile: Awaited<ReturnType<typeof getProfileById>>) {
  if (
    typeof profile?.settings === 'object' &&
    profile.settings != null &&
    'memory' in profile.settings &&
    typeof profile.settings.memory === 'object' &&
    profile.settings.memory != null
  ) {
    return profile.settings.memory as {
      autoWrite?: boolean;
      contextMaxItems?: number;
      crossConversation?: boolean;
      enabled?: boolean;
      recentMessageWindow?: number;
      summaryMinMessages?: number;
    };
  }

  return null;
}

async function buildChatMessagesWithSummary(
  messages: UIMessage[],
  summary?: string | null,
  memorySettings?: {
    recentMessageWindow?: number;
    summaryMinMessages?: number;
  } | null
) {
  const config = resolveConversationSummaryConfig(memorySettings);
  const summaryMessage = summary ? buildConversationSummaryContext(summary) : null;

  if (!summaryMessage || messages.length <= config.recentMessageWindow) {
    return convertToModelMessages(messages as unknown as UIMessage[]);
  }

  const scopedMessages = [summaryMessage, ...messages.slice(-config.recentMessageWindow)];
  return convertToModelMessages(scopedMessages as unknown as UIMessage[]);
}

export async function handleChatPost(request: Request) {
  const locale = getLocaleFromRequest(request);

  try {
    const { conversationId, conversationSummary, messages, runtimeModel } = await validateRequest(
      request,
      chatPostSchema
    );

    if (!runtimeModel) {
      throw new AppError(
        ErrorCode.INPUT_INVALID,
        'A runtime model configuration is required for chat requests.',
        400
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let persistedConversationSummary: string | null = null;
    let memoryContext: string | null = null;
    let memorySettings: ReturnType<typeof getProfileMemorySettings> = null;

    if (user) {
      const profile = await getProfileById(user.id, supabase);
      memorySettings = getProfileMemorySettings(profile);

      if (memorySettings?.enabled && memorySettings.crossConversation) {
        const memories = await listMemoriesForUser(user.id, supabase);
        memoryContext = buildMemoryContext(memories, {
          memorySettings,
          query: buildMemoryRetrievalQuery(messages as unknown as UIMessage[]),
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

    const result = streamText({
      model: getRuntimeChatModel(runtimeModel),
      system: getSystemPrompt(locale, { memoryContext }),
      messages: await buildChatMessagesWithSummary(
        messages as unknown as UIMessage[],
        persistedConversationSummary ?? conversationSummary ?? null,
        memorySettings
      ),
      ...(hasAgentTools ? { tools: agentTools } : {}),
      maxOutputTokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
    });

    result.consumeStream();

    return result.toUIMessageStreamResponse({
      originalMessages: messages as unknown as UIMessage[],
      onFinish: ({ messages: responseMessages }) => {
        if (!conversationId) {
          return;
        }

        void (async () => {
          try {
            if (!user) {
              logger.warn('Chat onFinish: user not authenticated, messages not saved', {
                conversationId,
              });
              return;
            }

            await saveConversationMessages(
              {
                conversationId,
                locale,
                memorySettings,
                messages: responseMessages,
                runtimeModel,
                userId: user.id,
              },
              supabase
            );

            if (memorySettings?.enabled && memorySettings.autoWrite) {
              await saveConversationMemories(
                {
                  conversationId,
                  locale,
                  messages: responseMessages,
                  runtimeModel,
                  userId: user.id,
                },
                supabase
              );
            }
          } catch (saveError) {
            logger.error('Chat onFinish: failed to save messages', {
              conversationId,
              error: saveError instanceof Error ? saveError.message : String(saveError),
            });
          }
        })();
      },
      onError: () => t(locale, 'chat.errors.request_failed'),
    });
  } catch (error) {
    return handleErrorWithLocale(error, locale);
  }
}
