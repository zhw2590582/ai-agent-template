'use client';

import type { UIMessage } from 'ai';

import { buildConversationTitleFromText } from '@/features/chat/storage/conversations';
import type { ConversationSummary } from '@/features/chat/storage/types';
import type { ChatRuntimeModel } from '@/features/models/types';

const LOCAL_CHAT_CONVERSATIONS_STORAGE_KEY = 'agent-local-chat-conversations';
const LOCAL_CHAT_CONVERSATIONS_UPDATED_EVENT = 'agent-local-chat-conversations-updated';
const EMPTY_LOCAL_CONVERSATION_THREADS: LocalConversationThread[] = [];
const EMPTY_LOCAL_CONVERSATION_SUMMARIES: ConversationSummary[] = [];

let localConversationThreadsCache: LocalConversationThread[] = EMPTY_LOCAL_CONVERSATION_THREADS;
let localConversationSummariesCache: ConversationSummary[] = EMPTY_LOCAL_CONVERSATION_SUMMARIES;
let localConversationStorageRawCache: string | null = null;

export interface LocalConversationThread {
  id: string;
  lastMessageAt: string;
  messages: UIMessage[];
  preview: string | null;
  title: string;
  titleGenerated?: boolean;
  titleGenerating?: boolean;
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter(
      (part): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text'
    )
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function buildPreview(messages: UIMessage[]) {
  const lastMessage = [...messages].reverse().find((message) => getMessageText(message).length > 0);
  const text = lastMessage ? getMessageText(lastMessage) : '';
  return text ? text.slice(0, 120) : null;
}

function buildTitle(messages: UIMessage[]) {
  const firstUserMessage = messages.find(
    (message) => message.role === 'user' && getMessageText(message).length > 0
  );
  return buildConversationTitleFromText(firstUserMessage ? getMessageText(firstUserMessage) : '');
}

function emitLocalConversationUpdate() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(LOCAL_CHAT_CONVERSATIONS_UPDATED_EVENT));
}

export function readLocalConversationThreads() {
  if (typeof window === 'undefined') {
    return localConversationThreadsCache;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_CHAT_CONVERSATIONS_STORAGE_KEY);
    if (!raw) {
      localConversationStorageRawCache = null;
      return localConversationThreadsCache;
    }

    if (raw === localConversationStorageRawCache) {
      return localConversationThreadsCache;
    }

    const parsed = JSON.parse(raw) as LocalConversationThread[];
    if (!Array.isArray(parsed)) {
      return localConversationThreadsCache;
    }

    const nextThreads = parsed
      .filter((item) => item && typeof item.id === 'string')
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
    localConversationStorageRawCache = raw;
    localConversationThreadsCache = nextThreads;
    localConversationSummariesCache = nextThreads.map((thread) => ({
      id: thread.id,
      lastMessageAt: thread.lastMessageAt,
      preview: thread.preview,
      title: thread.title,
    }));
    return localConversationThreadsCache;
  } catch {
    return localConversationThreadsCache;
  }
}

function writeLocalConversationThreads(threads: LocalConversationThread[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextThreads = threads.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  localConversationThreadsCache = nextThreads;
  localConversationSummariesCache = nextThreads.map((thread) => ({
    id: thread.id,
    lastMessageAt: thread.lastMessageAt,
    preview: thread.preview,
    title: thread.title,
  }));
  const raw = JSON.stringify(nextThreads);
  localConversationStorageRawCache = raw;
  window.localStorage.setItem(LOCAL_CHAT_CONVERSATIONS_STORAGE_KEY, raw);
  emitLocalConversationUpdate();
}

export function subscribeToLocalConversationUpdates(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(LOCAL_CHAT_CONVERSATIONS_UPDATED_EVENT, onChange);
  return () => {
    window.removeEventListener(LOCAL_CHAT_CONVERSATIONS_UPDATED_EVENT, onChange);
  };
}

export function listLocalConversationSummaries(): ConversationSummary[] {
  readLocalConversationThreads();
  return localConversationSummariesCache;
}

export function getLocalConversationThread(id: string) {
  return readLocalConversationThreads().find((thread) => thread.id === id) ?? null;
}

export function createLocalConversationThread(initialMessage: string) {
  const now = new Date().toISOString();
  return {
    id: `local-${crypto.randomUUID()}`,
    lastMessageAt: now,
    messages: [],
    preview: initialMessage.trim().slice(0, 120) || null,
    title: buildConversationTitleFromText(initialMessage),
    titleGenerated: false,
  } satisfies LocalConversationThread;
}

export async function upsertLocalConversationThread(input: {
  id: string;
  locale?: 'zh-CN' | 'en-US';
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
  title?: string;
}) {
  const existingThreads = readLocalConversationThreads();
  const existingThread = existingThreads.find((thread) => thread.id === input.id) ?? null;
  const firstUserMessage = input.messages.find(
    (message) => message.role === 'user' && getMessageText(message).length > 0
  );

  const title =
    input.title?.trim() ||
    (existingThread?.titleGenerated ? existingThread.title : buildTitle(input.messages));
  const titleGenerated = existingThread?.titleGenerated ?? false;
  let titleGenerating = existingThread?.titleGenerating ?? false;

  if (
    !input.title?.trim() &&
    !titleGenerated &&
    !titleGenerating &&
    firstUserMessage &&
    input.runtimeModel
  ) {
    titleGenerating = true;
  }

  const nextThread: LocalConversationThread = {
    id: input.id,
    lastMessageAt: new Date().toISOString(),
    messages: input.messages,
    preview: buildPreview(input.messages),
    title,
    titleGenerated,
    titleGenerating,
  };

  const nextThreads = [nextThread, ...existingThreads.filter((thread) => thread.id !== input.id)];

  writeLocalConversationThreads(nextThreads);

  if (titleGenerating && firstUserMessage && input.runtimeModel) {
    try {
      const response = await fetch('/api/chat/title', {
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

      if (generatedTitle) {
        const refreshedThreads = readLocalConversationThreads();
        const refreshedThread = refreshedThreads.find((thread) => thread.id === input.id);

        if (refreshedThread && !refreshedThread.titleGenerated) {
          writeLocalConversationThreads(
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
        }
      }
    } catch {
      const refreshedThreads = readLocalConversationThreads();
      const refreshedThread = refreshedThreads.find((thread) => thread.id === input.id);

      if (refreshedThread?.titleGenerating) {
        writeLocalConversationThreads(
          refreshedThreads.map((thread) =>
            thread.id === input.id ? { ...thread, titleGenerating: false } : thread
          )
        );
      }
    }
  }

  return nextThread;
}

export function renameLocalConversationThread(input: { id: string; title: string }) {
  const nextTitle = input.title.trim();
  if (!nextTitle) {
    return false;
  }

  const existingThreads = readLocalConversationThreads();
  const targetThread = existingThreads.find((thread) => thread.id === input.id);

  if (!targetThread) {
    return false;
  }

  writeLocalConversationThreads(
    existingThreads.map((thread) =>
      thread.id === input.id
        ? {
            ...thread,
            title: nextTitle,
            titleGenerated: true,
            titleGenerating: false,
          }
        : thread
    )
  );

  return true;
}

export function deleteLocalConversationThread(id: string) {
  const existingThreads = readLocalConversationThreads();
  const nextThreads = existingThreads.filter((thread) => thread.id !== id);

  if (nextThreads.length === existingThreads.length) {
    return false;
  }

  writeLocalConversationThreads(nextThreads);
  return true;
}
