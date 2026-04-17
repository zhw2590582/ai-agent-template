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
  getConversationSyncPhase,
  type ConversationSyncPhase,
  isLocalConversationId,
} from '@/features/chat/utils/chat-sync';
import { extractAndMergeLocalMemories } from '@/features/memory/storage/local-memories';
import type { ChatRuntimeModel } from '@/features/models/types';

export interface ConversationRecordSyncPlanOptions {
  activeThreadId: string | null;
  bootstrappingThreadId: string | null;
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
  getMessages: (conversationId: string) => Promise<UIMessage[] | null>;
  getSyncPlan: (options: ConversationRecordSyncPlanOptions) => ConversationRecordSyncPlan;
  persistMessages: (options: {
    conversationId: string;
    locale: Locale;
    messages: UIMessage[];
    runtimeModel?: ChatRuntimeModel | null;
  }) => Promise<void>;
  renameRecord: (conversationId: string, title: string) => Promise<boolean>;
}

function areMessagesEqual(left: UIMessage[], right: UIMessage[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function hasLoadedReadyLocalConversationMessages(options: ConversationRecordSyncPlanOptions) {
  if (
    !options.activeThreadId ||
    !isLocalConversationId(options.activeThreadId) ||
    !options.urlConversationId ||
    options.activeThreadId !== options.urlConversationId
  ) {
    return true;
  }

  if (!areLocalConversationThreadsLoaded()) {
    return false;
  }

  const localMessages = getLocalConversationThread(options.activeThreadId)?.messages ?? null;

  if (!localMessages) {
    return true;
  }

  return areMessagesEqual(localMessages, options.messages);
}

function buildLocalConversationSyncPlan(
  options: ConversationRecordSyncPlanOptions
): ConversationRecordSyncPlan {
  const phase = getConversationSyncPhase({
    activeThreadId: options.activeThreadId,
    bootstrappingThreadId: options.bootstrappingThreadId,
  });

  if (phase === 'unmanaged') {
    return {
      phase,
      shouldPersistMessages: false,
      shouldClearBootstrappingAfterPersist: false,
      shouldRunDerivedState: false,
    };
  }

  const hasLoadedMessages =
    phase === 'bootstrapping' ? true : hasLoadedReadyLocalConversationMessages(options);
  const shouldPersistMessages = options.messages.length > 0 && hasLoadedMessages;

  return {
    phase,
    shouldPersistMessages,
    shouldClearBootstrappingAfterPersist: phase === 'bootstrapping' && !options.isBusy,
    shouldRunDerivedState: !options.isBusy && shouldPersistMessages,
  };
}

function createLocalConversationRecordSource(): ConversationRecordSource {
  return {
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
    getMessages: async (conversationId) => {
      await ensureLocalConversationThreadsLoaded();
      const thread = await getLocalConversationThreadById(conversationId);
      return thread?.messages ?? null;
    },
    getSyncPlan: ({ activeThreadId, bootstrappingThreadId, isBusy, messages, urlConversationId }) =>
      buildLocalConversationSyncPlan({
        activeThreadId,
        bootstrappingThreadId,
        isBusy,
        messages,
        urlConversationId,
      }),
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

function createRemoteConversationRecordSource(): ConversationRecordSource {
  return {
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

      return response.ok;
    },
    generateMemories: () => {},
    generateSummary: () => {},
    generateTitle: () => {},
    getMessages: async () => null,
    getSyncPlan: () => ({
      phase: 'unmanaged',
      shouldPersistMessages: false,
      shouldClearBootstrappingAfterPersist: false,
      shouldRunDerivedState: false,
    }),
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
