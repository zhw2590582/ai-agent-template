import { z } from 'zod';
import { generateText, type UIMessage } from 'ai';

import { MEMORY_CONFIG } from '@/config/app';
import type { Locale } from '@/config/i18n';
import { getRuntimeChatModel } from '@/features/chat/ai/models';
import { getMessageText } from '@/features/chat/storage/conversation-analysis';
import type { ChatRuntimeModel } from '@/features/models/types';
import type { MemoryListItem, MemoryRecord } from '@/features/memory/types';

const memoryExtractionSchema = z.array(
  z.object({
    content: z.string().min(1).max(280),
    kind: z.enum(['fact', 'manual', 'preference', 'profile', 'workflow']).default('preference'),
  })
);

const MEMORY_UPSERT_KINDS = new Set(['preference', 'profile', 'workflow']);
const MEMORY_SIMILARITY_THRESHOLD = 0.6;
const MEMORY_DUPLICATE_THRESHOLD = 0.9;

type MemoriesClient = {
  from: (table: 'memories') => unknown;
};

type MemoriesTable = {
  insert: (
    values:
      | Pick<
          MemoryRecord,
          'content' | 'conversation_id' | 'kind' | 'metadata' | 'source' | 'status' | 'user_id'
        >[]
      | Pick<
          MemoryRecord,
          'content' | 'conversation_id' | 'kind' | 'metadata' | 'source' | 'status' | 'user_id'
        >
  ) => PromiseLike<{ error: unknown }>;
  select: (columns: string) => {
    eq: (
      column: 'user_id' | 'status',
      value: string
    ) => {
      eq: (
        column: 'status',
        value: string
      ) => {
        order: (
          column: 'updated_at',
          options: { ascending: boolean }
        ) => PromiseLike<{ data: MemoryRecord[] | null; error: unknown }>;
      };
      order: (
        column: 'updated_at',
        options: { ascending: boolean }
      ) => PromiseLike<{ data: MemoryRecord[] | null; error: unknown }>;
    };
  };
  update: (
    values: Partial<
      Pick<MemoryRecord, 'content' | 'conversation_id' | 'kind' | 'status' | 'updated_at'>
    >
  ) => {
    eq: (
      column: 'id',
      value: string
    ) => {
      eq: (column: 'user_id', value: string) => PromiseLike<{ error: unknown }>;
    };
  };
};

function getMemoriesTable(client: MemoriesClient) {
  return client.from('memories') as MemoriesTable;
}

