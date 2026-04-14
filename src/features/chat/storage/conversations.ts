import type { UIMessage } from 'ai';

import type { Locale } from '@/config/i18n';
import { CHAT_STRINGS } from '@/config/strings';
import { generateConversationSummary } from '@/features/chat/ai/memory/summary';
import { generateConversationTitle } from '@/features/chat/ai/memory/title';
import type { ChatRuntimeModel } from '@/features/models/types';
import type { MemorySettings } from '@/features/models/types';
import {
  buildConversationAnalysis,
  buildConversationTitleFromText,
} from '@/features/chat/storage/conversation-analysis';
import {
  getConversationsTable,
  verifyConversationOwnership,
  type ConversationsClient,
} from '@/features/chat/storage/conversation-repository';
export {
  buildConversationTitleFromText,
  mapConversationSummary,
} from '@/features/chat/storage/conversation-analysis';
export {
  getConversationById,
  listConversationsForUser,
  listConversationsForUserPage,
  listConversationsForUserSearchPage,
  verifyConversationOwnership,
} from '@/features/chat/storage/conversation-repository';

export async function createConversation(
  input: {
    initialMessage: string;
    userId: string;
  },
  client: ConversationsClient
) {
  const conversations = getConversationsTable(client);
  const now = new Date().toISOString();
  const title = buildConversationTitleFromText(input.initialMessage);

  const { data, error } = await conversations
    .insert({
      analysis: {
        first_user_message: input.initialMessage.slice(0, 120) || null,
        last_message_preview: input.initialMessage.slice(0, 120) || null,
        message_count: 0,
        title_generated: false,
        updated_from: 'create',
      },
      last_message_at: now,
      summary: null,
      summary_updated_at: null,
      title,
      user_id: input.userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
export async function saveConversationMessages(
  input: {
    conversationId: string;
    locale?: Locale;
    memorySettings?: Partial<MemorySettings> | null;
    messages: UIMessage[];
    runtimeModel?: ChatRuntimeModel | null;
    userId: string;
  },
  client: ConversationsClient
) {
  const conversations = getConversationsTable(client);
  const existingConversation = await verifyConversationOwnership(
    input.conversationId,
    input.userId,
    client
  );
  const analysis = buildConversationAnalysis(input.messages);
  analysis.title_generated = existingConversation?.analysis?.title_generated ?? false;
  let title =
    existingConversation?.title ??
    (analysis.first_user_message != null
      ? buildConversationTitleFromText(analysis.first_user_message)
      : CHAT_STRINGS.DEFAULT_CONVERSATION_TITLE);

  if (!analysis.title_generated && analysis.first_user_message) {
    try {
      const generatedTitle = await generateConversationTitle(analysis.first_user_message, {
        locale: input.locale,
        runtimeModel: input.runtimeModel,
      });
      if (generatedTitle) {
        title = generatedTitle;
        analysis.title_generated = true;
      }
    } catch {
      analysis.title_generated = false;
    }
  }

  let summary = existingConversation?.summary ?? null;
  let summaryUpdatedAt = existingConversation?.summary_updated_at ?? null;

  try {
    const nextSummary = await generateConversationSummary(input.messages, {
      existingSummary: summary,
      locale: input.locale,
      memorySettings: input.memorySettings,
      runtimeModel: input.runtimeModel,
    });

    if (nextSummary && nextSummary !== summary) {
      summary = nextSummary;
      summaryUpdatedAt = new Date().toISOString();
    }
  } catch {
    // Keep existing summary if regeneration fails.
  }

  const { error } = await conversations
    .update({
      analysis,
      last_message_at: new Date().toISOString(),
      messages: input.messages,
      summary,
      summary_updated_at: summaryUpdatedAt,
      title,
    })
    .eq('id', input.conversationId);

  if (error) {
    throw error;
  }
}

export async function renameConversation(
  input: {
    conversationId: string;
    title: string;
    userId: string;
  },
  client: ConversationsClient
) {
  const conversations = getConversationsTable(client);
  const existingConversation = await verifyConversationOwnership(
    input.conversationId,
    input.userId,
    client
  );

  const { error } = await conversations
    .update({
      analysis: existingConversation.analysis,
      last_message_at: existingConversation.last_message_at,
      messages: existingConversation.messages,
      summary: existingConversation.summary,
      summary_updated_at: existingConversation.summary_updated_at,
      title: input.title.trim(),
    })
    .eq('id', input.conversationId);

  if (error) {
    throw error;
  }
}

export async function updateConversationSummary(
  input: {
    conversationId: string;
    summary: string | null;
    userId: string;
  },
  client: ConversationsClient
) {
  const conversations = getConversationsTable(client);
  const existingConversation = await verifyConversationOwnership(
    input.conversationId,
    input.userId,
    client
  );
  const nextSummary = input.summary?.trim() || null;

  const { error } = await conversations
    .update({
      analysis: existingConversation.analysis,
      last_message_at: existingConversation.last_message_at,
      messages: existingConversation.messages,
      summary: nextSummary,
      summary_updated_at: nextSummary ? new Date().toISOString() : null,
      title: existingConversation.title,
    })
    .eq('id', input.conversationId);

  if (error) {
    throw error;
  }
}

export async function deleteConversation(
  input: {
    conversationId: string;
    userId: string;
  },
  client: ConversationsClient
) {
  const conversations = getConversationsTable(client);
  await verifyConversationOwnership(input.conversationId, input.userId, client);

  const { error } = await conversations.delete().eq('id', input.conversationId);

  if (error) {
    throw error;
  }
}
