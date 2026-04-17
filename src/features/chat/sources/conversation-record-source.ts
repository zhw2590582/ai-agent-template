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
  hydrationConversationId: string | null;
  shouldPersistMessages: boolean;
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
  }) => void;
  renameRecord: (conversationId: string, title: string) => Promise<boolean>;
}

function isLocalConversationId(conversationId: string | null) {
  return Boolean(conversationId?.startsWith('local-'));
}

function areMessagesEqual(left: UIMessage[], right: UIMessage[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function hasLoadedManagedLocalConversationMessages(
  options: Omit<ConversationRecordSyncPlanOptions, 'hydratedConversationId' | 'isBusy'>
) {
  if (
    !options.activeThreadId ||
    !isLocalConversationId(options.activeThreadId) ||
    !options.urlConversationId ||
    options.activeThreadId !== options.urlConversationId
  ) {
    return true;
  }

  if (options.bootstrappingThreadId === options.activeThreadId) {
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
    getSyncPlan: ({
      activeThreadId,
      bootstrappingThreadId,
      hydratedConversationId,
      isBusy,
      messages,
      urlConversationId,
    }) => {
      const managesConversation = Boolean(activeThreadId && isLocalConversationId(activeThreadId));

      if (!managesConversation) {
        return {
          hydrationConversationId: null,
          shouldPersistMessages: false,
          shouldRunDerivedState: false,
        };
      }

      const hasLoadedMessages = hasLoadedManagedLocalConversationMessages({
        activeThreadId,
        bootstrappingThreadId,
        messages,
        urlConversationId,
      });

      return {
        hydrationConversationId:
          !isBusy &&
          urlConversationId != null &&
          activeThreadId === urlConversationId &&
          bootstrappingThreadId !== activeThreadId &&
          hydratedConversationId !== urlConversationId
            ? urlConversationId
            : null,
        shouldPersistMessages: messages.length > 0 && hasLoadedMessages,
        shouldRunDerivedState: !isBusy && messages.length > 0 && hasLoadedMessages,
      };
    },
    persistMessages: ({ conversationId, messages }) => {
      void upsertLocalConversationThread({
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
      hydrationConversationId: null,
      shouldPersistMessages: false,
      shouldRunDerivedState: false,
    }),
    persistMessages: () => {},
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
