import type { MemoryKind, MemoryListItem } from '@/features/memory/types';
import {
  chooseCanonicalMemoryContent,
  chooseCanonicalMemoryKind,
  getMemorySimilarity,
  normalizeMemoryContent,
} from '@/features/memory/storage/memory-utils';

const MEMORY_UPSERT_KINDS = new Set<MemoryKind>(['preference', 'profile', 'workflow']);
const MEMORY_SIMILARITY_THRESHOLD = 0.6;
const MEMORY_DUPLICATE_THRESHOLD = 0.9;
const MEMORY_MERGEABLE_KINDS = new Set<MemoryKind>(['fact', 'preference', 'profile', 'workflow']);

export function dedupeExtractedMemories(memories: Array<{ content: string; kind: MemoryKind }>) {
  return memories.filter((memory, index, all) => {
    const normalized = normalizeMemoryContent(memory.content);
    return (
      all.findIndex((candidate) => normalizeMemoryContent(candidate.content) === normalized) ===
      index
    );
  });
}

export function planMemoryMerge(
  existing: MemoryListItem[],
  extracted: Array<{ content: string; kind: MemoryKind }>
) {
  const existingByNormalizedContent = new Map(
    existing.map((memory) => [normalizeMemoryContent(memory.content), memory] as const)
  );

  const updatableEntries = extracted.filter((memory) => {
    return !existingByNormalizedContent.has(normalizeMemoryContent(memory.content));
  });

  const inserts: typeof extracted = [];
  const updates: Array<{ content: string; id: string; kind: MemoryKind }> = [];

  for (const memory of updatableEntries) {
    const mergeCandidate = existing.find((existingMemory) => {
      if (existingMemory.source === 'manual') {
        return false;
      }

      const canonicalExistingKind = existingMemory.kind;
      const canonicalIncomingKind = memory.kind;

      if (
        !MEMORY_MERGEABLE_KINDS.has(canonicalExistingKind) ||
        !MEMORY_MERGEABLE_KINDS.has(canonicalIncomingKind)
      ) {
        return false;
      }

      const similarity = getMemorySimilarity(existingMemory.content, memory.content);

      if (similarity >= MEMORY_DUPLICATE_THRESHOLD) {
        return true;
      }

      if (
        !MEMORY_UPSERT_KINDS.has(canonicalIncomingKind) &&
        !MEMORY_UPSERT_KINDS.has(canonicalExistingKind)
      ) {
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
      kind: chooseCanonicalMemoryKind(mergeCandidate.kind, memory.kind),
    });
  }

  return { inserts, updates };
}
