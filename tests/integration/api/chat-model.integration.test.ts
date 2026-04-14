import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockStreamText = vi.fn();
const mockConvertToModelMessages = vi.fn(async (messages) => messages);

vi.mock('ai', () => ({
  convertToModelMessages: mockConvertToModelMessages,
  streamText: mockStreamText,
}));

vi.mock('@/features/chat/ai/core/models', () => ({
  getRuntimeChatModel: vi.fn(
    (runtimeModel: { modelId: string }) => `runtime:${runtimeModel.modelId}`
  ),
}));

vi.mock('@/features/chat/ai/core/prompts', () => ({
  getSystemPrompt: vi.fn(() => 'mock-system-prompt'),
}));

vi.mock('@/features/chat/ai/tools', () => ({
  buildAgentTools: vi.fn(() => ({})),
}));

vi.mock('@/config/chat', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/chat')>();

  return {
    ...actual,
    AI_CONFIG: { ...actual.AI_CONFIG, DEFAULT_MAX_TOKENS: 1024 },
  };
});
vi.mock('@/config/dev', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/dev')>();

  return {
    ...actual,
    DEV_CONFIG: { ...actual.DEV_CONFIG, ENABLE_DEBUG_LOGS: false },
  };
});

vi.mock('@/config/env', () => ({
  env: { NODE_ENV: 'test' },
  getSupabaseEnv: () => ({
    publishableKey: 'test-key',
    url: 'https://example.supabase.co',
  }),
  isSupabaseConfigured: () => true,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: null },
      })),
    },
  })),
}));

describe('chat model integration', () => {
  beforeEach(() => {
    mockStreamText.mockReset();
    mockConvertToModelMessages.mockClear();
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response('ok'),
    });
  });

  it('returns a validation error when runtime model config is missing', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'hello' }] }],
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const { POST } = await import('@/app/api/chat/route');
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockStreamText).not.toHaveBeenCalled();
  });

  it('uses the runtime model when provider config is provided', async () => {
    const request = new Request('http://localhost/api/chat?lang=en-US', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'hello' }] }],
        runtimeModel: {
          apiFormat: 'openai',
          apiKey: 'test-key',
          baseUrl: 'https://example.com/v1',
          modelId: 'gpt-4.1-mini',
          providerId: 'openai',
        },
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const { POST } = await import('@/app/api/chat/route');
    await POST(request);

    expect(mockStreamText).toHaveBeenCalledTimes(1);
    expect(mockStreamText.mock.calls[0]?.[0]).toMatchObject({
      model: 'runtime:gpt-4.1-mini',
    });
  });
});
