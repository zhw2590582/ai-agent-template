import { describe, expect, it } from 'vitest';

import { getConversationSyncPhase, shouldSkipUrlSync } from '@/features/chat/utils/chat-sync';

describe('chat sync helpers', () => {
  it('treats non-local conversations as unmanaged', () => {
    expect(
      getConversationSyncPhase({
        activeThreadId: 'conversation-1',
        bootstrappingThreadId: null,
      })
    ).toBe('unmanaged');
  });

  it('treats a matching bootstrapping local thread as bootstrapping', () => {
    expect(
      getConversationSyncPhase({
        activeThreadId: 'local-thread-1',
        bootstrappingThreadId: 'local-thread-1',
      })
    ).toBe('bootstrapping');
  });

  it('treats a persisted local thread as ready', () => {
    expect(
      getConversationSyncPhase({
        activeThreadId: 'local-thread-1',
        bootstrappingThreadId: null,
      })
    ).toBe('ready');
  });

  it('skips url sync while a local thread is bootstrapping', () => {
    expect(
      shouldSkipUrlSync({
        isBusy: false,
        phase: 'bootstrapping',
        urlConversationId: 'local-thread-1',
      })
    ).toBe(true);
  });

  it('allows url sync for a ready local thread when not busy', () => {
    expect(
      shouldSkipUrlSync({
        isBusy: false,
        phase: 'ready',
        urlConversationId: 'local-thread-1',
      })
    ).toBe(false);
  });
});
