'use client';

import { useEffect, useRef } from 'react';
import { CHAT_UI_CONFIG } from '@/config/chat';

interface UseInvalidConversationGuardOptions {
  bootstrappingThreadId: string | null;
  effectivePendingThreadId: string | null;
  handleClearChat: () => void;
  invalidConversationId: boolean;
  isBusy: boolean;
  isStartingThread: boolean;
  t: (key: string) => string;
  toastError: (message: string) => void;
  urlConversationId: string | null;
}

export function useInvalidConversationGuard({
  bootstrappingThreadId,
  effectivePendingThreadId,
  handleClearChat,
  invalidConversationId,
  isBusy,
  isStartingThread,
  t,
  toastError,
  urlConversationId,
}: UseInvalidConversationGuardOptions) {
  const invalidIdHandledRef = useRef(false);

  useEffect(() => {
    if (!urlConversationId) {
      invalidIdHandledRef.current = false;
      return;
    }

    if (!invalidConversationId) return;
    if (effectivePendingThreadId || bootstrappingThreadId || isStartingThread || isBusy) return;
    if (invalidIdHandledRef.current) return;

    invalidIdHandledRef.current = true;
    toastError(t('chat.errors.invalid_conversation'));
    window.setTimeout(() => {
      handleClearChat();
    }, CHAT_UI_CONFIG.INVALID_CONVERSATION_RESET_DELAY_MS);
  }, [
    bootstrappingThreadId,
    effectivePendingThreadId,
    handleClearChat,
    invalidConversationId,
    isBusy,
    isStartingThread,
    t,
    toastError,
    urlConversationId,
  ]);
}
