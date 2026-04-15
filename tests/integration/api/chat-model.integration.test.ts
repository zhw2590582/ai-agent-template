import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockStreamText = vi.fn();
const mockGenerateText = vi.fn(async () => ({ text: 'mock-generated-text' }));
const mockConvertToModelMessages = vi.fn(async (messages) => messages);

vi.mock('ai', () => ({
  Output: {
    array: vi.fn((schema) => schema),
  },
  convertToModelMessages: mockConvertToModelMessages,
  generateText: mockGenerateText,
  stepCountIs: vi.fn(() => () => false),
  streamText: mockStreamText,
  tool: vi.fn((definition) => definition),
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
  buildSandboxAgentTools: vi.fn(() => ({})),
  buildSearchAgentTools: vi.fn(() => ({})),
}));

vi.mock('@/config/chat', () => ({
  AI_CONFIG: {
    AGENT_MAX_STEPS: 10,
    CHAT_MAX_DURATION: 60,
    DEFAULT_MAX_TOKENS: 1024,
    MEMORY_CONSOLIDATION_MAX_OUTPUT_TOKENS: 260,
    MEMORY_EXTRACTION_MAX_OUTPUT_TOKENS: 220,
    SUMMARY_MAX_OUTPUT_TOKENS: 220,
    TITLE_MAX_OUTPUT_TOKENS: 32,
  },
}));
vi.mock('@/config/dev', () => ({
  DEV_CONFIG: { ENABLE_DEBUG_LOGS: false },
}));

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
    mockGenerateText.mockClear();
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
