import { MEMORY_CONFIG } from '@/config/memory';

import type { MemorySettings } from '@/features/auth/profile/types';
import type { MemoryListItem } from '@/features/memory/types';
import { normalizeMemoryContent } from '@/features/memory/storage/memory-utils';

export function buildMemoryContext(
  memories: MemoryListItem[],
  options?: { memorySettings?: Partial<MemorySettings> | null }
) {
  if (memories.length === 0) {
    return null;
  }

  const scopedMemories = memories
    .slice(0, options?.memorySettings?.contextMaxItems ?? MEMORY_CONFIG.CONTEXT_MAX_ITEMS)
    .map((memory) => `- [${memory.kind}] ${normalizeMemoryContent(memory.content)}`);

  if (scopedMemories.length === 0) {
    return null;
  }

  return `Use these memories only when they are relevant to the current request.
Do not repeat them unless they help answer correctly.

${scopedMemories.join('\n')}`;
}
