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

import { API_ROUTES } from '@/config/api';
import {
  extractAndMergeLocalMemories,
  readLocalMemories,
  writeLocalMemories,
} from '@/features/memory/storage/local-memories';
import type { MemoryListItem } from '@/features/memory/types';

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

  it('consolidates guest local memories after a touched kind reaches the threshold', async () => {
    const existingMemories: MemoryListItem[] = Array.from({ length: 4 }, (_, index) => ({
      content: `Fact ${index + 1}`,
      conversationId: 'local-1',
      id: `memory-${index + 1}`,
      kind: 'fact',
      source: 'auto',
      updatedAt: `2026-04-17T00:00:0${index}.000Z`,
    }));

    await writeLocalMemories(existingMemories);
    getLocalConversationThreadById.mockResolvedValue(null);
    vi.mocked(fetch).mockImplementation(async (input) => {
      if (input === API_ROUTES.memoriesExtract) {
        return {
          ok: true,
          json: async () => ({
            memories: [{ content: 'Fact 5', kind: 'fact' }],
          }),
        } as Response;
      }

      if (input === API_ROUTES.memoriesConsolidate) {
        return {
          ok: true,
          json: async () => ({
            contents: ['Merged fact'],
          }),
        } as Response;
      }

      throw new Error(`Unexpected fetch input: ${String(input)}`);
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

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      API_ROUTES.memoriesExtract,
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      API_ROUTES.memoriesConsolidate,
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(readLocalMemories()).toEqual([
      expect.objectContaining({
        content: 'Merged fact',
        kind: 'fact',
      }),
    ]);
  });
});
