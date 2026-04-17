import type { UIMessage } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createConversationRecordSource } from '@/features/chat/sources/conversation-record-source';

const { areLocalConversationThreadsLoaded, getLocalConversationThread } = vi.hoisted(() => ({
  areLocalConversationThreadsLoaded: vi.fn(),
  getLocalConversationThread: vi.fn(),
}));

vi.mock('@/features/chat/storage/local-conversations', () => ({
  areLocalConversationThreadsLoaded,
  createLocalConversationThread: vi.fn(),
  deleteLocalConversationThread: vi.fn(),
  ensureLocalConversationThreadsLoaded: vi.fn(),
  generateLocalConversationSummary: vi.fn(),
  generateLocalConversationTitle: vi.fn(),
  getLocalConversationThread,
  getLocalConversationThreadById: vi.fn(),
  renameLocalConversationThread: vi.fn(),
  upsertLocalConversationThread: vi.fn(),
}));

vi.mock('@/features/memory/storage/local-memories', () => ({
  extractAndMergeLocalMemories: vi.fn(),
}));

const SAMPLE_MESSAGES: UIMessage[] = [
  {
    id: 'message-1',
    parts: [{ type: 'text', text: 'hello' }],
    role: 'user',
  },
];

describe('createConversationRecordSource', () => {
  beforeEach(() => {
    areLocalConversationThreadsLoaded.mockReset();
    getLocalConversationThread.mockReset();
  });

  it('uses a sync plan that keeps bootstrapping local threads writable without hydration', () => {
    const source = createConversationRecordSource(null);

    const plan = source.getSyncPlan({
      activeThreadId: 'local-thread-1',
      bootstrappingThreadId: 'local-thread-1',
      hydratedConversationId: null,
      isBusy: false,
      messages: SAMPLE_MESSAGES,
      urlConversationId: null,
    });

    expect(plan).toEqual({
      phase: 'bootstrapping',
      shouldPersistMessages: true,
      shouldClearBootstrappingAfterPersist: true,
      shouldRunDerivedState: true,
    });
  });

  it('keeps bootstrapping local threads writable while streaming without clearing bootstrap yet', () => {
    const source = createConversationRecordSource(null);

    const plan = source.getSyncPlan({
      activeThreadId: 'local-thread-1',
      bootstrappingThreadId: 'local-thread-1',
      hydratedConversationId: null,
      isBusy: true,
      messages: SAMPLE_MESSAGES,
      urlConversationId: 'local-thread-1',
    });

    expect(plan).toEqual({
      phase: 'bootstrapping',
      shouldPersistMessages: true,
      shouldClearBootstrappingAfterPersist: false,
      shouldRunDerivedState: false,
    });
  });

  it('waits for loaded local messages before persisting an existing local thread', () => {
    areLocalConversationThreadsLoaded.mockReturnValue(false);
    const source = createConversationRecordSource(null);

    const plan = source.getSyncPlan({
      activeThreadId: 'local-thread-1',
      bootstrappingThreadId: null,
      hydratedConversationId: null,
      isBusy: false,
      messages: SAMPLE_MESSAGES,
      urlConversationId: 'local-thread-1',
    });

    expect(plan).toEqual({
      phase: 'ready',
      shouldPersistMessages: false,
      shouldClearBootstrappingAfterPersist: false,
      shouldRunDerivedState: false,
    });
  });

  it('persists new messages after an existing local thread has been hydrated', () => {
    areLocalConversationThreadsLoaded.mockReturnValue(true);
    const source = createConversationRecordSource(null);

    const plan = source.getSyncPlan({
      activeThreadId: 'local-thread-1',
      bootstrappingThreadId: null,
      hydratedConversationId: 'local-thread-1',
      isBusy: false,
      messages: [
        ...SAMPLE_MESSAGES,
        {
          id: 'message-2',
          parts: [{ type: 'text', text: 'follow up' }],
          role: 'assistant',
        },
      ],
      urlConversationId: 'local-thread-1',
    });

    expect(plan).toEqual({
      phase: 'ready',
      shouldPersistMessages: true,
      shouldClearBootstrappingAfterPersist: false,
      shouldRunDerivedState: true,
    });
  });

  it('returns a no-op sync plan for authenticated conversations', () => {
    const source = createConversationRecordSource({
      avatarUrl: null,
      email: 'user@example.com',
      fullName: null,
      id: 'user-1',
    });

    const plan = source.getSyncPlan({
      activeThreadId: 'conversation-1',
      bootstrappingThreadId: null,
      hydratedConversationId: null,
      isBusy: false,
      messages: SAMPLE_MESSAGES,
      urlConversationId: 'conversation-1',
    });

    expect(plan).toEqual({
      phase: 'unmanaged',
      shouldPersistMessages: false,
      shouldClearBootstrappingAfterPersist: false,
      shouldRunDerivedState: false,
    });
  });
});
