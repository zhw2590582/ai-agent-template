import type { UIMessage } from 'ai';
import type { Locale } from '@/config/i18n';

import { extractConversationMemories } from '@/features/memory/storage/memory-extraction';
import { planMemoryMerge, dedupeExtractedMemories } from '@/features/memory/storage/memory-merge';
import {
  deleteMemoryForUser,
  insertMemories,
  listMemoriesForUser,
  type MemoriesClient,
  updateMemoryForUser,
  updateMemoryRecord,
} from '@/features/memory/storage/memory-repository';
import {
  buildMemoryContext,
} from '@/features/memory/storage/memory-retrieval';
import type { ChatRuntimeModel } from '@/features/models/types';

export {
  buildMemoryContext,
  deleteMemoryForUser,
  listMemoriesForUser,
  updateMemoryForUser,
};

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

  const existing = await listMemoriesForUser(input.userId, client);
  const dedupedExtracted = dedupeExtractedMemories(extracted);
  const { inserts, updates } = planMemoryMerge(existing, dedupedExtracted);

  if (updates.length > 0) {
    for (const update of updates) {
      await updateMemoryRecord(
        {
          content: update.content,
          conversationId: input.conversationId,
          id: update.id,
          kind: update.kind,
          userId: input.userId,
        },
        client
      );
    }
  }

  if (inserts.length > 0) {
    await insertMemories(
      {
        conversationId: input.conversationId,
        items: inserts,
        userId: input.userId,
      },
      client
    );
  }
}
