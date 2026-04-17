import type { UIMessage } from 'ai';
import { nanoid } from 'nanoid';

export function buildUserMessage(text: string): UIMessage {
  return {
    id: nanoid(),
    role: 'user',
    parts: [{ type: 'text', text }],
  };
}

export function updateConversationUrl(pathname: string, conversationId: string | null) {
  const target = conversationId ? `${pathname}?id=${conversationId}` : pathname;
  window.history.pushState(null, '', target);
}

export function clearConversationUrl(pathname: string) {
  window.history.replaceState(null, '', pathname);
}
