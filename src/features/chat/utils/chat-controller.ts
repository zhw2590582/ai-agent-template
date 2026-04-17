import type { UIMessage } from 'ai';
import { nanoid } from 'nanoid';

export function buildUserMessage(text: string): UIMessage {
  return {
    id: nanoid(),
    role: 'user',
    parts: [{ type: 'text', text }],
  };
}

function buildChatBasePath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0];

  if (!locale) {
    return '/chat';
  }

  return `/${locale}/chat`;
}

export function updateConversationUrl(pathname: string, conversationId: string | null) {
  const basePath = buildChatBasePath(pathname);
  const target = conversationId ? `${basePath}/${conversationId}` : basePath;
  window.history.pushState(null, '', target);
}

export function clearConversationUrl(pathname: string) {
  window.history.replaceState(null, '', buildChatBasePath(pathname));
}
