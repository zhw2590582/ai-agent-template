'use client';

import { useCallback, useState } from 'react';

import type { ConversationSummary } from '@/features/chat/storage/types';

interface ConversationListStoreState {
  insertedConversation: ConversationSummary | null;
  patches: Record<string, Partial<ConversationSummary>>;
  removedIds: string[];
}

export function useConversationListStore() {
  const [state, setState] = useState<ConversationListStoreState>({
    insertedConversation: null,
    patches: {},
    removedIds: [],
  });

  const buildList = useCallback(
    (items: ConversationSummary[]) => {
      const withInserted =
        state.insertedConversation &&
        !items.some((item) => item.id === state.insertedConversation?.id)
          ? [state.insertedConversation, ...items]
          : items;

      return withInserted
        .filter((item) => !state.removedIds.includes(item.id))
        .map((item) =>
          state.patches[item.id]
            ? {
                ...item,
                ...state.patches[item.id],
              }
            : item
        );
    },
    [state.insertedConversation, state.patches, state.removedIds]
  );

  const insertConversation = useCallback((conversation: ConversationSummary) => {
    setState((current) => ({
      insertedConversation: conversation,
      patches: {
        ...current.patches,
        [conversation.id]: conversation,
      },
      removedIds: current.removedIds.filter((id) => id !== conversation.id),
    }));
  }, []);

  const patchConversation = useCallback(
    (conversationId: string, patch: Partial<ConversationSummary>) => {
      setState((current) => ({
        insertedConversation:
          current.insertedConversation?.id === conversationId
            ? {
                ...current.insertedConversation,
                ...patch,
              }
            : current.insertedConversation,
        patches: {
          ...current.patches,
          [conversationId]: {
            ...current.patches[conversationId],
            ...patch,
          },
        },
        removedIds: current.removedIds.filter((id) => id !== conversationId),
      }));
    },
    []
  );

  const removeConversation = useCallback((conversationId: string) => {
    setState((current) => {
      const nextPatches = { ...current.patches };
      delete nextPatches[conversationId];

      return {
        insertedConversation:
          current.insertedConversation?.id === conversationId ? null : current.insertedConversation,
        patches: nextPatches,
        removedIds: current.removedIds.includes(conversationId)
          ? current.removedIds
          : [...current.removedIds, conversationId],
      };
    });
  }, []);

  const clearInsertedConversation = useCallback((conversationId?: string | null) => {
    setState((current) => ({
      ...current,
      insertedConversation:
        !conversationId || current.insertedConversation?.id === conversationId
          ? null
          : current.insertedConversation,
    }));
  }, []);

  return {
    buildList,
    clearInsertedConversation,
    insertConversation,
    patchConversation,
    removeConversation,
    state,
  };
}
