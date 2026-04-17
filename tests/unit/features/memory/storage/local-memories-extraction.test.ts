/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  buildLocalConversationMemoryExtractionKey,
  getLocalConversationThreadById,
  markLocalConversationMemoryExtracted,
} = vi.hoisted(() => ({
  buildLocalConversationMemoryExtractionKey: vi.fn(),
  getLocalConversationThreadById: vi.fn(),
  markLocalConversationMemoryExtracted: vi.fn(),
}));

vi.mock('@/features/chat/storage/local-conversations', () => ({
  buildLocalConversationMemoryExtractionKey,
  getLocalConversationThreadById,
  markLocalConversationMemoryExtracted,
}));

import type { UIMessage } from 'ai';

import {
  extractAndMergeLocalMemories,
  writeLocalMemories,
} from '@/features/memory/storage/local-memories';

const SAMPLE_MESSAGES: UIMessage[] = [
  {
    id: 'message-1',
    parts: [{ type: 'text', text: 'hello' }],
    role: 'user',
  },
];

describe('extractAndMergeLocalMemories', () => {
  beforeEach(async () => {
    buildLocalConversationMemoryExtractionKey.mockReset();
    buildLocalConversationMemoryExtractionKey.mockReturnValue('1:message-1');
    getLocalConversationThreadById.mockReset();
    markLocalConversationMemoryExtracted.mockReset();
    vi.stubGlobal('fetch', vi.fn());
    await writeLocalMemories([]);
  });

  it('skips extraction when the current message snapshot was already extracted', async () => {
    getLocalConversationThreadById.mockResolvedValue({
      id: 'local-1',
      memoryExtractionKey: '1:message-1',
    });

    await extractAndMergeLocalMemories({
      conversationId: 'local-1',
      locale: 'en-US',
      messages: SAMPLE_MESSAGES,
      runtimeModel: {
        apiFormat: 'openai',
        apiKey: 'key',
        baseUrl: 'https://example.com/v1',
        modelId: 'model',
        providerId: 'provider',
      },
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(markLocalConversationMemoryExtracted).not.toHaveBeenCalled();
  });

  it('marks the extracted snapshot after a successful extraction', async () => {
    getLocalConversationThreadById.mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ memories: [] }),
    } as Response);

    await extractAndMergeLocalMemories({
      conversationId: 'local-1',
      locale: 'en-US',
      messages: SAMPLE_MESSAGES,
      runtimeModel: {
        apiFormat: 'openai',
        apiKey: 'key',
        baseUrl: 'https://example.com/v1',
        modelId: 'model',
        providerId: 'provider',
      },
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(markLocalConversationMemoryExtracted).toHaveBeenCalledWith({
      id: 'local-1',
      key: '1:message-1',
    });
  });
});
