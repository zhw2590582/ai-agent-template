import type { UIMessage } from 'ai';

import type { ConversationSummary } from '@/features/chat/storage/types';
import {
  buildUserMessage,
  clearConversationUrl,
  updateConversationUrl,
} from '@/features/chat/utils/chat-controller';

interface UseChatControllerOptions {
  activeThreadId: string | null;
  input: string;
  isBusy: boolean;
  isStartingThread: boolean;
  pathname: string;
  onCreateConversation: (initialMessage: string) => Promise<{ id: string; title: string }>;
  onCreateError: () => void;
  onSendMessage: (
    message?: { text: string },
    options?: { body?: { conversationId?: string } }
  ) => Promise<void>;
  onSendError: () => void;
  onStop: () => void;
  setBootstrappingThreadId: (value: string | null) => void;
  setInput: (value: string) => void;
  setIsStartingThread: (value: boolean) => void;
  setMessages: (messages: UIMessage[]) => void;
  setPendingThreadId: (value: string | null) => void;
  sidebar: {
    insertConversation: (conversation: ConversationSummary) => void;
  };
  starterMessages: UIMessage[];
}

export function useChatController({
  activeThreadId,
  input,
  isBusy,
  isStartingThread,
  pathname,
  onCreateConversation,
  onCreateError,
  onSendMessage,
  onSendError,
  onStop,
  setBootstrappingThreadId,
  setInput,
  setIsStartingThread,
  setMessages,
  setPendingThreadId,
  sidebar,
  starterMessages,
}: UseChatControllerOptions) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void (async () => {
      event.preventDefault();
      const text = input.trim();

      if (!text || isBusy || isStartingThread) return;

      // New thread
      if (!activeThreadId) {
        setIsStartingThread(true);
        let created: { id: string; title: string };
        try {
          created = await onCreateConversation(text);
        } catch {
          onCreateError();
          setIsStartingThread(false);
          return;
        }
        setIsStartingThread(false);

        setPendingThreadId(created.id);
        sidebar.insertConversation({
          id: created.id,
          lastMessageAt: new Date().toISOString(),
          preview: null,
          title: created.title,
        });
        setBootstrappingThreadId(created.id);
        updateConversationUrl(pathname, created.id);

        const userMessage: UIMessage = buildUserMessage(text);
        setMessages([userMessage]);
        setInput('');

        try {
          await onSendMessage(undefined, {
            body: { conversationId: created.id },
          });
        } catch {
          onSendError();
          setBootstrappingThreadId(null);
          setInput(text);
        }

        return;
      }

      // Existing thread or anonymous chat
      setInput('');
      try {
        await onSendMessage(
          { text },
          activeThreadId ? { body: { conversationId: activeThreadId } } : undefined
        );
      } catch {
        onSendError();
      }
    })();
  };

  const handleClearChat = () => {
    if (isBusy) onStop();

    setBootstrappingThreadId(null);
    setPendingThreadId(null);
    setMessages(starterMessages);
    setInput('');

    clearConversationUrl(pathname);
  };

  return { handleClearChat, handleSubmit };
}
