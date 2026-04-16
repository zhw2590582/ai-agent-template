import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateMock = vi.fn();
const toolLoopAgentConstructorMock = vi.fn();

vi.mock('ai', () => {
  class MockToolLoopAgent {
    constructor(settings: unknown) {
      toolLoopAgentConstructorMock(settings);
    }

    generate = generateMock;
  }

  return {
    ToolLoopAgent: MockToolLoopAgent,
    stepCountIs: (count: number) => ({ count, type: 'stepCountIs' }),
    tool: <T>(config: T) => config,
  };
});

vi.mock('@/features/chat/ai/core/models', () => ({
  getRuntimeChatModel: vi.fn(() => 'mock-model'),
}));

import { createDelegateToSubagentTool } from '@/features/chat/ai/tools/delegate_to_subagent';

describe('createDelegateToSubagentTool', () => {
  beforeEach(() => {
    generateMock.mockReset();
    toolLoopAgentConstructorMock.mockReset();
  });

  it('returns null when no enabled subagents are available', () => {
    expect(
      createDelegateToSubagentTool({
        runtimeModel: {
          apiFormat: 'openai',
          apiKey: 'key',
          baseUrl: 'https://example.com/v1',
          modelId: 'model',
          providerId: 'provider',
        },
        subagentSettings: {
          agents: [],
          enabled: false,
        },
        tools: {},
      })
    ).toBeNull();
  });

  it('runs the selected subagent and returns its summary text', async () => {
    generateMock.mockResolvedValue({
      text: 'Subagent summary',
    });

    const tool = createDelegateToSubagentTool({
      runtimeModel: {
        apiFormat: 'openai',
        apiKey: 'key',
        baseUrl: 'https://example.com/v1',
        modelId: 'model',
        providerId: 'provider',
      },
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
        enabled: true,
      },
      tools: {
        web_search: { description: 'search' },
      } as never,
    });

    const abortController = new AbortController();
    const result = await tool?.execute?.(
      {
        subagentId: 'reviewer',
        task: 'Inspect the answer',
      },
      {
        abortSignal: abortController.signal,
      } as never
    );

    expect(result).toBe('Subagent summary');
    expect(toolLoopAgentConstructorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: expect.stringContaining('Review carefully.'),
        maxOutputTokens: 1024,
        model: 'mock-model',
        temperature: 0.3,
      })
    );
    expect(generateMock).toHaveBeenCalledWith({
      abortSignal: abortController.signal,
      prompt: 'Inspect the answer',
    });
  });
});
