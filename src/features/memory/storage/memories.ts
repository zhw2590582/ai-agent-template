import type { UIMessage } from 'ai';
import type { Locale } from '@/config/i18n';

import { logger } from '@/lib/logger';
import {
  consolidateMemoryKind,
  shouldConsolidateMemoryKind,
} from '@/features/memory/storage/memory-consolidation';
import { extractConversationMemories } from '@/features/memory/storage/memory-extraction';
import { planMemoryMerge, dedupeExtractedMemories } from '@/features/memory/storage/memory-merge';
import {
  deleteMemoryForUser,
  hardDeleteMemoryRecord,
  insertMemories,
  listMemoriesForUser,
  type MemoriesClient,
  updateMemoryForUser,
  updateMemoryRecord,
} from '@/features/memory/storage/memory-repository';
import { buildMemoryContext } from '@/features/memory/storage/memory-retrieval';
import type { ChatRuntimeModel } from '@/features/models/types';
import type { MemoryKind } from '@/features/memory/types';

export { buildMemoryContext, deleteMemoryForUser, listMemoriesForUser, updateMemoryForUser };

async function consolidateTouchedMemoryKinds(
  input: {
    conversationId: string;
    locale: Locale;
    runtimeModel?: ChatRuntimeModel | null;
    touchedKinds: MemoryKind[];
    userId: string;
  },
  client: MemoriesClient
) {
  if (!input.runtimeModel || input.touchedKinds.length === 0) {
    return;
  }

  const allMemories = await listMemoriesForUser(input.userId, client);

  for (const kind of new Set(input.touchedKinds)) {
    if (kind === 'manual') {
      continue;
    }

    const kindMemories = allMemories.filter(
      (memory) => memory.kind === kind && memory.source !== 'manual'
    );

    if (!shouldConsolidateMemoryKind(kind, kindMemories.length)) {
      continue;
    }

    try {
      const consolidatedContents = await consolidateMemoryKind(kindMemories, {
        kind,
        locale: input.locale,
        runtimeModel: input.runtimeModel,
      });

      if (consolidatedContents.length === 0) {
        continue;
      }

      const targetMemories = kindMemories.slice(0, consolidatedContents.length);

      for (const [index, content] of consolidatedContents.entries()) {
        const target = targetMemories[index];
        if (!target) {
          break;
        }

        await updateMemoryRecord(
          {
            content,
            conversationId: input.conversationId,
            id: target.id,
            kind,
            userId: input.userId,
          },
          client
        );
      }

      const deleteCandidates = kindMemories.slice(consolidatedContents.length);
      for (const memory of deleteCandidates) {
        await hardDeleteMemoryRecord(
          {
            id: memory.id,
            userId: input.userId,
          },
          client
        );
      }
    } catch (error) {
      logger.warn('Memory consolidation failed', {
        error: error instanceof Error ? error.message : String(error),
        kind,
        userId: input.userId,
      });
    }
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

  await consolidateTouchedMemoryKinds(
    {
      conversationId: input.conversationId,
      locale: input.locale,
      runtimeModel: input.runtimeModel,
      touchedKinds: [
        ...updates.map((update) => update.kind),
        ...inserts.map((insert) => insert.kind),
      ],
      userId: input.userId,
    },
    client
  );
}
