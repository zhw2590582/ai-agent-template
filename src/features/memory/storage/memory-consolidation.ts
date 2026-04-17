import { generateText, Output } from 'ai';
import { z } from 'zod';

import { AI_CONFIG } from '@/config/chat';
import { MEMORY_CONSOLIDATION_CONFIG } from '@/config/memory';
import type { Locale } from '@/config/i18n';
import { logger } from '@/lib/logger';
import { getRuntimeChatModel } from '@/features/chat/ai/core/models';
import type { ChatRuntimeModel } from '@/features/models/types';
import type { MemoryKind, MemoryListItem } from '@/features/memory/types';
import { normalizeMemoryContent } from '@/features/memory/storage/memory-utils';

const CONSOLIDATABLE_MEMORY_KINDS = ['fact', 'preference', 'profile', 'workflow'] as const;
type ConsolidatableMemoryKind = (typeof CONSOLIDATABLE_MEMORY_KINDS)[number];

const consolidatedMemoryItemSchema = z.object({
  content: z.string().min(1).max(280),
});

function isConsolidatableMemoryKind(kind: MemoryKind): kind is ConsolidatableMemoryKind {
  return (CONSOLIDATABLE_MEMORY_KINDS as readonly string[]).includes(kind);
}

export function getMemoryConsolidationMaxItems(kind: MemoryKind) {
  if (!isConsolidatableMemoryKind(kind)) {
    return null;
  }

  return MEMORY_CONSOLIDATION_CONFIG.MAX_ITEMS_PER_KIND[kind];
}

export function getMemoryConsolidationThreshold(kind: MemoryKind) {
  if (!isConsolidatableMemoryKind(kind)) {
    return null;
  }

  return MEMORY_CONSOLIDATION_CONFIG.THRESHOLDS[kind];
}

export function shouldConsolidateMemoryKind(kind: MemoryKind, count: number) {
  const threshold = getMemoryConsolidationThreshold(kind);
  return threshold != null && count >= threshold;
}

function dedupeConsolidatedContents(contents: string[]) {
  return contents.filter((content, index, all) => {
    const normalized = normalizeMemoryContent(content);
    return all.findIndex((candidate) => normalizeMemoryContent(candidate) === normalized) === index;
  });
}

function buildConsolidationPrompt(kind: ConsolidatableMemoryKind, locale: Locale, items: string[]) {
  const maxItems = getMemoryConsolidationMaxItems(kind);

  return `Consolidate these saved user memories.

Context:
- User locale: ${locale}
- Memory kind: ${kind}

Rules:
- Keep the language of the source memories whenever possible
- Merge duplicates and near-duplicates
- Keep distinct durable points separate
- Do not invent new facts
- Do not drop important information unless it is covered by a clearer merged item
- Return at most ${maxItems} items
- Each item must be short, durable, and standalone

Saved memories:
${items.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
}

function buildJsonFallbackPrompt(prompt: string) {
  return `${prompt}

Return a valid JSON array only.
- Do not wrap the JSON in markdown fences
- Each item must follow this shape: {"content":"..."}
- Return [] only if nothing should be kept`;
}

function extractJsonArrayText(text: string) {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const unfenced = fenceMatch?.[1]?.trim() ?? trimmed;
  const arrayStart = unfenced.indexOf('[');
  const arrayEnd = unfenced.lastIndexOf(']');

  if (arrayStart === -1 || arrayEnd === -1 || arrayEnd < arrayStart) {
    return unfenced;
  }

  return unfenced.slice(arrayStart, arrayEnd + 1);
}

function parseFallbackConsolidationOutput(text: string, maxItems: number) {
  try {
    const parsed = z
      .array(consolidatedMemoryItemSchema)
      .min(1)
      .safeParse(JSON.parse(extractJsonArrayText(text)));
    return parsed.success ? parsed.data.slice(0, maxItems) : [];
  } catch {
    return [];
  }
}

async function requestJsonFallbackConsolidation(options: {
  maxItems: number;
  prompt: string;
  runtimeModel: ChatRuntimeModel;
}) {
  const { text } = await generateText({
    model: getRuntimeChatModel(options.runtimeModel),
    prompt: buildJsonFallbackPrompt(options.prompt),
    maxOutputTokens: AI_CONFIG.MEMORY_CONSOLIDATION_MAX_OUTPUT_TOKENS,
  });

  return parseFallbackConsolidationOutput(text, options.maxItems);
}

export async function consolidateMemoryKind(
  memories: MemoryListItem[],
  options: {
    kind: MemoryKind;
    locale: Locale;
    runtimeModel?: ChatRuntimeModel | null;
  }
) {
  if (!options.runtimeModel || !isConsolidatableMemoryKind(options.kind)) {
    return [] as string[];
  }

  const maxItems = getMemoryConsolidationMaxItems(options.kind);
  if (maxItems == null) {
    return [] as string[];
  }

  const candidateItems = memories
    .filter((memory) => memory.kind === options.kind && memory.source !== 'manual')
    .slice(0, MEMORY_CONSOLIDATION_CONFIG.SOURCE_ITEMS_LIMIT)
    .map((memory) => normalizeMemoryContent(memory.content))
    .filter(Boolean);

  if (
    candidateItems.length === 0 ||
    !shouldConsolidateMemoryKind(options.kind, candidateItems.length)
  ) {
    return [] as string[];
  }

  const prompt = buildConsolidationPrompt(options.kind, options.locale, candidateItems);

  let output: Array<{ content: string }>;
  let shouldUseJsonFallback = false;

  try {
    const result = await generateText({
      model: getRuntimeChatModel(options.runtimeModel),
      output: Output.array({
        element: consolidatedMemoryItemSchema,
      }),
      prompt,
      maxOutputTokens: AI_CONFIG.MEMORY_CONSOLIDATION_MAX_OUTPUT_TOKENS,
    });

    output = result.output.slice(0, maxItems);
    shouldUseJsonFallback = output.length === 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.toLowerCase().includes('response_format')) {
      throw error;
    }
    shouldUseJsonFallback = true;
    output = [];
  }

  if (shouldUseJsonFallback) {
    output = await requestJsonFallbackConsolidation({
      maxItems,
      prompt,
      runtimeModel: options.runtimeModel,
    });
  }

  const contents = dedupeConsolidatedContents(
    output.map((item) => normalizeMemoryContent(item.content)).filter(Boolean)
  ).slice(0, maxItems);

  if (contents.length === 0) {
    logger.warn('Memory consolidation returned no items', {
      candidateCount: candidateItems.length,
      kind: options.kind,
    });
  }

  return contents;
}
