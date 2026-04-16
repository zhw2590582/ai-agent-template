'use client';

import type { UIMessage } from 'ai';

import { ChatWorkbench } from '@/features/chat/components/workbench/chat-workbench';
import type { ConversationSummary } from '@/features/chat/storage/types';
import type { WorkbenchView } from '@/features/chat/types';
import type { MemoryListItem } from '@/features/memory/types';

interface ChatHomePageProps {
  activeView?: WorkbenchView;
  initialConversationId?: string | null;
  initialConversations?: ConversationSummary[];
  initialConversationsHasMore?: boolean;
  invalidConversationId?: boolean;
  initialMemories?: MemoryListItem[];
  initialMessages?: UIMessage[];
  supabaseConfigured?: boolean;
}

export function ChatHomePage({
  activeView = 'chat',
  initialConversationId = null,
  initialConversations = [],
  initialConversationsHasMore = false,
  invalidConversationId = false,
  initialMemories = [],
  initialMessages = [],
  supabaseConfigured = false,
}: ChatHomePageProps) {
  return (
    <ChatWorkbench
      activeView={activeView}
      initialConversationId={initialConversationId}
      initialConversations={initialConversations}
      initialConversationsHasMore={initialConversationsHasMore}
      initialMemories={initialMemories}
      initialMessages={initialMessages}
      invalidConversationId={invalidConversationId}
      supabaseConfigured={supabaseConfigured}
    />
  );
}
