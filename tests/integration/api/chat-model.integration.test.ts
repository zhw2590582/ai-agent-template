import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockStreamText = vi.fn();
const mockConvertToModelMessages = vi.fn(async (messages) => messages);

vi.mock('ai', () => ({
  convertToModelMessages: mockConvertToModelMessages,
  streamText: mockStreamText,
}));

vi.mock('@/features/chat/ai/models', () => ({
  defaultModel: { chat: 'default-model' },
  getChatModel: vi.fn((model: string) => `resolved:${model}`),
}));

vi.mock('@/features/chat/ai/prompts', () => ({
  getSystemPrompt: vi.fn(() => 'mock-system-prompt'),
}));

vi.mock('@/features/chat/ai/tools', () => ({
  agentTools: {},
}));

vi.mock('@/config/app', () => ({
  AI_CONFIG: { DEFAULT_MAX_TOKENS: 1024 },
  DEV_CONFIG: { ENABLE_DEBUG_LOGS: false },
}));

vi.mock('@/config/env', () => ({
  env: { DEEPSEEK_API_KEY: 'test', NODE_ENV: 'test' },
  getSupabaseEnv: () => ({
    publishableKey: 'test-key',
    url: 'https://example.supabase.co',
  }),
  isSupabaseConfigured: () => true,
  isSentryConfigured: () => false,
}));

describe('chat model integration', () => {
  beforeEach(() => {
    mockStreamText.mockReset();
    mockConvertToModelMessages.mockClear();
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response('ok'),
    });
  });

  it('uses the selected model from the request body', async () => {
    const request = new Request('http://localhost/api/chat?lang=en-US', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'hello' }] }],
        model: 'deepseek-coder',
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const { POST } = await import('@/app/api/chat/route');
    await POST(request);

    expect(mockStreamText).toHaveBeenCalledTimes(1);
    expect(mockStreamText.mock.calls[0]?.[0]).toMatchObject({
      model: 'resolved:deepseek-coder',
    });
  });

  it('falls back to the default model when no model is provided', async () => {
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
    await POST(request);

    expect(mockStreamText).toHaveBeenCalledTimes(1);
    expect(mockStreamText.mock.calls[0]?.[0]).toMatchObject({
      model: 'default-model',
    });
  });
});
