'use client';

import type { UIMessage } from 'ai';

import { STORAGE_KEYS, WINDOW_EVENTS } from '@/config/keys';
import { buildConversationTitleFromText } from '@/features/chat/storage/conversations';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { createIndexedDbStore } from '@/lib/indexed-db-store';

const LOCAL_CHAT_CONVERSATIONS_STORAGE_KEY = STORAGE_KEYS.LOCAL_CHAT_CONVERSATIONS;
const LOCAL_CHAT_CONVERSATIONS_UPDATED_EVENT = WINDOW_EVENTS.LOCAL_CHAT_CONVERSATIONS_UPDATED;
const EMPTY_LOCAL_CONVERSATION_THREADS: LocalConversationThread[] = [];
const EMPTY_LOCAL_CONVERSATION_SUMMARIES: ConversationSummary[] = [];

let localConversationSummariesCache: ConversationSummary[] = EMPTY_LOCAL_CONVERSATION_SUMMARIES;

export interface LocalConversationThread {
  createdAt?: string;
  id: string;
  lastMessageAt: string;
  messages: UIMessage[];
  preview: string | null;
  summary?: string | null;
  summaryGenerating?: boolean;
  summaryUpdatedAt?: string | null;
  title: string;
  titleGenerated?: boolean;
  titleGenerating?: boolean;
}

export function getMessageText(message: UIMessage) {
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

function buildConversationSummaries(threads: LocalConversationThread[]) {
  return threads.map((thread) => ({
    createdAt: thread.createdAt ?? thread.lastMessageAt,
    id: thread.id,
    lastMessageAt: thread.lastMessageAt,
    preview: thread.preview,
    summary: thread.summary ?? null,
    title: thread.title,
  }));
}

function areMessagesEqual(left: UIMessage[], right: UIMessage[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function parseLocalConversationThreads(input: unknown) {
  if (!Array.isArray(input)) {
    return null;
  }

  return input
    .filter((item) => item && typeof item === 'object' && typeof item.id === 'string')
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)) as LocalConversationThread[];
}

const localConversationStore = createIndexedDbStore<LocalConversationThread[]>({
  emptyValue: EMPTY_LOCAL_CONVERSATION_THREADS,
  eventName: LOCAL_CHAT_CONVERSATIONS_UPDATED_EVENT,
  legacyStorageKey: LOCAL_CHAT_CONVERSATIONS_STORAGE_KEY,
  onCacheChange: (threads) => {
    localConversationSummariesCache = buildConversationSummaries(threads);
  },
  parse: parseLocalConversationThreads,
  prepareForWrite: (threads) =>
    [...threads].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
  storageKey: LOCAL_CHAT_CONVERSATIONS_STORAGE_KEY,
});

export function readLocalConversationThreads() {
  return localConversationStore.read();
}

export async function ensureLocalConversationThreadsLoaded() {
  return await localConversationStore.ensureLoaded();
}

export function areLocalConversationThreadsLoaded() {
  return localConversationStore.isLoaded();
}

export async function writeLocalConversationThreads(threads: LocalConversationThread[]) {
  await localConversationStore.write(threads);
}

export function subscribeToLocalConversationUpdates(onChange: () => void) {
  return localConversationStore.subscribe(onChange);
}

export function listLocalConversationSummaries(): ConversationSummary[] {
  readLocalConversationThreads();
  return localConversationSummariesCache;
}

export function getLocalConversationThread(id: string) {
  return readLocalConversationThreads().find((thread) => thread.id === id) ?? null;
}

export async function getLocalConversationThreadById(id: string) {
  const threads = await ensureLocalConversationThreadsLoaded();
  return threads.find((thread) => thread.id === id) ?? null;
}

export function createLocalConversationThread(initialMessage: string) {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    id: `local-${crypto.randomUUID()}`,
    lastMessageAt: now,
    messages: [],
    preview: initialMessage.trim().slice(0, 120) || null,
    summary: null,
    title: buildConversationTitleFromText(initialMessage),
    titleGenerated: false,
  } satisfies LocalConversationThread;
}

export async function upsertLocalConversationThread(input: {
  id: string;
  messages: UIMessage[];
  title?: string;
}) {
  await ensureLocalConversationThreadsLoaded();
  const existingThreads = readLocalConversationThreads();
  const existingThread = existingThreads.find((thread) => thread.id === input.id) ?? null;
  const hasMessageChanges = existingThread
    ? !areMessagesEqual(existingThread.messages, input.messages)
    : true;
  const nextThread: LocalConversationThread = {
    createdAt: existingThread?.createdAt ?? new Date().toISOString(),
    id: input.id,
    lastMessageAt: hasMessageChanges
      ? new Date().toISOString()
      : (existingThread?.lastMessageAt ?? new Date().toISOString()),
    messages: input.messages,
    preview: buildPreview(input.messages),
    summary: existingThread?.summary ?? null,
    summaryGenerating: existingThread?.summaryGenerating ?? false,
    summaryUpdatedAt: existingThread?.summaryUpdatedAt ?? null,
    title:
      input.title?.trim() ||
      (existingThread?.titleGenerated ? existingThread.title : buildTitle(input.messages)),
    titleGenerated: existingThread?.titleGenerated ?? false,
    titleGenerating: existingThread?.titleGenerating ?? false,
  };

  await writeLocalConversationThreads([
    nextThread,
    ...existingThreads.filter((thread) => thread.id !== input.id),
  ]);

  return nextThread;
}

export async function renameLocalConversationThread(input: { id: string; title: string }) {
  const nextTitle = input.title.trim();
  if (!nextTitle) {
    return false;
  }

  await ensureLocalConversationThreadsLoaded();
  const existingThreads = readLocalConversationThreads();
  const targetThread = existingThreads.find((thread) => thread.id === input.id);

  if (!targetThread) {
    return false;
  }

  await writeLocalConversationThreads(
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

export async function updateLocalConversationSummary(input: {
  id: string;
  summary: string | null;
}) {
  await ensureLocalConversationThreadsLoaded();
  const existingThreads = readLocalConversationThreads();
  const targetThread = existingThreads.find((thread) => thread.id === input.id);

  if (!targetThread) {
    return false;
  }

  const nextSummary = input.summary?.trim() || null;

  await writeLocalConversationThreads(
    existingThreads.map((thread) =>
      thread.id === input.id
        ? {
            ...thread,
            summary: nextSummary,
            summaryGenerating: false,
            summaryUpdatedAt: nextSummary ? new Date().toISOString() : null,
          }
        : thread
    )
  );

  return true;
}

export async function deleteLocalConversationThread(id: string) {
  await ensureLocalConversationThreadsLoaded();
  const existingThreads = readLocalConversationThreads();
  const nextThreads = existingThreads.filter((thread) => thread.id !== id);

  if (nextThreads.length === existingThreads.length) {
    return false;
  }

  await writeLocalConversationThreads(nextThreads);
  return true;
}
