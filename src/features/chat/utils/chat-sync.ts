import type { UIMessage } from 'ai';

export function shouldResetToStarter(options: {
  urlConversationId: string | null;
  pendingThreadId: string | null;
}) {
  return options.urlConversationId == null && options.pendingThreadId == null;
}

export function hasUrlChanged(prevUrlId: string | null, nextUrlId: string | null) {
  return prevUrlId !== nextUrlId;
}

export function shouldSkipUrlSync(options: {
  urlConversationId: string | null;
  bootstrappingThreadId: string | null;
  isBusy: boolean;
}) {
  if (options.urlConversationId == null) return true;
  if (options.bootstrappingThreadId === options.urlConversationId) return true;
  if (options.isBusy) return true;
  return false;
}

export function chooseMessagesForUrl(options: {
  urlConversationId: string | null;
  initialConversationId: string | null;
  initialMessages: UIMessage[];
  starterMessages: UIMessage[];
}) {
  if (
    options.urlConversationId != null &&
    options.initialConversationId === options.urlConversationId &&
    options.initialMessages.length > 0
  ) {
    return options.initialMessages;
  }
  return options.starterMessages;
}

export function shouldMergeServerMessages(options: {
  urlConversationId: string | null;
  initialConversationId: string | null;
  initialMessages: UIMessage[];
}) {
  return (
    options.urlConversationId != null &&
    options.initialConversationId === options.urlConversationId &&
    options.initialMessages.length > 0
  );
}

export function pickNewMessages(options: { current: UIMessage[]; server: UIMessage[] }) {
  return options.current.length > options.server.length ? options.current : options.server;
}
