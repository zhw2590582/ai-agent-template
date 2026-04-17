import { describe, expect, it } from 'vitest';

import {
  canPersistConversationMessages,
  getConversationSyncPhase,
  shouldSkipUrlSync,
} from '@/features/chat/utils/chat-sync';

describe('chat sync helpers', () => {
  it('treats non-local conversations as unmanaged', () => {
    expect(
      getConversationSyncPhase({
        activeThreadId: 'conversation-1',
        bootstrappingThreadId: null,
        hydratedConversationId: null,
        urlConversationId: 'conversation-1',
      })
    ).toBe('unmanaged');
  });

  it('treats a matching bootstrapping local thread as bootstrapping', () => {
    expect(
      getConversationSyncPhase({
        activeThreadId: 'local-thread-1',
        bootstrappingThreadId: 'local-thread-1',
        hydratedConversationId: null,
        urlConversationId: 'local-thread-1',
      })
    ).toBe('bootstrapping');
  });

  it('treats an active local thread without hydrated messages as hydrating', () => {
    expect(
      getConversationSyncPhase({
        activeThreadId: 'local-thread-1',
        bootstrappingThreadId: null,
        hydratedConversationId: null,
        urlConversationId: 'local-thread-1',
      })
    ).toBe('hydrating');
  });

  it('treats a hydrated local thread as hydrated', () => {
    expect(
      getConversationSyncPhase({
        activeThreadId: 'local-thread-1',
        bootstrappingThreadId: null,
        hydratedConversationId: 'local-thread-1',
        urlConversationId: 'local-thread-1',
      })
    ).toBe('hydrated');
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

  it('allows url sync for a hydrating local thread when not busy', () => {
    expect(
      shouldSkipUrlSync({
        isBusy: false,
        phase: 'hydrating',
        urlConversationId: 'local-thread-1',
      })
    ).toBe(false);
  });

  it('allows url sync for a hydrated local thread when not busy', () => {
    expect(
      shouldSkipUrlSync({
        isBusy: false,
        phase: 'hydrated',
        urlConversationId: 'local-thread-1',
      })
    ).toBe(false);
  });

  it('only allows local persistence for bootstrapping or hydrated phases', () => {
    expect(canPersistConversationMessages({ messageCount: 1, phase: 'bootstrapping' })).toBe(true);
    expect(canPersistConversationMessages({ messageCount: 1, phase: 'hydrated' })).toBe(true);
    expect(canPersistConversationMessages({ messageCount: 1, phase: 'hydrating' })).toBe(false);
    expect(canPersistConversationMessages({ messageCount: 1, phase: 'unmanaged' })).toBe(false);
  });
});
