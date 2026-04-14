'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function useChatThreadState() {
  const searchParams = useSearchParams();
  const urlConversationId = useMemo(
    () => searchParams.get('id') ?? searchParams.get('conversation') ?? null,
    [searchParams]
  );

  const [input, setInput] = useState('');
  const [isStartingThread, setIsStartingThread] = useState(false);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);
  const [bootstrappingThreadId, setBootstrappingThreadId] = useState<string | null>(null);

  const effectivePendingThreadId = urlConversationId ? null : pendingThreadId;
  const activeThreadId = urlConversationId ?? effectivePendingThreadId;

  return {
    activeThreadId,
    bootstrappingThreadId,
    effectivePendingThreadId,
    input,
    isStartingThread,
    setBootstrappingThreadId,
    setInput,
    setIsStartingThread,
    setPendingThreadId,
    urlConversationId,
  };
}
