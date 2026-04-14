import type { MemoryKind } from '@/features/memory/types';

export function normalizeMemoryContent(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractWordTokens(value: string) {
  return normalizeMemoryContent(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function extractCharacterNGrams(value: string, size = 2) {
  const normalized = normalizeMemoryContent(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
  const ngrams: string[] = [];

  if (normalized.length < size) {
    return ngrams;
  }

  for (let index = 0; index <= normalized.length - size; index += 1) {
    ngrams.push(normalized.slice(index, index + size));
  }

  return ngrams;
}

function tokenizeMemoryContent(value: string) {
  return [...extractWordTokens(value), ...extractCharacterNGrams(value)];
}

export function getMemorySimilarity(left: string, right: string) {
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

export function getMemoryKindPriority(kind: MemoryKind) {
  switch (kind) {
    case 'workflow':
      return 4;
    case 'preference':
      return 3;
    case 'profile':
      return 2;
    case 'fact':
      return 1;
    case 'manual':
      return 0;
  }
}

export function chooseCanonicalMemoryKind(existing: MemoryKind, incoming: MemoryKind) {
  return getMemoryKindPriority(incoming) >= getMemoryKindPriority(existing) ? incoming : existing;
}

export function chooseCanonicalMemoryContent(existing: string, incoming: string) {
  return incoming.length >= existing.length ? incoming : existing;
}
