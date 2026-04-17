'use client';

import { useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useChatThreadState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlConversationId = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const chatSegmentIndex = segments.findIndex((segment) => segment === 'chat');
    const pathConversationId =
      chatSegmentIndex >= 0 && segments.length > chatSegmentIndex + 1
        ? segments[chatSegmentIndex + 1]
        : null;

    return pathConversationId ?? searchParams.get('id') ?? searchParams.get('conversation') ?? null;
  }, [pathname, searchParams]);

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
