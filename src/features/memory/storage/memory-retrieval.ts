import { MEMORY_CONFIG } from '@/config/app';
import type { UIMessage } from 'ai';

import type { MemorySettings } from '@/features/models/types';
import type { MemoryListItem } from '@/features/memory/types';
import {
  getMemorySimilarity,
  normalizeMemoryContent,
} from '@/features/memory/storage/memory-utils';
import { getMessageText } from '@/features/chat/storage/conversation-analysis';

const MEMORY_RELEVANCE_FLOOR = 0.08;

export function buildMemoryRetrievalQuery(messages: UIMessage[]) {
  return messages
    .filter((message) => message.role === 'user')
    .slice(-3)
    .map((message) => getMessageText(message))
    .filter((value): value is string => Boolean(value))
    .join('\n');
}

function getMemoryRelevanceScore(memory: MemoryListItem, query: string) {
  const similarity = getMemorySimilarity(memory.content, query);

  if (similarity <= 0) {
    return 0;
  }

  const kindBoost =
    memory.kind === 'preference' || memory.kind === 'workflow'
      ? 0.12
      : memory.kind === 'profile'
        ? 0.08
        : 0;

  return similarity + kindBoost;
}

export function buildMemoryContext(
  memories: MemoryListItem[],
  options?: { memorySettings?: Partial<MemorySettings> | null; query?: string | null }
) {
  if (memories.length === 0) {
    return null;
  }

  const normalizedQuery = options?.query ? normalizeMemoryContent(options.query) : '';
  const rankedMemories = normalizedQuery
    ? memories
        .map((memory) => ({
          memory,
          score: getMemoryRelevanceScore(memory, normalizedQuery),
        }))
        .filter((item) => item.score >= MEMORY_RELEVANCE_FLOOR)
        .sort((left, right) => right.score - left.score)
        .map((item) => item.memory)
    : memories;

  const scopedMemories = rankedMemories
    .slice(0, options?.memorySettings?.contextMaxItems ?? MEMORY_CONFIG.CONTEXT_MAX_ITEMS)
    .map((memory) => `- [${memory.kind}] ${normalizeMemoryContent(memory.content)}`);

  if (scopedMemories.length === 0) {
    return null;
  }

  return `Use these memories only when they are relevant to the current request.
Do not repeat them unless they help answer correctly.

${scopedMemories.join('\n')}`;
}
