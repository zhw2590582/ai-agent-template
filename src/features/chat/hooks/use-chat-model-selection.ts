'use client';

import { useEffect } from 'react';

import type { ChatModelOption } from '@/features/models/types';

interface UseChatModelSelectionOptions {
  availableModels: ChatModelOption[];
  isLoading: boolean;
  persistedSelectedModelId: string | null;
  updateSelectedChatModelId: (
    selectedChatModelId: string | null,
    options?: { persist?: boolean; silent?: boolean }
  ) => Promise<boolean>;
}

export function useChatModelSelection({
  availableModels,
  isLoading,
  persistedSelectedModelId,
  updateSelectedChatModelId,
}: UseChatModelSelectionOptions) {
  useEffect(() => {
    if (isLoading || availableModels.length === 0) {
      return;
    }

    const hasPersistedModel = availableModels.some(
      (model) => model.id === persistedSelectedModelId
    );

    if (hasPersistedModel) {
      return;
    }

    void updateSelectedChatModelId(availableModels[0]?.id ?? null, {
      silent: true,
    });
  }, [availableModels, isLoading, persistedSelectedModelId, updateSelectedChatModelId]);
}
