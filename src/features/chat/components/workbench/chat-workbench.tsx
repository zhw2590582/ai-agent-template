'use client';

import type { UIMessage } from 'ai';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChatComposer } from '@/features/chat/components/composer/chat-composer';
import { ChatMessageList } from '@/features/chat/components/messages/chat-message-list';
import { ChatSidebar } from '@/features/chat/components/sidebar/chat-sidebar';
import { ChatPlaceholder } from '@/features/chat/components/workbench/chat-placeholder';
import { ChatTopBar } from '@/features/chat/components/workbench/chat-topbar';
import { useChatWorkbench } from '@/features/chat/hooks/use-chat-workbench';
import type { ConversationSummary } from '@/features/chat/storage/types';
import type { WorkbenchView } from '@/features/chat/types';
import type { MemoryListItem } from '@/features/memory/types';
import { MemoryPage } from '@/features/memory/pages/memory-page';
import { ModelsPage } from '@/features/models/pages/models-page';
import { cn } from '@/lib/utils';

interface ChatWorkbenchProps {
  activeView: WorkbenchView;
  initialConversationId: string | null;
  initialConversations: ConversationSummary[];
  initialConversationsHasMore: boolean;
  invalidConversationId: boolean;
  initialMemories: MemoryListItem[];
  initialMessages: UIMessage[];
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

  const isChatView = activeView === 'chat';
  const isMemoryView = activeView === 'memory';
  const isModelsRoute = activeView === 'models';
  const [isModelsDialogOpen, setIsModelsDialogOpen] = useState(false);
  const isModelsDialogVisible = isModelsRoute || isModelsDialogOpen;

  const closeModelsDialog = () => {
    setIsModelsDialogOpen(false);

    if (!isModelsRoute) {
      setIsModelsDialogOpen(false);
      return;
    }

    router.replace(
      workbench.activeThreadId
        ? `/${workbench.locale}?conversation=${workbench.activeThreadId}`
        : `/${workbench.locale}`
    );
  };

  const openModelsDialog = () => {
    setIsModelsDialogOpen(true);
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
          <ChatTopBar
            activeView={activeView}
            isModelsOpen={isModelsDialogVisible}
            locale={workbench.locale}
            onOpenModels={openModelsDialog}
            profileSaveStatus={workbench.profileSaveStatus}
            t={t}
          />
          {isChatView || isModelsRoute ? (
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
          ) : isMemoryView ? (
            <MemoryPage
              isAuthenticated={workbench.isAuthenticated}
              locale={workbench.locale}
              memories={initialMemories}
              onMemorySettingsChange={workbench.setMemorySettings}
              settings={workbench.memorySettings}
              summaries={workbench.sidebar.conversations}
            />
          ) : (
            <ChatPlaceholder activeView={activeView} t={t} />
          )}
        </section>
      </div>
      <Dialog
        open={isModelsDialogVisible}
        onOpenChange={(open) => (open ? openModelsDialog() : closeModelsDialog())}
      >
        <DialogContent
          className="flex h-[min(90vh,56rem)] max-w-[calc(100%-2rem)] flex-col overflow-hidden p-0 sm:max-w-6xl"
          showCloseButton
        >
          <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12">
            <DialogTitle>{t('navigation.models')}</DialogTitle>
            <DialogDescription>{t('models_page.sidebar.description')}</DialogDescription>
          </DialogHeader>
          <ModelsPage open={isModelsDialogVisible} onClose={closeModelsDialog} />
        </DialogContent>
      </Dialog>
    </main>
  );
}
