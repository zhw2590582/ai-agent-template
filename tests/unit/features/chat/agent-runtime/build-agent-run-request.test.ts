import { describe, expect, it } from 'vitest';
import type { UIMessage } from 'ai';

import { buildAgentRunRequest } from '@/features/chat/agent-runtime/build-agent-run-request';

describe('buildAgentRunRequest', () => {
  const messages = [
    {
      id: 'msg_1',
      parts: [{ text: 'Hello', type: 'text' }],
      role: 'user',
    },
  ] as unknown as UIMessage[];

  it('prefers conversationId from request body over active thread id', () => {
    const request = buildAgentRunRequest({
      activeThreadId: 'thread_from_state',
      body: {
        conversationId: 'thread_from_body',
        customField: 'kept',
      },
      conversationSummary: 'summary',
      id: 'chat_1',
      messageId: 'message_1',
      messages,
      runtimeModel: null,
      trigger: 'submit-message',
    });

    expect(request).toMatchObject({
      conversationId: 'thread_from_body',
      conversationSummary: 'summary',
      customField: 'kept',
      id: 'chat_1',
      messageId: 'message_1',
      messages,
      trigger: 'submit-message',
    });
    expect(request.runtimeModel).toBeUndefined();
  });

  it('falls back to the active thread id when request body does not include one', () => {
    const request = buildAgentRunRequest({
      activeThreadId: 'thread_from_state',
      messages,
      runtimeModel: {
        apiFormat: 'openai',
        apiKey: 'test-key',
        baseUrl: 'https://example.com/v1',
        modelId: 'gpt-test',
        providerId: 'provider-test',
      },
    });

    expect(request.conversationId).toBe('thread_from_state');
    expect(request.runtimeModel?.modelId).toBe('gpt-test');
  });

  it('includes subagent settings when provided', () => {
    const request = buildAgentRunRequest({
      activeThreadId: 'thread_from_state',
      messages,
      runtimeModel: null,
      subagentSettings: {
        agents: [
          {
            description: 'Reviews factual risks',
            enabled: true,
            id: 'subagent-reviewer',
            maxTokens: 1024,
            name: 'Reviewer',
            systemPrompt: 'Review the answer carefully.',
            temperature: 0.3,
            themeColor: '#14b8a6',
            toolAccess: 'none',
          },
        ],
        enabled: true,
      },
    });

    expect(request.subagentSettings).toEqual({
      agents: [
        expect.objectContaining({
          id: 'subagent-reviewer',
          name: 'Reviewer',
        }),
      ],
      enabled: true,
    });
  });
});
