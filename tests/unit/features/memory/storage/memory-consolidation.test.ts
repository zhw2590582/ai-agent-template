import { beforeEach, describe, expect, it, vi } from 'vitest';

const { generateTextMock, outputArrayMock } = vi.hoisted(() => ({
  generateTextMock: vi.fn(),
  outputArrayMock: vi.fn(),
}));

vi.mock('ai', () => ({
  Output: {
    array: outputArrayMock,
  },
  generateText: generateTextMock,
}));

vi.mock('@/features/chat/ai/core/models', () => ({
  getRuntimeChatModel: vi.fn(() => 'mock-model'),
}));

import { consolidateMemoryKind } from '@/features/memory/storage/memory-consolidation';
import type { MemoryListItem } from '@/features/memory/types';

describe('consolidateMemoryKind', () => {
  beforeEach(() => {
    generateTextMock.mockReset();
    outputArrayMock.mockReset();
  });

  it('falls back to plain JSON consolidation when structured output returns no items', async () => {
    const memories: MemoryListItem[] = Array.from({ length: 5 }, (_, index) => ({
      content: `Profile ${index + 1}`,
      conversationId: 'conversation-1',
      id: `memory-${index + 1}`,
      kind: 'profile',
      source: 'auto',
      updatedAt: `2026-04-17T00:00:0${index}.000Z`,
    }));

    generateTextMock
      .mockResolvedValueOnce({
        output: [],
      })
      .mockResolvedValueOnce({
        text: '```json\n[{"content":"Merged profile"}]\n```',
      });

    const result = await consolidateMemoryKind(memories, {
      kind: 'profile',
      locale: 'en-US',
      runtimeModel: {
        apiFormat: 'openai',
        apiKey: 'key',
        baseUrl: 'https://example.com/v1',
        modelId: 'model',
        providerId: 'provider',
      },
    });

    expect(generateTextMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual(['Merged profile']);
  });
});
