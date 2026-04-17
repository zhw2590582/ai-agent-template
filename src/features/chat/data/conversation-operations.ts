'use client';

import type { UIMessage } from 'ai';

import type { Locale } from '@/config/i18n';
import type { AuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { createConversationRecordSource } from '@/features/chat/sources/conversation-record-source';
import type { ChatRuntimeModel } from '@/features/models/types';

export async function createConversationRecord(options: {
  initialMessage: string;
  locale: Locale;
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  const source = createConversationRecordSource(options.user);
  return source.createRecord(options);
}

export async function getConversationMessages(options: {
  conversationId: string;
  user: AuthUserSnapshot | null;
}) {
  const source = createConversationRecordSource(options.user);
  return source.getMessages(options.conversationId);
}

export function persistConversationMessages(options: {
  conversationId: string;
  locale: Locale;
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  const source = createConversationRecordSource(options.user);
  source.persistMessages(options);
}

export function generateConversationRecordTitle(options: {
  conversationId: string;
  locale: Locale;
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  const source = createConversationRecordSource(options.user);
  source.generateTitle(options);
}

export function generateConversationRecordSummary(options: {
  conversationId: string;
  locale: Locale;
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  const source = createConversationRecordSource(options.user);
  source.generateSummary(options);
}

export function generateConversationRecordMemories(options: {
  conversationId: string;
  locale: Locale;
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
  user: AuthUserSnapshot | null;
}) {
  const source = createConversationRecordSource(options.user);
  source.generateMemories(options);
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

  const source = createConversationRecordSource(options.user);
  return source.renameRecord(options.conversationId, nextTitle);
}

export async function deleteConversationRecord(options: {
  conversationId: string;
  user: AuthUserSnapshot | null;
}) {
  const source = createConversationRecordSource(options.user);
  return source.deleteRecord(options.conversationId);
}
