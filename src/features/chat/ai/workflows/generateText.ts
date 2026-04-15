import { stepCountIs, streamText, type ToolSet, type UIMessage } from 'ai';

import { AI_CONFIG } from '@/config/chat';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import { getSystemPrompt } from '@/features/chat/ai/core/prompts';
import { buildChatMessagesWithSummary } from '@/features/chat/server/chat-message-context';
import { logger } from '@/lib/logger';
import type { ChatProfileMemorySettings } from '@/features/chat/server/chat-request-context';
import type { Locale } from '@/config/i18n';
import type { ChatRuntimeModel } from '@/features/models/types';

interface RunGenerateTextWorkflowOptions {
  conversationSummary?: string | null;
  hasAgentTools: boolean;
  hasMcpTools?: boolean;
  hasSandboxTools?: boolean;
  hasSearchTools?: boolean;
  locale: Locale;
  memoryContext?: string | null;
  memorySettings?: ChatProfileMemorySettings | null;
  messages: UIMessage[];
  mcpInjectedTools?: Array<{
    injectedToolName: string;
    originalToolName: string;
    serverId: string;
    serverName: string;
  }>;
  mcpServerNames?: string[] | null;
  persistedConversationSummary?: string | null;
  runtimeModel: ChatRuntimeModel;
  tools: ToolSet;
}

export async function runGenerateTextWorkflow({
  conversationSummary,
  hasAgentTools,
  hasMcpTools,
  hasSandboxTools,
  hasSearchTools,
  locale,
  memoryContext,
  memorySettings,
  messages,
  mcpInjectedTools = [],
  mcpServerNames,
  persistedConversationSummary,
  runtimeModel,
  tools,
}: RunGenerateTextWorkflowOptions) {
  const mcpToolByInjectedName = new Map(
    mcpInjectedTools.map((tool) => [tool.injectedToolName, tool] as const)
  );

  return streamText({
    model: getRuntimeChatModel(runtimeModel),
    system: getSystemPrompt(locale, {
      hasMcpTools,
      memoryContext,
      mcpServerNames,
      sandboxEnabled: hasSandboxTools,
      webSearchEnabled: hasSearchTools,
    }),
    messages: await buildChatMessagesWithSummary(
      messages,
      persistedConversationSummary ?? conversationSummary ?? null,
      memorySettings
    ),
    ...(hasAgentTools
      ? {
          onStepFinish: (step) => {
            for (const toolCall of step.toolCalls) {
              const observedTool = mcpToolByInjectedName.get(toolCall.toolName);

              if (!observedTool) {
                continue;
              }

              logger.info('Chat workflow: MCP tool executed', {
                inputAvailable: toolCall.input != null,
                injectedToolName: observedTool.injectedToolName,
                originalToolName: observedTool.originalToolName,
                serverId: observedTool.serverId,
                serverName: observedTool.serverName,
                toolCallId: toolCall.toolCallId,
              });
            }

            for (const toolResult of step.toolResults) {
              const observedTool = mcpToolByInjectedName.get(toolResult.toolName);

              if (!observedTool) {
                continue;
              }

              logger.info('Chat workflow: MCP tool result received', {
                hasOutput: toolResult.output != null,
                injectedToolName: observedTool.injectedToolName,
                originalToolName: observedTool.originalToolName,
                serverId: observedTool.serverId,
                serverName: observedTool.serverName,
                toolCallId: toolResult.toolCallId,
              });
            }
          },
          stopWhen: stepCountIs(AI_CONFIG.AGENT_MAX_STEPS),
          tools,
        }
      : {}),
    maxOutputTokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
  });
}
