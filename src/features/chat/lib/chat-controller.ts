import type { UIMessage } from 'ai';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { nanoid } from 'nanoid';

export function buildUserMessage(text: string): UIMessage {
  return {
    id: nanoid(),
    role: 'user',
    parts: [{ type: 'text', text }],
  };
}

export function updateConversationUrl(
  router: AppRouterInstance,
  pathname: string,
  conversationId: string | null
) {
  const target = conversationId ? `${pathname}?id=${conversationId}` : pathname;
  router.replace(target, { scroll: false });
}

export function clearConversationUrl(router: AppRouterInstance, pathname: string) {
  window.history.replaceState(window.history.state, '', pathname);
  router.replace(pathname, { scroll: false });
}
