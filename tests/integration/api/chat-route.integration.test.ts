import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockHandleChatPost = vi.fn();

vi.mock('@/features/chat/server/chat', () => ({
  maxDuration: 123,
  handleChatPost: mockHandleChatPost,
}));

describe('chat route integration', () => {
  beforeEach(() => {
    mockHandleChatPost.mockReset();
  });

  it('forwards POST request to handleChatPost', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'hello' }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const expectedResponse = new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: {
        'content-type': 'application/json',
      },
    });

    mockHandleChatPost.mockResolvedValueOnce(expectedResponse);

    const { POST } = await import('@/app/api/chat/route');
    const response = await POST(request);

    expect(mockHandleChatPost).toHaveBeenCalledTimes(1);
    expect(mockHandleChatPost).toHaveBeenCalledWith(request);
    expect(response).toBe(expectedResponse);
  });

  it('re-exports maxDuration from server/chat', async () => {
    const routeModule = await import('@/app/api/chat/route');

    expect(routeModule.maxDuration).toBe(123);
  });
});
