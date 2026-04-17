/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UIMessage } from 'ai';

import type { LocalConversationThread } from '@/features/chat/storage/local-conversation-store';
import {
  readLocalConversationThreads,
  subscribeToLocalConversationUpdates,
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
});
