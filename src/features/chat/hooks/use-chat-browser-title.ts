'use client';

import { useEffect } from 'react';

export function useChatBrowserTitle(appName: string, conversationTitle: string | null) {
  useEffect(() => {
    document.title = conversationTitle ? `${appName} - ${conversationTitle}` : appName;
  }, [appName, conversationTitle]);
}
