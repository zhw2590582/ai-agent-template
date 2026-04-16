import { stepCountIs, tool, ToolLoopAgent, type ToolSet } from 'ai';
import { z } from 'zod';

import { AI_CONFIG } from '@/config/chat';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import { listActiveSubagents } from '@/features/subagent/settings';
import type { SubagentSettings } from '@/features/subagent/types';
import type { ChatRuntimeModel } from '@/features/models/types';

interface CreateDelegateToSubagentToolOptions {
  runtimeModel: ChatRuntimeModel;
  subagentSettings: SubagentSettings | null | undefined;
  tools: ToolSet;
}

function buildSubagentToolDescription(settings: SubagentSettings | null | undefined) {
  const activeSubagents = listActiveSubagents(settings);

  if (activeSubagents.length === 0) {
    return null;
  }

  const roster = activeSubagents
    .map((agent) =>
      agent.description
        ? `${agent.id} (${agent.name}): ${agent.description}`
        : `${agent.id} (${agent.name})`
    )
    .join('; ');

  return `Delegate a context-heavy or specialized task to one of the configured subagents. Only use this when the task clearly benefits from a specialist role or isolated work. Available subagents: ${roster}`;
}

function buildSubagentInstructions(name: string, description: string, systemPrompt: string) {
  const descriptionLine = description ? `Role description: ${description}` : '';

  return [
    `You are the subagent "${name}".`,
    descriptionLine,
    systemPrompt.trim(),
    'Complete the delegated task autonomously using the tools available to you.',
    'When you finish, return a concise but complete final summary for the main agent.',
    'Do not say "Done" without including the actual findings or outcome.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function createDelegateToSubagentTool({
  runtimeModel,
  subagentSettings,
  tools,
}: CreateDelegateToSubagentToolOptions) {
  const description = buildSubagentToolDescription(subagentSettings);

  if (!description) {
    return null;
  }

  return tool({
    description,
    inputSchema: z.object({
      subagentId: z.string().min(1).describe('The id of the subagent to delegate to'),
      task: z.string().min(1).describe('The task the selected subagent should complete'),
    }),
    execute: async ({ subagentId, task }, { abortSignal }) => {
      const activeSubagents = listActiveSubagents(subagentSettings);
      const subagent = activeSubagents.find((agent) => agent.id === subagentId);

      if (!subagent) {
        throw new Error(`Unknown or disabled subagent: ${subagentId}`);
      }

      const subagentAgent = new ToolLoopAgent({
        instructions: buildSubagentInstructions(
          subagent.name,
          subagent.description,
          subagent.systemPrompt
        ),
        maxOutputTokens: subagent.maxTokens,
        model: getRuntimeChatModel(runtimeModel),
        stopWhen: stepCountIs(AI_CONFIG.AGENT_MAX_STEPS),
        temperature: subagent.temperature,
        tools,
      });

      const result = await subagentAgent.generate({
        abortSignal,
        prompt: task,
      });

      return result.text.trim() || `${subagent.name} completed the delegated task.`;
    },
  });
}
