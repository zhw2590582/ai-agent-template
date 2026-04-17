import { describe, expect, it } from 'vitest';

import {
  listMemoriesForUser,
  type MemoriesClient,
} from '@/features/memory/storage/memory-repository';

function createClient(result: { data: unknown; error: unknown }): MemoriesClient {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: async () => result,
          }),
        }),
      }),
    }),
  };
}

describe('listMemoriesForUser', () => {
  it('maps active memories into list items', async () => {
    const memories = await listMemoriesForUser(
      'user-1',
      createClient({
        data: [
          {
            content: 'Prefers concise answers',
            conversation_id: 'conversation-1',
            created_at: '2026-04-16T00:00:00.000Z',
            id: 'memory-1',
            kind: 'preference',
            metadata: {},
            source: 'auto',
            status: 'active',
            updated_at: '2026-04-16T00:00:00.000Z',
            user_id: 'user-1',
          },
        ],
        error: null,
      })
    );

    expect(memories).toEqual([
      {
        content: 'Prefers concise answers',
        conversationId: 'conversation-1',
        id: 'memory-1',
        kind: 'preference',
        source: 'auto',
        updatedAt: '2026-04-16T00:00:00.000Z',
      },
    ]);
  });

  it('throws when the memory query fails instead of returning an empty list', async () => {
    await expect(
      listMemoriesForUser(
        'user-1',
        createClient({
          data: null,
          error: new Error('query failed'),
        })
      )
    ).rejects.toThrow('query failed');
  });
});