function normalizeMemoryContent(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function tokenizeMemoryContent(value: string) {
  return normalizeMemoryContent(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function getMemorySimilarity(left: string, right: string) {
  const leftTokens = new Set(tokenizeMemoryContent(left));
  const rightTokens = new Set(tokenizeMemoryContent(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  return intersection / new Set([...leftTokens, ...rightTokens]).size;
}

function chooseCanonicalMemoryContent(existing: string, incoming: string) {
  return incoming.length >= existing.length ? incoming : existing;
}

function formatMessages(messages: UIMessage[]) {
  return messages
    .map((message) => {
      const text = getMessageText(message);
      if (!text) {
        return null;
      }

      return `${message.role.toUpperCase()}: ${text}`;
    })
    .filter((value): value is string => Boolean(value))
    .join('\n\n');
}

export async function listMemoriesForUser(userId: string, client: MemoriesClient) {
  const memories = getMemoriesTable(client);
  const { data, error } = await memories
    .select(
      'id, user_id, conversation_id, kind, content, source, status, metadata, created_at, updated_at'
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  if (error || !data) {
    return [] satisfies MemoryListItem[];
  }

  return data.map((memory) => ({
    content: memory.content,
    conversationId: memory.conversation_id,
    id: memory.id,
    kind: memory.kind,
    source: memory.source,
    updatedAt: memory.updated_at,
  }));
}

export function buildMemoryContext(memories: MemoryListItem[]) {
  if (memories.length === 0) {
    return null;
  }

  const scopedMemories = memories
    .slice(0, MEMORY_CONFIG.CONTEXT_MAX_ITEMS)
    .map((memory) => `- [${memory.kind}] ${normalizeMemoryContent(memory.content)}`);

  if (scopedMemories.length === 0) {
    return null;
  }

  return `Use these memories only when they are relevant to the current request.
Do not repeat them unless they help answer correctly.

${scopedMemories.join('\n')}`;
}

export async function extractConversationMemories(
  messages: UIMessage[],
  options: {
    locale: Locale;
    runtimeModel?: ChatRuntimeModel | null;
  }
) {
  if (!options.runtimeModel || messages.length < 4) {
    return [];
  }

  const transcript = formatMessages(messages.slice(-12));
  if (!transcript) {
    return [];
  }

  const prompt = `Extract a small set of durable user memories from this conversation.

Context:
- User locale: ${options.locale}

Rules:
- Return JSON only
- Return an array
- Keep only stable preferences, profile facts, or durable workflow defaults
- Ignore temporary requests, one-off tasks, and transient debugging details
- Prefer at most 3 memories
- Each item must have: kind, content
- Kinds: preference, fact, profile, workflow

Conversation:
${transcript}`;

  const { text } = await generateText({
    model: getRuntimeChatModel(options.runtimeModel),
    prompt,
    maxOutputTokens: 220,
  });

  try {
    const parsed = JSON.parse(text) as unknown;
    return memoryExtractionSchema
      .parse(parsed)
      .map((item) => ({
        content: normalizeMemoryContent(item.content),
        kind: item.kind,
      }))
      .filter((item) => item.content.length > 0);
  } catch {
    return [];
  }
}

export async function saveConversationMemories(
  input: {
    conversationId: string;
    locale: Locale;
    messages: UIMessage[];
    runtimeModel?: ChatRuntimeModel | null;
    userId: string;
  },
  client: MemoriesClient
) {
  const extracted = await extractConversationMemories(input.messages, {
    locale: input.locale,
    runtimeModel: input.runtimeModel,
  });

  if (extracted.length === 0) {
    return;
  }

  const memories = getMemoriesTable(client);
  const existing = await listMemoriesForUser(input.userId, client);
  const uniqueExtracted = extracted.filter((memory, index, all) => {
    const normalized = normalizeMemoryContent(memory.content);
    return (
      all.findIndex((candidate) => normalizeMemoryContent(candidate.content) === normalized) ===
      index
    );
  });
  const existingByNormalizedContent = new Map(
    existing.map((memory) => [normalizeMemoryContent(memory.content), memory] as const)
  );
  const updatableEntries = uniqueExtracted.filter((memory) => {
    if (existingByNormalizedContent.has(normalizeMemoryContent(memory.content))) {
      return false;
    }

    return true;
  });

  const inserts: typeof uniqueExtracted = [];
  const updates: Array<{ content: string; id: string; kind: string }> = [];

  for (const memory of updatableEntries) {
    const mergeCandidate = existing.find((existingMemory) => {
      if (existingMemory.source === 'manual') {
        return false;
      }

      if (existingMemory.kind !== memory.kind) {
        return false;
      }

      const similarity = getMemorySimilarity(existingMemory.content, memory.content);

      if (similarity >= MEMORY_DUPLICATE_THRESHOLD) {
        return true;
      }

      if (!MEMORY_UPSERT_KINDS.has(memory.kind)) {
        return false;
      }

      return similarity >= MEMORY_SIMILARITY_THRESHOLD;
    });

    if (!mergeCandidate) {
      inserts.push(memory);
      continue;
    }

    const nextContent = chooseCanonicalMemoryContent(mergeCandidate.content, memory.content);
    if (normalizeMemoryContent(nextContent) === normalizeMemoryContent(mergeCandidate.content)) {
      continue;
    }

    updates.push({
      content: nextContent,
      id: mergeCandidate.id,
      kind: memory.kind,
    });
  }

  if (inserts.length === 0 && updates.length === 0) {
    return;
  }

  if (updates.length > 0) {
    for (const update of updates) {
      const { error } = await memories
        .update({
          content: normalizeMemoryContent(update.content),
          conversation_id: input.conversationId,
          kind: update.kind,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.id)
        .eq('user_id', input.userId);

      if (error) {
        throw error;
      }
    }
  }

  if (inserts.length > 0) {
    const { error } = await memories.insert(
      inserts.map((memory) => ({
        content: memory.content,
        conversation_id: input.conversationId,
        kind: memory.kind,
        metadata: {},
        source: 'auto',
        status: 'active',
        user_id: input.userId,
      }))
    );

    if (error) {
      throw error;
    }
  }
}

export async function deleteMemoryForUser(
  input: {
    id: string;
    userId: string;
  },
  client: MemoriesClient
) {
  const memories = getMemoriesTable(client);
  const { error } = await memories
    .update({ status: 'deleted' })
    .eq('id', input.id)
    .eq('user_id', input.userId);

  if (error) {
    throw error;
  }
}

export async function updateMemoryForUser(
  input: {
    content: string;
    id: string;
    kind: string;
    userId: string;
  },
  client: MemoriesClient
) {
  const memories = getMemoriesTable(client);

  const { error } = await memories
    .update({
      content: normalizeMemoryContent(input.content),
      updated_at: new Date().toISOString(),
      kind: input.kind,
    })
    .eq('id', input.id)
    .eq('user_id', input.userId);

  if (error) {
    throw error;
  }
}
