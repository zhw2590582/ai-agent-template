import { describe, it, expect, vi, beforeAll } from 'vitest';
// Mock all AI/model/env dependencies to avoid requiring real API keys or env
vi.mock('@/server/ai/models', () => ({
  defaultModel: { chat: {} },
}));
vi.mock('@/server/ai/prompts', () => ({
  DEFAULT_SYSTEM_PROMPT: 'mock',
}));
vi.mock('@/server/ai/tools', () => ({
  agentTools: [],
}));
vi.mock('@/config/app', () => ({
  AI_CONFIG: { DEFAULT_MAX_TOKENS: 1024 },
  DEV_CONFIG: { ENABLE_DEBUG_LOGS: false, SHOW_PERFORMANCE_METRICS: false },
}));
vi.mock('@/config/env', () => ({
  env: { DEEPSEEK_API_KEY: 'test', NODE_ENV: 'test' },
}));

// Integration test for error i18n: ensures error responses are in English when requested

describe('chat API error i18n integration', () => {
  beforeAll(() => {
    // Reset modules to ensure mocks apply
    vi.resetModules();
  });
  it('returns error message in English when lang=en-US', async () => {
    // Simulate a POST request with invalid body (missing messages)
    const request = new Request('http://localhost/api/chat?lang=en-US', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const { POST } = await import('@/app/api/chat/route');
    const response = await POST(request);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.headers.get('content-type')).toContain('application/json');
    const json = await response.json();
    expect(json).toHaveProperty('error');
    expect(json.error).toHaveProperty('message');
    // Should be English, not Chinese
    expect(json.error.message).toMatch(/invalid|input|message|error/i);
    // Should not contain Chinese characters
    expect(/[\u4e00-\u9fa5]/.test(json.error.message)).toBe(false);
  });
});
