'use client';

import type { UIMessage } from 'ai';

import { API_ROUTES } from '@/config/api';
import type { Locale } from '@/config/i18n';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import {
  createLocalConversationThread,
  generateLocalConversationSummary,
  generateLocalConversationTitle,
  deleteLocalConversationThread,
  getLocalConversationThread,
  renameLocalConversationThread,
  upsertLocalConversationThread,
} from '@/features/chat/storage/local-conversations';
import { extractAndMergeLocalMemories } from '@/features/memory/storage/local-memories';
import type { ChatRuntimeModel } from '@/features/models/types';

export async function createConversationRecord(options: {
  initialMessage: string;
  locale: Locale;
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  if (!options.user) {
    const localConversation = createLocalConversationThread(options.initialMessage);
    void upsertLocalConversationThread({
      id: localConversation.id,
      messages: [],
      title: localConversation.title,
    });

    return {
      id: localConversation.id,
      title: localConversation.title,
    };
  }

  const response = await fetch(API_ROUTES.conversations, {
    body: JSON.stringify({ initialMessage: options.initialMessage }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }

  const data: { conversation: { id: string; title: string } } = await response.json();
  return data.conversation;
}

export function getConversationMessages(options: {
  conversationId: string;
  user: AuthUserSnapshot | null;
}) {
  if (options.user) {
    return null;
  }

  return getLocalConversationThread(options.conversationId)?.messages ?? null;
}

export function persistConversationMessages(options: {
  conversationId: string;
  locale: Locale;
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  if (options.user) {
    return;
  }

  void upsertLocalConversationThread({
    id: options.conversationId,
    messages: options.messages,
  });
}

export function generateConversationRecordTitle(options: {
  conversationId: string;
  locale: Locale;
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  if (options.user) {
    return;
  }

  void generateLocalConversationTitle({
    id: options.conversationId,
    locale: options.locale,
    runtimeModel: options.runtimeModel,
  });
}

export function generateConversationRecordSummary(options: {
  conversationId: string;
  locale: Locale;
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  if (options.user) {
    return;
  }

  void generateLocalConversationSummary({
    id: options.conversationId,
    locale: options.locale,
    runtimeModel: options.runtimeModel,
  });
}

export function generateConversationRecordMemories(options: {
  conversationId: string;
  locale: Locale;
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  if (options.user) {
    return;
  }

  void extractAndMergeLocalMemories({
    conversationId: options.conversationId,
    locale: options.locale,
    messages: options.messages,
    runtimeModel: options.runtimeModel,
  });
}

export async function renameConversationRecord(options: {
  conversationId: string;
  title: string;
  user: AuthUserSnapshot | null;
}) {
  const nextTitle = options.title.trim();
  if (!nextTitle) {
    return false;
  }

  if (!options.user) {
    return renameLocalConversationThread({
      id: options.conversationId,
      title: nextTitle,
    });
  }

  const response = await fetch(API_ROUTES.conversations, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId: options.conversationId,
      title: nextTitle,
    }),
  });

  return response.ok;
}

export async function deleteConversationRecord(options: {
  conversationId: string;
  user: AuthUserSnapshot | null;
}) {
  if (!options.user) {
    return deleteLocalConversationThread(options.conversationId);
  }

  const response = await fetch(API_ROUTES.conversations, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId: options.conversationId,
    }),
  });

  return response.ok;
}
