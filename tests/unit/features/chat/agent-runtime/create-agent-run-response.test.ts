import type { UIMessage } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAgentRunMetadataBase } from '@/features/chat/agent-runtime/run-metadata';
import { createAgentRunResponse } from '@/features/chat/agent-runtime/create-agent-run-response';

const {
  mockCreateAgentRunFinishHandler,
  mockExecuteAgentRun,
  mockLogAgentRunFailed,
  mockLogAgentRunPrepared,
  mockTranslate,
} = vi.hoisted(() => ({
  mockCreateAgentRunFinishHandler: vi.fn(() => 'finish-handler'),
  mockExecuteAgentRun: vi.fn(),
  mockLogAgentRunFailed: vi.fn(),
  mockLogAgentRunPrepared: vi.fn(),
  mockTranslate: vi.fn((_locale: string, key: string) => `translated:${key}`),
}));

vi.mock('@/features/chat/agent-runtime/execute-agent-run', () => ({
  executeAgentRun: mockExecuteAgentRun,
}));

vi.mock('@/features/chat/agent-runtime/finish-agent-run', () => ({
  createAgentRunFinishHandler: mockCreateAgentRunFinishHandler,
}));

vi.mock('@/features/chat/agent-runtime/run-telemetry', () => ({
  logAgentRunFailed: mockLogAgentRunFailed,
  logAgentRunPrepared: mockLogAgentRunPrepared,
}));

vi.mock('@/lib/i18n', () => ({
  t: mockTranslate,
}));

describe('createAgentRunResponse', () => {
  const runtimeModel = {
    apiFormat: 'openai',
    apiKey: 'test-key',
    baseUrl: 'https://example.com/v1',
    modelId: 'gpt-test',
    providerId: 'provider-test',
  } as const;

  const messages = [
    {
      id: 'message_1',
      parts: [{ text: 'hello', type: 'text' }],
      role: 'user',
    },
  ] as UIMessage[];

  const runMetadataBase = createAgentRunMetadataBase({
    conversationId: 'conversation_1',
    hasAgentTools: true,
    hasSearchTools: true,
    mcpServerNames: ['server-1'],
    runtimeModel,
    userId: 'user_1',
    workspaceManifest: null,
    workspaceTelemetry: {
      closeReason: null,
      createdAt: '2026-04-16T00:00:00.000Z',
      lastEventAt: '2026-04-16T00:00:00.000Z',
      sandboxCreated: false,
      sandboxId: null,
      sessionState: 'unavailable',
    },
  });

  beforeEach(() => {
    mockCreateAgentRunFinishHandler.mockClear();
    mockExecuteAgentRun.mockReset();
    mockLogAgentRunFailed.mockClear();
    mockLogAgentRunPrepared.mockClear();
    mockTranslate.mockClear();
  });

  it('wires stream response metadata and tolerates results without consumeStream', async () => {
    const response = new Response('ok');
    const ragSources = [
      {
        content: 'retrieved text',
        documentId: 'doc_1',
        documentTitle: 'Doc 1',
        id: 'chunk_1',
        score: 0.9,
        source: 'kb://doc_1',
      },
    ];
    let capturedOptions: Record<string, unknown> | undefined;

    mockExecuteAgentRun.mockResolvedValue({
      toUIMessageStreamResponse: vi.fn((options) => {
        capturedOptions = options;
        return response;
      }),
    });

    const result = await createAgentRunResponse({
      closeAgentResources: vi.fn(async () => undefined),
      hasAgentTools: true,
      locale: 'en-US',
      memoryContext: 'memory context',
      memorySettings: { autoWrite: true, enabled: true },
      messages,
      mcpInjectedTools: [],
      persistedConversationSummary: 'summary',
      ragContext: 'rag context',
      ragSources,
      runMetadataBase,
      runtimeModel,
      supabase: {} as never,
      tools: {},
      user: null,
    });

    expect(result).toBe(response);
    expect(mockExecuteAgentRun).toHaveBeenCalledWith(
      expect.objectContaining({
        hasAgentTools: true,
        locale: 'en-US',
        memorySettings: { autoWrite: true, enabled: true },
        runtimeModel,
      })
    );
    expect(mockLogAgentRunPrepared).toHaveBeenCalledWith(
      expect.objectContaining({
        messageCount: 1,
        runMetadata: expect.objectContaining({
          ragSourceCount: 1,
        }),
      })
    );
    expect(mockCreateAgentRunFinishHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        runMetadata: expect.objectContaining({
          ragSourceCount: 1,
        }),
      })
    );

    expect(capturedOptions).toBeDefined();

    const messageMetadata = capturedOptions?.messageMetadata as
      | ((input: { part: { type: string } }) => unknown)
      | undefined;
    const onError = capturedOptions?.onError as ((error: Error) => string) | undefined;

    expect(messageMetadata?.({ part: { type: 'text' } })).toBeUndefined();
    expect(messageMetadata?.({ part: { type: 'finish' } })).toEqual({
      ragSources,
    });
    expect(capturedOptions?.onFinish).toBe('finish-handler');
    expect(onError?.(new Error('stream failed'))).toBe('translated:chat.errors.request_failed');
    expect(mockLogAgentRunFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: 'stream',
      })
    );
  });

  it('closes resources and logs execute failures before rethrowing', async () => {
    const closeAgentResources = vi.fn(async () => undefined);
    const executeError = new Error('execute failed');

    mockExecuteAgentRun.mockRejectedValue(executeError);

    await expect(
      createAgentRunResponse({
        closeAgentResources,
        hasAgentTools: false,
        locale: 'en-US',
        memoryContext: null,
        memorySettings: null,
        messages,
        mcpInjectedTools: [],
        persistedConversationSummary: null,
        ragContext: null,
        runMetadataBase,
        runtimeModel,
        supabase: {} as never,
        tools: {},
        user: null,
      })
    ).rejects.toThrow('execute failed');

    expect(closeAgentResources).toHaveBeenCalledTimes(1);
    expect(mockLogAgentRunFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        error: executeError,
        stage: 'execute',
      })
    );
    expect(mockCreateAgentRunFinishHandler).not.toHaveBeenCalled();
  });
});
