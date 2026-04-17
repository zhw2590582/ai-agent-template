'use client';

import { STORAGE_KEYS, WINDOW_EVENTS } from '@/config/keys';
import type { Locale } from '@/config/i18n';
import { API_ROUTES } from '@/config/api';
import type { ChatRuntimeModel } from '@/features/models/types';
import { dedupeExtractedMemories, planMemoryMerge } from '@/features/memory/storage/memory-merge';
import { normalizeMemoryContent } from '@/features/memory/storage/memory-utils';
import type { MemoryKind, MemoryListItem } from '@/features/memory/types';
import { createIndexedDbStore } from '@/lib/indexed-db-store';
import type { UIMessage } from 'ai';

const LOCAL_CHAT_MEMORIES_STORAGE_KEY = STORAGE_KEYS.LOCAL_CHAT_MEMORIES;
const LOCAL_CHAT_MEMORIES_UPDATED_EVENT = WINDOW_EVENTS.LOCAL_CHAT_MEMORIES_UPDATED;
const EMPTY_LOCAL_MEMORIES: MemoryListItem[] = [];

function createLocalMemoryId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local-memory-${crypto.randomUUID()}`;
  }

  return `local-memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseLocalMemories(input: unknown) {
  if (!Array.isArray(input)) {
    return null;
  }

  return input
    .filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.content === 'string' &&
        typeof item.kind === 'string' &&
        typeof item.updatedAt === 'string'
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)) as MemoryListItem[];
}

const localMemoryStore = createIndexedDbStore<MemoryListItem[]>({
  emptyValue: EMPTY_LOCAL_MEMORIES,
  eventName: LOCAL_CHAT_MEMORIES_UPDATED_EVENT,
  legacyStorageKey: LOCAL_CHAT_MEMORIES_STORAGE_KEY,
  parse: parseLocalMemories,
  prepareForWrite: (memories) =>
    [...memories].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
  storageKey: LOCAL_CHAT_MEMORIES_STORAGE_KEY,
});

export function readLocalMemories() {
  return localMemoryStore.read();
}

export async function ensureLocalMemoriesLoaded() {
  return await localMemoryStore.ensureLoaded();
}

export function areLocalMemoriesLoaded() {
  return localMemoryStore.isLoaded();
}

export async function writeLocalMemories(memories: MemoryListItem[]) {
  await localMemoryStore.write(memories);
}

export function subscribeToLocalMemoryUpdates(onChange: () => void) {
  return localMemoryStore.subscribe(onChange);
}

export async function updateLocalMemory(input: { content: string; id: string; kind: MemoryKind }) {
  const normalizedContent = normalizeMemoryContent(input.content);

  if (!normalizedContent) {
    return false;
  }

  await ensureLocalMemoriesLoaded();
  const existingMemories = readLocalMemories();
  const targetMemory = existingMemories.find((memory) => memory.id === input.id);

  if (!targetMemory) {
    return false;
  }

  await writeLocalMemories(
    existingMemories.map((memory) =>
      memory.id === input.id
        ? {
            ...memory,
            content: normalizedContent,
            kind: input.kind,
            updatedAt: new Date().toISOString(),
          }
        : memory
    )
  );

  return true;
}

export async function deleteLocalMemory(memoryId: string) {
  await ensureLocalMemoriesLoaded();
  const existingMemories = readLocalMemories();
  const nextMemories = existingMemories.filter((memory) => memory.id !== memoryId);

  if (nextMemories.length === existingMemories.length) {
    return false;
  }

  await writeLocalMemories(nextMemories);
  return true;
}

export async function mergeExtractedLocalMemories(input: {
  conversationId: string;
  extracted: Array<{ content: string; kind: MemoryKind }>;
}) {
  await ensureLocalMemoriesLoaded();
  const existingMemories = readLocalMemories();
  const dedupedExtracted = dedupeExtractedMemories(input.extracted);
  const { inserts, updates } = planMemoryMerge(existingMemories, dedupedExtracted);

  if (inserts.length === 0 && updates.length === 0) {
    return existingMemories;
  }

  const now = new Date().toISOString();
  const updatedMemoryIds = new Set(updates.map((update) => update.id));
  const nextMemories = existingMemories.map((memory) => {
    const update = updates.find((candidate) => candidate.id === memory.id);

    if (!update) {
      return memory;
    }

    return {
      ...memory,
      content: normalizeMemoryContent(update.content),
      conversationId: input.conversationId,
      kind: update.kind,
      updatedAt: now,
    };
  });

  const insertedMemories = inserts.map<MemoryListItem>((memory) => ({
    content: normalizeMemoryContent(memory.content),
    conversationId: input.conversationId,
    id: createLocalMemoryId(),
    kind: memory.kind,
    source: 'auto',
    updatedAt: now,
  }));

  await writeLocalMemories([
    ...nextMemories.filter((memory) => !updatedMemoryIds.has(memory.id)),
    ...nextMemories.filter((memory) => updatedMemoryIds.has(memory.id)),
    ...insertedMemories,
  ]);

  return readLocalMemories();
}

export async function extractAndMergeLocalMemories(input: {
  conversationId: string;
  locale: Locale;
  messages: UIMessage[];
  runtimeModel?: ChatRuntimeModel | null;
}) {
  if (!input.runtimeModel) {
    return readLocalMemories();
  }

  const response = await fetch(API_ROUTES.memoriesExtract, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locale: input.locale,
      messages: input.messages,
      runtimeModel: input.runtimeModel,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to extract local memories');
  }

  const data = (await response.json()) as {
    memories?: Array<{ content: string; kind: MemoryKind }>;
  };

  return await mergeExtractedLocalMemories({
    conversationId: input.conversationId,
    extracted: data.memories ?? [],
  });
}
