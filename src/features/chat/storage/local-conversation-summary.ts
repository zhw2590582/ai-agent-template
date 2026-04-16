'use client';

import { API_ROUTES } from '@/config/api';
import type { Locale } from '@/config/i18n';
import type { ChatRuntimeModel } from '@/features/models/types';
import {
  getLocalConversationThread,
  readLocalConversationThreads,
  writeLocalConversationThreads,
} from '@/features/chat/storage/local-conversation-store';
import { shouldGenerateConversationSummary } from '@/features/chat/ai/memory/summary';

export async function generateLocalConversationSummary(input: {
  id: string;
  locale?: Locale;
  runtimeModel?: ChatRuntimeModel | null;
}) {
  const existingThreads = readLocalConversationThreads();
  const existingThread = existingThreads.find((thread) => thread.id === input.id);

  if (
    !existingThread ||
    existingThread.summaryGenerating ||
    !input.runtimeModel ||
    !shouldGenerateConversationSummary(existingThread.messages)
  ) {
    return existingThread ?? null;
  }

  writeLocalConversationThreads(
    existingThreads.map((thread) =>
      thread.id === input.id ? { ...thread, summaryGenerating: true } : thread
    )
  );

  try {
    const response = await fetch(API_ROUTES.chatSummary, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        existingSummary: existingThread.summary ?? undefined,
        locale: input.locale,
        messages: existingThread.messages,
        runtimeModel: input.runtimeModel,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate local conversation summary');
    }

    const data = (await response.json()) as { summary?: string | null };
    const generatedSummary = data.summary?.trim() || null;
    const refreshedThreads = readLocalConversationThreads();
    const refreshedThread = refreshedThreads.find((thread) => thread.id === input.id);

    if (!refreshedThread) {
      return null;
    }

    writeLocalConversationThreads(
      refreshedThreads.map((thread) =>
        thread.id === input.id
          ? {
              ...thread,
              summary: generatedSummary,
              summaryGenerating: false,
              summaryUpdatedAt: generatedSummary ? new Date().toISOString() : null,
            }
          : thread
      )
    );

    return getLocalConversationThread(input.id);
  } catch {
    const refreshedThreads = readLocalConversationThreads();
    const refreshedThread = refreshedThreads.find((thread) => thread.id === input.id);

    if (refreshedThread?.summaryGenerating) {
      writeLocalConversationThreads(
        refreshedThreads.map((thread) =>
          thread.id === input.id ? { ...thread, summaryGenerating: false } : thread
        )
      );
    }

    return refreshedThread ?? null;
  }
}
