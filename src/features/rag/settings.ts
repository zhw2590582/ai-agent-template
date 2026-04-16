import { RAG_CONFIG } from '@/config/rag';
import type { RagSettings } from '@/features/rag/types';

export const DEFAULT_RAG_SETTINGS: RagSettings = {
  apiKey: '',
  enabled: false,
  matchCount: RAG_CONFIG.DEFAULT_MATCH_COUNT,
  matchThreshold: RAG_CONFIG.DEFAULT_MATCH_THRESHOLD,
  maxContextCharacters: RAG_CONFIG.DEFAULT_MAX_CONTEXT_CHARACTERS,
  provider: RAG_CONFIG.DEFAULT_PROVIDER,
};

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function clampFloat(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

export function normalizeRagSettings(input?: Partial<RagSettings> | null): RagSettings {
  return {
    apiKey: typeof input?.apiKey === 'string' ? input.apiKey : DEFAULT_RAG_SETTINGS.apiKey,
    enabled: input?.enabled ?? DEFAULT_RAG_SETTINGS.enabled,
    matchCount: clampInteger(
      input?.matchCount,
      DEFAULT_RAG_SETTINGS.matchCount,
      1,
      RAG_CONFIG.MAX_MATCH_COUNT
    ),
    matchThreshold: clampFloat(input?.matchThreshold, DEFAULT_RAG_SETTINGS.matchThreshold, 0, 1),
    maxContextCharacters: clampInteger(
      input?.maxContextCharacters,
      DEFAULT_RAG_SETTINGS.maxContextCharacters,
      500,
      RAG_CONFIG.MAX_CONTEXT_CHARACTERS
    ),
    provider: input?.provider === 'voyage' ? input.provider : DEFAULT_RAG_SETTINGS.provider,
  };
}

export function hasRagAccess(settings: RagSettings | null | undefined) {
  return Boolean(settings?.enabled && settings.apiKey.trim().length > 0);
}
