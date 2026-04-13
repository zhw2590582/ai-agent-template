import { z } from 'zod';
import { generateText, type UIMessage } from 'ai';

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
};

function getMemoriesTable(client: MemoriesClient) {
  return client.from('memories') as MemoriesTable;
}

function normalizeMemoryContent(value: string) {
  return value.replace(/\s+/g, ' ').trim();
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
    .select('id, user_id, conversation_id, kind, content, source, status, metadata, created_at, updated_at')
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
  const existingContent = new Set(existing.map((memory) => normalizeMemoryContent(memory.content)));
  const nextEntries = extracted.filter((memory) => !existingContent.has(memory.content));

  if (nextEntries.length === 0) {
    return;
  }

  const { error } = await memories.insert(
    nextEntries.map((memory) => ({
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
