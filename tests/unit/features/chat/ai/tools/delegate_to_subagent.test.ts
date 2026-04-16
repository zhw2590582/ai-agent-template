import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DelegateToSubagentOutput } from '@/features/subagents/delegation';

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
            toolAccess: 'web',
          },
        ],
        enabled: true,
      },
      tools: {
        web_search: { description: 'search' },
        sandbox_run_command: { description: 'run' },
        mcp_repo_search: { description: 'mcp' },
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
        tools: {
          web_search: { description: 'search' },
        },
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
      'Subagent delegation: filtered tools',
      expect.objectContaining({
        allowedToolCount: 1,
        allowedToolNames: ['web_search'],
        subagentId: 'reviewer',
        toolAccess: 'web',
      })
    );
    expect(loggerInfoMock).toHaveBeenNthCalledWith(
      3,
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

  it('limits code subagents to sandbox tools only', async () => {
    streamMock.mockResolvedValue({
      toUIMessageStream: () =>
        (async function* () {
          yield {
            id: 'code-message',
            parts: [{ state: 'done', text: 'Implemented the change', type: 'text' }],
            role: 'assistant',
          };
        })(),
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
            description: 'Handles implementation',
            enabled: true,
            id: 'coder',
            maxTokens: 1024,
            name: 'Coder',
            systemPrompt: 'Write code carefully.',
            temperature: 0.3,
            themeColor: '#7c3aed',
            toolAccess: 'code',
          },
        ],
        enabled: true,
      },
      tools: {
        web_search: { description: 'search' },
        sandbox_run_command: { description: 'run' },
        sandbox_write_file: { description: 'write' },
        mcp_repo_search: { description: 'mcp' },
      } as never,
    });

    await collectOutputs(
      tool!.execute!(
        {
          subagentId: 'coder',
          task: 'Implement the fix',
        },
        {
          toolCallId: 'tool-call-code',
        } as never
      ) as AsyncIterable<DelegateToSubagentOutput>
    );

    expect(toolLoopAgentConstructorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: {
          sandbox_run_command: { description: 'run' },
          sandbox_write_file: { description: 'write' },
        },
      })
    );
    expect(loggerInfoMock).toHaveBeenCalledWith(
      'Subagent delegation: filtered tools',
      expect.objectContaining({
        allowedToolCount: 2,
        allowedToolNames: ['sandbox_run_command', 'sandbox_write_file'],
        subagentId: 'coder',
        toolAccess: 'code',
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
            toolAccess: 'none',
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

  it('injects retrieved knowledge-base context for rag tool access without passing tools', async () => {
    streamMock.mockResolvedValue({
      toUIMessageStream: () =>
        (async function* () {
          yield {
            id: 'rag-message',
            parts: [{ state: 'done', text: 'Grounded answer', type: 'text' }],
            role: 'assistant',
          };
        })(),
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
            description: 'Answers from the knowledge base',
            enabled: true,
            id: 'rag-agent',
            maxTokens: 1024,
            name: 'Knowledge Base Agent',
            systemPrompt: 'Stay grounded in retrieved evidence.',
            temperature: 0.2,
            themeColor: '#0891b2',
            toolAccess: 'rag',
          },
        ],
        enabled: true,
      },
      tools: {
        web_search: { description: 'search' },
        sandbox_run_command: { description: 'run' },
      } as never,
      ragContext: '[KB1] Product docs\nThe app supports RAG grounded answers.',
    });

    await collectOutputs(
      tool!.execute!(
        {
          subagentId: 'rag-agent',
          task: 'Answer from the knowledge base only.',
        },
        {
          toolCallId: 'tool-call-3',
        } as never
      ) as AsyncIterable<DelegateToSubagentOutput>
    );

    expect(toolLoopAgentConstructorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: expect.stringContaining('[KB1] Product docs'),
        tools: {},
      })
    );
  });
});
