import { describe, expect, it } from 'vitest';
import type { UIMessage } from 'ai';

import { buildAgentInput } from '@/features/chat/agent-runtime/build-agent-input';

describe('buildAgentInput', () => {
  const messages = [
    {
      id: 'msg_1',
      parts: [{ text: 'Hello', type: 'text' }],
      role: 'user',
    },
  ] as unknown as UIMessage[];

  it('includes active subagents in the system prompt when enabled', async () => {
    const result = await buildAgentInput({
      locale: 'en-US',
      messages,
      subagentSettings: {
        agents: [
          {
            description: 'Reviews factual risk',
            enabled: true,
            id: 'reviewer',
            maxTokens: 1024,
            name: 'Reviewer',
            systemPrompt: 'Review carefully.',
            temperature: 0.3,
            themeColor: '#14b8a6',
          },
          {
            description: 'Disabled helper',
            enabled: false,
            id: 'disabled',
            maxTokens: 1024,
            name: 'Disabled',
            systemPrompt: 'Should not appear.',
            temperature: 0.5,
            themeColor: '#f97316',
          },
        ],
        enabled: true,
      },
    });

    expect(result.system).toContain('Available subagents:');
    expect(result.system).toContain('- Reviewer');
    expect(result.system).not.toContain('- Disabled');
  });

  it('omits the subagent roster when subagents are disabled', async () => {
    const result = await buildAgentInput({
      locale: 'en-US',
      messages,
      subagentSettings: {
        agents: [
          {
            description: 'Reviews factual risk',
            enabled: true,
            id: 'reviewer',
            maxTokens: 1024,
            name: 'Reviewer',
            systemPrompt: 'Review carefully.',
            temperature: 0.3,
            themeColor: '#14b8a6',
          },
        ],
        enabled: false,
      },
    });

    expect(result.system).not.toContain('Available subagents:');
    expect(result.system).not.toContain('- Reviewer');
  });
});
