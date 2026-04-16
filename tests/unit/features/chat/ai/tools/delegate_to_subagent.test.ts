import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DelegateToSubagentOutput } from '@/features/subagent/delegation';

const {
  loggerErrorMock,
  loggerInfoMock,
  readUIMessageStreamMock,
  streamMock,
  toolLoopAgentConstructorMock,
} = vi.hoisted(() => ({
  loggerErrorMock: vi.fn(),
  loggerInfoMock: vi.fn(),
  readUIMessageStreamMock: vi.fn(),
  streamMock: vi.fn(),
  toolLoopAgentConstructorMock: vi.fn(),
}));

vi.mock('ai', () => {
  class MockToolLoopAgent {
    constructor(settings: unknown) {
      toolLoopAgentConstructorMock(settings);
    }

    stream = streamMock;
  }

  return {
    readUIMessageStream: readUIMessageStreamMock,
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

async function collectOutputs(iterable: AsyncIterable<DelegateToSubagentOutput>) {
  const outputs: DelegateToSubagentOutput[] = [];

  for await (const value of iterable) {
    outputs.push(value);
  }

  return outputs;
}

describe('createDelegateToSubagentTool', () => {
  beforeEach(() => {
    loggerErrorMock.mockReset();
    loggerInfoMock.mockReset();
    readUIMessageStreamMock.mockReset();
    streamMock.mockReset();
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

  it('streams the selected subagent and returns structured output', async () => {
    const streamedMessages = [
      {
        id: 'subagent-message',
        parts: [{ state: 'streaming', text: 'Working through the plan...', type: 'text' }],
        role: 'assistant',
      },
      {
        id: 'subagent-message',
        parts: [
          { state: 'done', text: 'Subagent summary', type: 'text' },
          {
            input: { location: 'repo' },
            output: { result: 'ok' },
            preliminary: false,
            state: 'output-available',
            toolCallId: 'nested-tool-call',
            type: 'tool-web_search',
          },
        ],
        role: 'assistant',
      },
    ];

    const uiMessageStream = (async function* () {
      for (const message of streamedMessages) {
        yield message;
      }
    })();

    streamMock.mockResolvedValue({
      toUIMessageStream: () => uiMessageStream,
    });
    readUIMessageStreamMock.mockImplementation(({ stream }) => stream);

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

    const outputs = await collectOutputs(
      tool!.execute!(
        {
          subagentId: 'reviewer',
          task: 'Inspect the answer',
        },
        {
          toolCallId: 'tool-call-1',
          abortSignal: abortController.signal,
        } as never
      ) as AsyncIterable<DelegateToSubagentOutput>
    );

    expect(outputs).toHaveLength(3);
    expect(outputs[0]).toEqual({
      message: {
        id: 'tool-call-1-subagent',
        parts: [],
        role: 'assistant',
      },
      subagentDescription: 'Reviews factual risk',
      subagentId: 'reviewer',
      subagentName: 'Reviewer',
      subagentThemeColor: '#14b8a6',
      summary: 'Reviewer completed the delegated task.',
      task: 'Inspect the answer',
    });
    expect(outputs[1]).toEqual({
      message: streamedMessages[0],
      subagentDescription: 'Reviews factual risk',
      subagentId: 'reviewer',
      subagentName: 'Reviewer',
      subagentThemeColor: '#14b8a6',
      summary: 'Working through the plan...',
      task: 'Inspect the answer',
    });
    expect(outputs[2]).toEqual({
      message: streamedMessages[1],
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
    expect(streamMock).toHaveBeenCalledWith({
      abortSignal: abortController.signal,
      prompt: 'Inspect the answer',
    });
    expect(readUIMessageStreamMock).toHaveBeenCalledTimes(1);
    expect(
      tool!.toModelOutput!({
        input: {
          subagentId: 'reviewer',
          task: 'Inspect the answer',
        },
        output: outputs[2],
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
    streamMock.mockRejectedValue(subagentError);

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
      collectOutputs(
        tool!.execute!(
          {
            subagentId: 'reviewer',
            task: 'Inspect the answer',
          },
          {
            toolCallId: 'tool-call-2',
          } as never
        ) as AsyncIterable<DelegateToSubagentOutput>
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
