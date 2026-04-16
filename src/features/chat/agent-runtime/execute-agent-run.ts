import { stepCountIs, streamText } from 'ai';

import { AI_CONFIG } from '@/config/chat';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import { buildAgentInput } from '@/features/chat/agent-runtime/build-agent-input';
import type { ExecuteAgentRunOptions } from '@/features/chat/agent-runtime/types';
import { logger } from '@/lib/logger';

export async function executeAgentRun({
  conversationSummary,
  hasAgentTools,
  locale,
  memoryContext,
  memorySettings,
  messages,
  mcpInjectedTools = [],
  persistedConversationSummary,
  ragContext,
  runtimeModel,
  tools,
}: ExecuteAgentRunOptions) {
  const mcpToolByInjectedName = new Map(
    mcpInjectedTools.map((tool) => [tool.injectedToolName, tool] as const)
  );
  const agentInput = await buildAgentInput({
    conversationSummary,
    locale,
    memoryContext,
    memorySettings,
    messages,
    persistedConversationSummary,
    ragContext,
  });

  return streamText({
    model: getRuntimeChatModel(runtimeModel),
    system: agentInput.system,
    messages: agentInput.messages,
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
