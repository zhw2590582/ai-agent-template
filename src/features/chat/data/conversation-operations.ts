'use client';

import type { UIMessage } from 'ai';

import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import {
  createLocalConversationThread,
  deleteLocalConversationThread,
  getLocalConversationThread,
  renameLocalConversationThread,
  upsertLocalConversationThread,
} from '@/features/chat/storage/local-conversations';
import type { ChatRuntimeModel } from '@/features/models/types';

export async function createConversationRecord(options: {
  initialMessage: string;
  locale: 'zh-CN' | 'en-US';
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  if (!options.user) {
    const localConversation = createLocalConversationThread(options.initialMessage);
    void upsertLocalConversationThread({
      id: localConversation.id,
      locale: options.locale,
      messages: [],
      runtimeModel: options.runtimeModel,
      title: localConversation.title,
    });

    return {
      id: localConversation.id,
      title: localConversation.title,
    };
  }

  const response = await fetch('/api/conversations', {
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
  locale: 'zh-CN' | 'en-US';
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  if (options.user) {
    return;
  }

  void upsertLocalConversationThread({
    id: options.conversationId,
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

  const response = await fetch('/api/conversations', {
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

  const response = await fetch('/api/conversations', {
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
