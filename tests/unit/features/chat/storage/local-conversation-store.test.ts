/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UIMessage } from 'ai';

import type { LocalConversationThread } from '@/features/chat/storage/local-conversation-store';
import {
  readLocalConversationThreads,
  subscribeToLocalConversationUpdates,
  upsertLocalConversationThread,
  writeLocalConversationThreads,
} from '@/features/chat/storage/local-conversation-store';

const SAMPLE_MESSAGE: UIMessage = {
  id: 'message-1',
  parts: [{ type: 'text', text: 'Hello' }],
  role: 'user',
};

const SAMPLE_THREAD: LocalConversationThread = {
  id: 'local-1',
  lastMessageAt: '2026-04-17T00:00:00.000Z',
  messages: [SAMPLE_MESSAGE],
  preview: 'Hello',
  summary: 'Conversation summary',
  title: 'Hello',
};

describe('local-conversation-store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    readLocalConversationThreads();
  });

  it('clears the cached conversation threads when localStorage is emptied', () => {
    writeLocalConversationThreads([SAMPLE_THREAD]);

    expect(readLocalConversationThreads()).toEqual([SAMPLE_THREAD]);

    window.localStorage.removeItem('agent-local-chat-conversations');

    expect(readLocalConversationThreads()).toEqual([]);
  });

  it('notifies subscribers for cross-tab storage updates', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToLocalConversationUpdates(onChange);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'agent-local-chat-conversations',
        storageArea: window.localStorage,
      })
    );

    expect(onChange).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('keeps the original order when reloading an existing local thread without message changes', () => {
    const newerThread: LocalConversationThread = {
      ...SAMPLE_THREAD,
      id: 'local-2',
      lastMessageAt: '2026-04-17T01:00:00.000Z',
      title: 'Newer',
    };
    const olderThread: LocalConversationThread = {
      ...SAMPLE_THREAD,
      id: 'local-1',
      lastMessageAt: '2026-04-17T00:00:00.000Z',
      title: 'Older',
    };

    writeLocalConversationThreads([newerThread, olderThread]);

    upsertLocalConversationThread({
      id: olderThread.id,
      messages: olderThread.messages,
    });

    expect(readLocalConversationThreads().map((thread) => thread.id)).toEqual([
      'local-2',
      'local-1',
    ]);
    expect(readLocalConversationThreads()[1]?.lastMessageAt).toBe('2026-04-17T00:00:00.000Z');
  });
});
