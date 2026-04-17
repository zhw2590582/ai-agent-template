'use client';

import type { UIMessage } from 'ai';

import { API_ROUTES } from '@/config/api';
import type { Locale } from '@/config/i18n';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import {
  areLocalConversationThreadsLoaded,
  createLocalConversationThread,
  deleteLocalConversationThread,
  ensureLocalConversationThreadsLoaded,
  generateLocalConversationSummary,
  generateLocalConversationTitle,
  getLocalConversationThread,
  getLocalConversationThreadById,
  renameLocalConversationThread,
  upsertLocalConversationThread,
} from '@/features/chat/storage/local-conversations';
import {
  canPersistConversationMessages,
  canRunConversationDerivedState,
  getConversationSyncPhase,
  type ConversationSyncPhase,
} from '@/features/chat/utils/chat-sync';
import { extractAndMergeLocalMemories } from '@/features/memory/storage/local-memories';
import type { ChatRuntimeModel } from '@/features/models/types';

export interface ConversationRecordSyncPlanOptions {
  activeThreadId: string | null;
  bootstrappingThreadId: string | null;
  hydratedConversationId: string | null;
  isBusy: boolean;
  messages: UIMessage[];
  urlConversationId: string | null;
}

export interface ConversationRecordSyncPlan {
  phase: ConversationSyncPhase;
  shouldPersistMessages: boolean;
  shouldClearBootstrappingAfterPersist: boolean;
  shouldRunDerivedState: boolean;
}

export interface ConversationRecordSource {
  cacheMessages: (conversationId: string, messages: UIMessage[]) => void;
  createRecord: (options: {
    initialMessage: string;
    locale: Locale;
    runtimeModel?: ChatRuntimeModel | null;
  }) => Promise<{ id: string; title: string }>;
  deleteRecord: (conversationId: string) => Promise<boolean>;
  generateMemories: (options: {
    conversationId: string;
    locale: Locale;
    messages: UIMessage[];
    runtimeModel?: ChatRuntimeModel | null;
  }) => void;
  generateSummary: (options: {
    conversationId: string;
    locale: Locale;
    runtimeModel?: ChatRuntimeModel | null;
  }) => void;
  generateTitle: (options: {
    conversationId: string;
    locale: Locale;
    runtimeModel?: ChatRuntimeModel | null;
  }) => void;
  getCachedMessages: (conversationId: string) => UIMessage[] | null;
  getMessages: (conversationId: string) => Promise<UIMessage[] | null>;
  getSyncPlan: (options: ConversationRecordSyncPlanOptions) => ConversationRecordSyncPlan;
  prefetchMessages: (conversationId: string) => void;
  refreshMessages: (conversationId: string) => Promise<UIMessage[] | null>;
  persistMessages: (options: {
    conversationId: string;
    locale: Locale;
    messages: UIMessage[];
    runtimeModel?: ChatRuntimeModel | null;
  }) => Promise<void>;
  renameRecord: (conversationId: string, title: string) => Promise<boolean>;
}

function buildLocalConversationSyncPlan(
  options: ConversationRecordSyncPlanOptions
): ConversationRecordSyncPlan {
  const phase = getConversationSyncPhase({
    activeThreadId: options.activeThreadId,
    bootstrappingThreadId: options.bootstrappingThreadId,
    hydratedConversationId: options.hydratedConversationId,
    urlConversationId: options.urlConversationId,
  });

  if (phase === 'unmanaged') {
    return {
      phase,
      shouldPersistMessages: false,
      shouldClearBootstrappingAfterPersist: false,
      shouldRunDerivedState: false,
    };
  }

  const shouldPersistMessages = canPersistConversationMessages({
    messageCount: options.messages.length,
    phase,
  });

  return {
    phase,
    shouldPersistMessages,
    shouldClearBootstrappingAfterPersist: phase === 'bootstrapping' && !options.isBusy,
    shouldRunDerivedState: canRunConversationDerivedState({
      isBusy: options.isBusy,
      phase,
      shouldPersistMessages,
    }),
  };
}

