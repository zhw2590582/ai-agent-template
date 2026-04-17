'use client';

import { API_ROUTES } from '@/config/api';
import type { Locale } from '@/config/i18n';
import type { ChatRuntimeModel } from '@/features/models/types';
import {
  ensureLocalConversationThreadsLoaded,
  getLocalConversationThreadById,
  getMessageText,
  readLocalConversationThreads,
  writeLocalConversationThreads,
} from '@/features/chat/storage/local-conversation-store';

export async function generateLocalConversationTitle(input: {
  id: string;
  locale?: Locale;
  runtimeModel?: ChatRuntimeModel | null;
}) {
  await ensureLocalConversationThreadsLoaded();
  const existingThreads = readLocalConversationThreads();
  const existingThread = existingThreads.find((thread) => thread.id === input.id);

  if (!existingThread || existingThread.titleGenerated || existingThread.titleGenerating) {
    return existingThread ?? null;
  }

  const firstUserMessage = existingThread.messages.find(
    (message) => message.role === 'user' && getMessageText(message).length > 0
  );

  if (!firstUserMessage || !input.runtimeModel) {
    return existingThread ?? null;
  }

  await writeLocalConversationThreads(
    existingThreads.map((thread) =>
      thread.id === input.id ? { ...thread, titleGenerating: true } : thread
    )
  );

  try {
    const response = await fetch(API_ROUTES.chatTitle, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: getMessageText(firstUserMessage),
        locale: input.locale,
        runtimeModel: input.runtimeModel,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate local conversation title');
    }

    const data = (await response.json()) as { title?: string };
    const generatedTitle = data.title?.trim();
    const refreshedThreads = readLocalConversationThreads();
    const refreshedThread = refreshedThreads.find((thread) => thread.id === input.id);

    if (!refreshedThread) {
      return null;
    }

    if (!generatedTitle) {
      await writeLocalConversationThreads(
        refreshedThreads.map((thread) =>
          thread.id === input.id ? { ...thread, titleGenerating: false } : thread
        )
      );
      return refreshedThread;
    }

    await writeLocalConversationThreads(
      refreshedThreads.map((thread) =>
        thread.id === input.id
          ? {
              ...thread,
              title: generatedTitle,
              titleGenerated: true,
              titleGenerating: false,
            }
          : thread
      )
    );

    return await getLocalConversationThreadById(input.id);
  } catch {
    const refreshedThreads = readLocalConversationThreads();
    const refreshedThread = refreshedThreads.find((thread) => thread.id === input.id);

    if (refreshedThread?.titleGenerating) {
      await writeLocalConversationThreads(
        refreshedThreads.map((thread) =>
          thread.id === input.id ? { ...thread, titleGenerating: false } : thread
        )
      );
    }

    return refreshedThread ?? null;
  }
}
