'use client';

import type { UIMessage } from 'ai';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ChatComposer } from '@/features/chat/components/composer/chat-composer';
import { ChatMessageList } from '@/features/chat/components/messages/chat-message-list';
import { ChatSidebar } from '@/features/chat/components/sidebar/chat-sidebar';
import { ChatPlaceholder } from '@/features/chat/components/workbench/chat-placeholder';
import { WorkbenchDialog } from '@/features/chat/components/workbench/workbench-dialog';
import { WorkbenchDialogPanel } from '@/features/chat/components/workbench/workbench-dialog-panel';
import { ChatTopBar } from '@/features/chat/components/workbench/chat-topbar';
import { useChatWorkbench } from '@/features/chat/hooks/use-chat-workbench';
import type { ConversationSummary } from '@/features/chat/storage/types';
import type { WorkbenchView } from '@/features/chat/types';
import { MemoryContent } from '@/features/memory/components/memory-content';
import type { MemoryListItem } from '@/features/memory/types';
import { ModelsContent } from '@/features/models/components/models-content';
import { SearchContent } from '@/features/search/components/search-content';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatWorkbenchProps {
  activeView: WorkbenchView;
  initialConversationId: string | null;
  initialConversations: ConversationSummary[];
  initialConversationsHasMore: boolean;
  initialMemories: MemoryListItem[];
  initialMessages: UIMessage[];
  invalidConversationId: boolean;
}

export function ChatWorkbench({
  activeView,
  initialConversationId,
  initialConversations,
  initialConversationsHasMore,
  invalidConversationId,
  initialMemories,
  initialMessages,
}: ChatWorkbenchProps) {
  const t = useTranslations();
  const router = useRouter();
  const workbench = useChatWorkbench({
    initialConversationId,
    initialConversations,
    initialConversationsHasMore,
    invalidConversationId,
    initialMessages,
  });

  const [activeDialogView, setActiveDialogView] = useState<Exclude<WorkbenchView, 'chat'> | null>(
    activeView === 'chat' ? null : activeView
  );

  const closeDialog = () => {
    setActiveDialogView(null);
  };

  const openView = (view: Exclude<WorkbenchView, 'chat'>) => {
    setActiveDialogView(view);

    if (view === 'memory') {
      router.refresh();
    }
  };

  return (
    <main className="bg-background text-foreground h-screen">
      <div className="flex h-full w-full overflow-hidden">
        <div
          className={cn(
            'hidden overflow-hidden transition-[width] duration-300 ease-out lg:block',
            workbench.isSidebarOpen ? 'w-70' : 'w-16'
          )}
        >
          <ChatSidebar
            activeConversationId={workbench.activeThreadId}
            conversations={workbench.sidebar.conversations}
            hasMoreConversations={workbench.sidebar.hasMore}
            isLoadingMoreConversations={workbench.sidebar.isLoadingMore}
            isOpen={workbench.isSidebarOpen}
            onClearChat={workbench.handleClearChat}
            onDeleteConversation={workbench.deleteConversation}
            onLoadMoreConversations={workbench.sidebar.loadMore}
            onRenameConversation={workbench.renameConversation}
            onSearchQueryChange={workbench.setSidebarSearchQuery}
            onToggleOpen={() => workbench.setIsSidebarOpen((value) => !value)}
            searchQuery={workbench.sidebarSearchQuery}
          />
        </div>

        <section className="bg-background flex min-h-0 flex-1 flex-col transition-[width] duration-300 ease-out">
          <ChatTopBar activeView={activeDialogView ?? 'chat'} onOpenView={openView} t={t} />
          <>
            <ChatMessageList
              error={workbench.error}
              isSidebarOpen={workbench.isSidebarOpen}
              messages={workbench.messages}
              onRetry={() => workbench.regenerate()}
            />
            <ChatComposer
              availableModels={workbench.availableModels}
              input={workbench.input}
              isBusy={workbench.isBusy || workbench.isStartingThread}
              isCreatingThread={workbench.isStartingThread}
              isSidebarOpen={workbench.isSidebarOpen}
              model={workbench.selectedModel}
              onInputChange={workbench.setInput}
              onModelChange={workbench.setSelectedModel}
              onStop={workbench.stop}
              onSubmit={workbench.handleSubmit}
              status={workbench.isStartingThread ? 'submitted' : workbench.status}
            />
          </>
        </section>
      </div>
      {activeDialogView ? (
        <WorkbenchDialog
          open
          t={t}
          view={activeDialogView}
          onOpenChange={(open) => {
            if (!open) {
              closeDialog();
            }
          }}
        >
          {activeDialogView === 'models' ? (
            <ModelsContent onClose={closeDialog} />
          ) : activeDialogView === 'memory' ? (
            <MemoryContent
              isAuthenticated={workbench.isAuthenticated}
              locale={workbench.locale}
              memories={initialMemories}
              onClose={closeDialog}
              onMemorySettingsChange={workbench.setMemorySettings}
              settings={workbench.memorySettings}
              summaries={initialConversations}
            />
          ) : activeDialogView === 'search' ? (
            <SearchContent
              onClose={closeDialog}
              onSearchSettingsChange={workbench.setSearchSettings}
              settings={workbench.searchSettings}
            />
          ) : (
            <WorkbenchDialogPanel
              bodyClassName="overflow-y-auto"
              footer={
                <Button className="min-w-24" type="button" variant="outline" onClick={closeDialog}>
                  {t('common.cancel')}
                </Button>
              }
            >
              <ChatPlaceholder activeView={activeDialogView} t={t} />
            </WorkbenchDialogPanel>
          )}
        </WorkbenchDialog>
      ) : null}
    </main>
  );
}
