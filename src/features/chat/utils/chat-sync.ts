import type { UIMessage } from 'ai';

export type ConversationSyncPhase = 'bootstrapping' | 'ready' | 'unmanaged';

export function isLocalConversationId(conversationId: string | null) {
  return Boolean(conversationId?.startsWith('local-'));
}

export function getConversationSyncPhase(options: {
  activeThreadId: string | null;
  bootstrappingThreadId: string | null;
}): ConversationSyncPhase {
  if (!options.activeThreadId || !isLocalConversationId(options.activeThreadId)) {
    return 'unmanaged';
  }

  if (options.bootstrappingThreadId === options.activeThreadId) {
    return 'bootstrapping';
  }

  return 'ready';
}

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
  phase: ConversationSyncPhase;
  isBusy: boolean;
}) {
  if (options.urlConversationId == null) return true;
  if (options.phase === 'bootstrapping') return true;
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
