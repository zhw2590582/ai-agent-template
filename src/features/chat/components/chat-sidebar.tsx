'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { useEffect, useRef } from 'react';
import {
  HouseIcon,
  MenuIcon,
  MessageSquarePlusIcon,
  MessageSquareTextIcon,
  PanelLeftCloseIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import type { ConversationSummary } from '@/server/storage/types';

interface ChatSidebarProps {
  activeConversationId: string | null;
  conversations: ConversationSummary[];
  hasMoreConversations?: boolean;
  isLoadingMoreConversations?: boolean;
  isOpen: boolean;
  onClearChat: () => void;
  onLoadMoreConversations?: () => void | Promise<void>;
  onToggleOpen: () => void;
}

export function ChatSidebar({
  activeConversationId,
  conversations,
  hasMoreConversations = false,
  isLoadingMoreConversations = false,
  isOpen,
  onClearChat,
  onLoadMoreConversations,
  onToggleOpen,
}: ChatSidebarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const homeHref = `/${locale}`;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleNewChatClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== homeHref) {
      return;
    }
    event.preventDefault();
    onClearChat();
  };

  const loadMoreRef = useRef(onLoadMoreConversations);
  useEffect(() => {
    loadMoreRef.current = onLoadMoreConversations;
  }, [onLoadMoreConversations]);

  useEffect(() => {
    if (!hasMoreConversations || isLoadingMoreConversations || !onLoadMoreConversations) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const root = sentinel.closest('[data-slot="scroll-area-viewport"]');
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          void loadMoreRef.current?.();
        }
      },
      {
        root: root instanceof Element ? root : null,
        rootMargin: '120px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // Only re-create observer when loading state or availability changes
    // — not on every conversations.length change
  }, [hasMoreConversations, isLoadingMoreConversations, onLoadMoreConversations]);

  if (!isOpen) {
    return (
      <aside className="border-border bg-muted/30 flex h-full w-16 flex-col items-center border-r py-4">
        <Button
          aria-label={t('chat.header.show_sidebar')}
          onClick={onToggleOpen}
          size="icon"
          type="button"
          variant="ghost"
        >
          <MenuIcon />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="border-border bg-muted/30 flex h-full flex-col border-r">
      <div className="flex items-center justify-between px-4 py-4">
        <Button asChild className="h-auto px-0" variant="ghost">
          <Link
            className="text-foreground flex items-center gap-2 text-sm font-medium"
            href={homeHref}
          >
            <HouseIcon className="size-4" />
            {t('chat.sidebar.agent_workspace')}
          </Link>
        </Button>
        <Button
          aria-label={t('chat.header.hide_sidebar')}
          onClick={onToggleOpen}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <PanelLeftCloseIcon />
        </Button>
      </div>

      <div className="px-3">
        <Button asChild className="w-full justify-start gap-2" size="default" variant="ghost">
          <Link href={homeHref} onClick={handleNewChatClick}>
            <MessageSquarePlusIcon data-icon="inline-start" />
            {t('chat.sidebar.new_chat')}
          </Link>
        </Button>
      </div>

      <div className="pl-3">
        <ScrollArea className="mt-3 h-[calc(100vh-8rem)]">
          <div className="flex flex-col gap-1.5 pr-3 pb-2">
            {conversations.length > 0 ? (
              <>
                {conversations.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}?id=${item.id}`}
                    className={`text-foreground hover:bg-accent rounded-md p-1.5 text-sm transition ${item.id === activeConversationId ? 'bg-accent' : ''}`}
                  >
                    <span className="line-clamp-2">{item.title}</span>
                  </Link>
                ))}
                {hasMoreConversations ? (
                  <div aria-hidden className="min-h-3 w-full shrink-0" ref={sentinelRef} />
                ) : null}
                {isLoadingMoreConversations ? (
                  <div className="text-muted-foreground flex items-center justify-center gap-2 py-3 text-xs">
                    <Spinner className="size-4" />
                    {t('chat.sidebar.loading_more')}
                  </div>
                ) : null}
              </>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageSquareTextIcon className="size-4" />
                  </EmptyMedia>
                  <EmptyTitle>{t('chat.sidebar.history_empty_title')}</EmptyTitle>
                  <EmptyDescription>{t('chat.sidebar.no_history')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
