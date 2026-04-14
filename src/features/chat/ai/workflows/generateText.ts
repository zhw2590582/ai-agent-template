import { stepCountIs, streamText, type ToolSet, type UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/chat';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import { getSystemPrompt } from '@/features/chat/ai/core/prompts';
import { buildChatMessagesWithSummary } from '@/features/chat/server/chat-message-context';
import type { ChatProfileMemorySettings } from '@/features/chat/server/chat-request-context';
import type { Locale } from '@/config/i18n';
import type { ChatRuntimeModel } from '@/features/models/types';

interface RunGenerateTextWorkflowOptions {
  conversationSummary?: string | null;
  hasAgentTools: boolean;
  hasMcpTools?: boolean;
  hasSearchTools?: boolean;
  locale: Locale;
  memoryContext?: string | null;
  memorySettings?: ChatProfileMemorySettings | null;
  messages: UIMessage[];
  mcpServerNames?: string[] | null;
  persistedConversationSummary?: string | null;
  runtimeModel: ChatRuntimeModel;
  tools: ToolSet;
}

export async function runGenerateTextWorkflow({
  conversationSummary,
  hasAgentTools,
  hasMcpTools,
  hasSearchTools,
  locale,
  memoryContext,
  memorySettings,
  messages,
  mcpServerNames,
  persistedConversationSummary,
  runtimeModel,
  tools,
}: RunGenerateTextWorkflowOptions) {
  return streamText({
    model: getRuntimeChatModel(runtimeModel),
    system: getSystemPrompt(locale, {
      hasMcpTools,
      memoryContext,
      mcpServerNames,
      webSearchEnabled: hasSearchTools,
    }),
    messages: await buildChatMessagesWithSummary(
      messages,
      persistedConversationSummary ?? conversationSummary ?? null,
      memorySettings
    ),
    ...(hasAgentTools
      ? {
          stopWhen: stepCountIs(AI_CONFIG.AGENT_MAX_STEPS),
          tools,
        }
      : {}),
    maxOutputTokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
  });
}
