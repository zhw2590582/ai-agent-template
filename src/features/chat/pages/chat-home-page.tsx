'use client';

import type { UIMessage } from 'ai';

import { ChatWorkbench } from '@/features/chat/components/workbench/chat-workbench';
import type { ConversationSummary } from '@/features/chat/storage/types';
import type { WorkbenchView } from '@/features/chat/types';

interface ChatHomePageProps {
  activeView?: WorkbenchView;
  initialConversationId?: string | null;
  initialConversations?: ConversationSummary[];
  initialConversationsHasMore?: boolean;
  invalidConversationId?: boolean;
  initialMessages?: UIMessage[];
}

export function ChatHomePage({
  activeView = 'chat',
  initialConversationId = null,
  initialConversations = [],
  initialConversationsHasMore = false,
  invalidConversationId = false,
  initialMessages = [],
}: ChatHomePageProps) {
  return (
    <ChatWorkbench
      activeView={activeView}
      initialConversationId={initialConversationId}
      initialConversations={initialConversations}
      initialConversationsHasMore={initialConversationsHasMore}
      initialMessages={initialMessages}
      invalidConversationId={invalidConversationId}
    />
  );
}
