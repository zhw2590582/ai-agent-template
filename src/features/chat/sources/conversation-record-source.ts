'use client';

import type { UIMessage } from 'ai';

import { API_ROUTES } from '@/config/api';
import type { Locale } from '@/config/i18n';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import {
  createLocalConversationThread,
  deleteLocalConversationThread,
  ensureLocalConversationThreadsLoaded,
  generateLocalConversationSummary,
  generateLocalConversationTitle,
  getLocalConversationThreadById,
  renameLocalConversationThread,
  upsertLocalConversationThread,
} from '@/features/chat/storage/local-conversations';
import { extractAndMergeLocalMemories } from '@/features/memory/storage/local-memories';
import type { ChatRuntimeModel } from '@/features/models/types';

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
  persistMessages: (options: {
    conversationId: string;
    locale: Locale;
    messages: UIMessage[];
    runtimeModel?: ChatRuntimeModel | null;
  }) => void;
  renameRecord: (conversationId: string, title: string) => Promise<boolean>;
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
