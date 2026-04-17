/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MemoryListItem } from '@/features/memory/types';
import {
  readLocalMemories,
  subscribeToLocalMemoryUpdates,
  writeLocalMemories,
} from '@/features/memory/storage/local-memories';

const SAMPLE_MEMORY: MemoryListItem = {
  content: 'User prefers concise answers.',
  conversationId: 'local-1',
  id: 'memory-1',
  kind: 'preference',
  source: 'auto',
  updatedAt: '2026-04-17T00:00:00.000Z',
};

describe('local-memories', () => {
  beforeEach(() => {
    window.localStorage.clear();
    readLocalMemories();
  });

  it('clears the cached memories when localStorage is emptied', () => {
    writeLocalMemories([SAMPLE_MEMORY]);

    expect(readLocalMemories()).toEqual([SAMPLE_MEMORY]);

    window.localStorage.removeItem('agent-local-chat-memories');

    expect(readLocalMemories()).toEqual([]);
  });

  it('notifies subscribers for cross-tab storage updates', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToLocalMemoryUpdates(onChange);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'agent-local-chat-memories',
        storageArea: window.localStorage,
      })
    );

    expect(onChange).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});