function createLocalConversationRecordSource(): ConversationRecordSource {
  return {
    cacheMessages: () => {},
    createRecord: async ({ initialMessage }) => {
      const localConversation = createLocalConversationThread(initialMessage);
      await upsertLocalConversationThread({
        id: localConversation.id,
        messages: [],
        title: localConversation.title,
      });

      return {
        id: localConversation.id,
        title: localConversation.title,
      };
    },
    deleteRecord: async (conversationId) => deleteLocalConversationThread(conversationId),
    generateMemories: ({ conversationId, locale, messages, runtimeModel }) => {
      void extractAndMergeLocalMemories({
        conversationId,
        locale,
        messages,
        runtimeModel,
      });
    },
    generateSummary: ({ conversationId, locale, runtimeModel }) => {
      void generateLocalConversationSummary({
        id: conversationId,
        locale,
        runtimeModel,
      });
    },
    generateTitle: ({ conversationId, locale, runtimeModel }) => {
      void generateLocalConversationTitle({
        id: conversationId,
        locale,
        runtimeModel,
      });
    },
    getCachedMessages: (conversationId) => {
      if (!areLocalConversationThreadsLoaded()) {
        return null;
      }

      return getLocalConversationThread(conversationId)?.messages ?? null;
    },
    getMessages: async (conversationId) => {
      await ensureLocalConversationThreadsLoaded();
      const thread = await getLocalConversationThreadById(conversationId);
      return thread?.messages ?? null;
    },
    getSyncPlan: ({
      activeThreadId,
      bootstrappingThreadId,
      hydratedConversationId,
      isBusy,
      messages,
      urlConversationId,
    }) =>
      buildLocalConversationSyncPlan({
        activeThreadId,
        bootstrappingThreadId,
        hydratedConversationId,
        isBusy,
        messages,
        urlConversationId,
      }),
    prefetchMessages: (conversationId) => {
      void ensureLocalConversationThreadsLoaded().then(() => {
        void getLocalConversationThreadById(conversationId);
      });
    },
    refreshMessages: async (conversationId) => {
      await ensureLocalConversationThreadsLoaded();
      const thread = await getLocalConversationThreadById(conversationId);
      return thread?.messages ?? null;
    },
    persistMessages: async ({ conversationId, messages }) => {
      await upsertLocalConversationThread({
        id: conversationId,
        messages,
      });
    },
    renameRecord: async (conversationId, title) =>
      renameLocalConversationThread({
        id: conversationId,
        title,
      }),
  };
}

const remoteConversationMessagesCache = new Map<string, UIMessage[]>();
const remoteConversationMessagesRequests = new Map<string, Promise<UIMessage[] | null>>();

function fetchRemoteConversationMessages(conversationId: string, options?: { force?: boolean }) {
  const cachedMessages = remoteConversationMessagesCache.get(conversationId);

  if (cachedMessages && !options?.force) {
    return Promise.resolve(cachedMessages);
  }

  const inFlightRequest = remoteConversationMessagesRequests.get(conversationId);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  const request = (async () => {
    const params = new URLSearchParams({ id: conversationId });
    const response = await fetch(`${API_ROUTES.conversations}?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      conversation?: {
        messages?: UIMessage[];
      };
    };
    const messages = data.conversation?.messages ?? null;

    if (messages) {
      remoteConversationMessagesCache.set(conversationId, messages);
    }

    return messages;
  })();

  remoteConversationMessagesRequests.set(conversationId, request);

  void request.finally(() => {
    if (remoteConversationMessagesRequests.get(conversationId) === request) {
      remoteConversationMessagesRequests.delete(conversationId);
    }
  });

  return request;
}

function createRemoteConversationRecordSource(): ConversationRecordSource {
  return {
    cacheMessages: (conversationId, messages) => {
      remoteConversationMessagesCache.set(conversationId, messages);
    },
    createRecord: async ({ initialMessage }) => {
      const response = await fetch(API_ROUTES.conversations, {
        body: JSON.stringify({ initialMessage }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data: { conversation: { id: string; title: string } } = await response.json();
      remoteConversationMessagesCache.set(data.conversation.id, []);
      return data.conversation;
    },
    deleteRecord: async (conversationId) => {
      const response = await fetch(API_ROUTES.conversations, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
        }),
      });

      if (response.ok) {
        remoteConversationMessagesCache.delete(conversationId);
        remoteConversationMessagesRequests.delete(conversationId);
      }

      return response.ok;
    },
    generateMemories: () => {},
    generateSummary: () => {},
    generateTitle: () => {},
    getCachedMessages: (conversationId) =>
      remoteConversationMessagesCache.has(conversationId)
        ? (remoteConversationMessagesCache.get(conversationId) ?? null)
        : null,
    getMessages: async (conversationId) => await fetchRemoteConversationMessages(conversationId),
    getSyncPlan: () => ({
      phase: 'unmanaged',
      shouldPersistMessages: false,
      shouldClearBootstrappingAfterPersist: false,
      shouldRunDerivedState: false,
    }),
    prefetchMessages: (conversationId) => {
      void fetchRemoteConversationMessages(conversationId);
    },
    refreshMessages: async (conversationId) =>
      await fetchRemoteConversationMessages(conversationId, { force: true }),
    persistMessages: async () => {},
    renameRecord: async (conversationId, title) => {
      const response = await fetch(API_ROUTES.conversations, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          title,
        }),
      });

      return response.ok;
    },
  };
}

export function createConversationRecordSource(
  user: AuthUserSnapshot | null
): ConversationRecordSource {
  return user ? createRemoteConversationRecordSource() : createLocalConversationRecordSource();
}
