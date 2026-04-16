import { logger } from '@/lib/logger';
import { getMessageText } from '@/features/chat/storage/conversation-analysis';
import { buildRagContext, retrieveRelevantChunks } from '@/features/rag/server/retrieval';
import { hasRagAccess } from '@/features/rag/settings';
import type {
  ResolvedAgentRagContext,
  ResolveAgentRagContextOptions,
} from '@/features/chat/agent-runtime/types';

export async function resolveAgentRagContext({
  messages,
  ragSettings,
  supabase,
  user,
}: ResolveAgentRagContextOptions): Promise<ResolvedAgentRagContext> {
  if (!user || !ragSettings || !hasRagAccess(ragSettings)) {
    return {
      ragContext: null,
      ragSources: [],
    };
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const latestUserQuery = latestUserMessage ? getMessageText(latestUserMessage) : '';

  if (!latestUserQuery) {
    return {
      ragContext: null,
      ragSources: [],
    };
  }

  try {
    const retrievedChunks = await retrieveRelevantChunks({
      query: latestUserQuery,
      ragSettings,
      supabase,
      userId: user.id,
    });

    return {
      ragContext: buildRagContext(retrievedChunks, ragSettings),
      ragSources: retrievedChunks.map((chunk) => ({
        content: chunk.content,
        documentId: chunk.documentId,
        documentTitle: chunk.documentTitle,
        id: chunk.id,
        score: chunk.score,
        source: chunk.source,
      })),
    };
  } catch (error) {
    logger.warn('Chat request: failed to retrieve RAG context', {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      ragContext: null,
      ragSources: [],
    };
  }
}
