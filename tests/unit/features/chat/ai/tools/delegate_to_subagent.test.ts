import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DelegateToSubagentOutput } from '@/features/subagent/delegation';

const { generateMock, loggerErrorMock, loggerInfoMock, toolLoopAgentConstructorMock } = vi.hoisted(
  () => ({
    generateMock: vi.fn(),
    loggerErrorMock: vi.fn(),
    loggerInfoMock: vi.fn(),
    toolLoopAgentConstructorMock: vi.fn(),
  })
);

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

vi.mock('@/lib/logger', () => ({
  logger: {
    error: loggerErrorMock,
    info: loggerInfoMock,
  },
}));

import { createDelegateToSubagentTool } from '@/features/chat/ai/tools/delegate_to_subagent';

describe('createDelegateToSubagentTool', () => {
  beforeEach(() => {
    generateMock.mockReset();
    loggerErrorMock.mockReset();
    loggerInfoMock.mockReset();
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

  it('runs the selected subagent and returns structured output', async () => {
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
    expect(tool?.execute).toBeDefined();

    const result = (await tool!.execute!(
      {
        subagentId: 'reviewer',
        task: 'Inspect the answer',
      },
      {
        toolCallId: 'tool-call-1',
        abortSignal: abortController.signal,
      } as never
    )) as DelegateToSubagentOutput;

    expect(result).toEqual({
      subagentDescription: 'Reviews factual risk',
      subagentId: 'reviewer',
      subagentName: 'Reviewer',
      subagentThemeColor: '#14b8a6',
      summary: 'Subagent summary',
      task: 'Inspect the answer',
    });
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
    expect(
      tool!.toModelOutput!({
        input: {
          subagentId: 'reviewer',
          task: 'Inspect the answer',
        },
        output: result,
        toolCallId: 'tool-call-1',
      })
    ).toEqual({
      type: 'text',
      value: 'Reviewer summary:\nSubagent summary',
    });
    expect(loggerInfoMock).toHaveBeenNthCalledWith(
      1,
      'Subagent delegation: started',
      expect.objectContaining({
        modelId: 'model',
        providerId: 'provider',
        subagentId: 'reviewer',
        subagentName: 'Reviewer',
        toolCallId: 'tool-call-1',
      })
    );
    expect(loggerInfoMock).toHaveBeenNthCalledWith(
      2,
      'Subagent delegation: completed',
      expect.objectContaining({
        modelId: 'model',
        providerId: 'provider',
        subagentId: 'reviewer',
        subagentName: 'Reviewer',
        summaryLength: 'Subagent summary'.length,
        toolCallId: 'tool-call-1',
      })
    );
  });

  it('logs failures and rethrows the subagent error', async () => {
    const subagentError = new Error('Subagent failed');
    generateMock.mockRejectedValue(subagentError);

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
      tools: {} as never,
    });

    await expect(
      tool!.execute!(
        {
          subagentId: 'reviewer',
          task: 'Inspect the answer',
        },
        {
          toolCallId: 'tool-call-2',
        } as never
      )
    ).rejects.toThrow('Subagent failed');

    expect(loggerErrorMock).toHaveBeenCalledWith(
      'Subagent delegation: failed',
      expect.objectContaining({
        error: 'Subagent failed',
        modelId: 'model',
        providerId: 'provider',
        subagentId: 'reviewer',
        subagentName: 'Reviewer',
        toolCallId: 'tool-call-2',
      })
    );
  });
});
