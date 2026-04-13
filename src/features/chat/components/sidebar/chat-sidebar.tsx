'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  BotIcon,
  MessageSquarePlusIcon,
  MoreHorizontalIcon,
  PanelLeftCloseIcon,
  PanelRightCloseIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarSearch } from '@/features/chat/components/sidebar/sidebar-search';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  activeConversationId: string | null;
  conversations: ConversationSummary[];
  hasMoreConversations?: boolean;
  isLoadingMoreConversations?: boolean;
  isOpen: boolean;
  onClearChat: () => void;
  onLoadMoreConversations?: () => void | Promise<void>;
  onSearchQueryChange?: (value: string) => void;
  onToggleOpen: () => void;
  searchQuery?: string;
}

export function ChatSidebar({
  activeConversationId,
  conversations,
  hasMoreConversations = false,
  isLoadingMoreConversations = false,
  isOpen,
  onClearChat,
  onLoadMoreConversations,
  onSearchQueryChange,
  onToggleOpen,
  searchQuery = '',
}: ChatSidebarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const homeHref = `/${locale}`;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
  }, [hasMoreConversations, isLoadingMoreConversations, onLoadMoreConversations]);

  const isFiltering = searchQuery.trim().length > 0;

  if (!isOpen) {
    return (
      <aside className="border-border bg-muted/30 flex h-full flex-col border-r">
        <div className="border-border mb-3 flex h-12 items-center justify-between border-b px-4">
          <Button
            aria-label={t('chat.header.show_sidebar')}
            className="group"
            onClick={onToggleOpen}
            size="icon"
            type="button"
            variant="ghost"
          >
            <span className="relative inline-block">
              <BotIcon className="size-4 transition-opacity duration-150 group-hover:opacity-0" />
              <PanelRightCloseIcon className="absolute top-0 left-0 size-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
            </span>
          </Button>
        </div>
        <div className="px-3">
          <Button asChild className="w-full justify-start gap-2" size="default" variant="ghost">
            <Link href={homeHref} onClick={handleNewChatClick}>
              <MessageSquarePlusIcon data-icon="inline-center" />
            </Link>
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="border-border bg-muted/30 flex h-full flex-col border-r">
      <div className="border-border mb-3 flex h-12 items-center justify-between border-b px-4">
        <Link
          className="text-foreground flex shrink-0 items-center gap-2 truncate text-sm font-medium"
          href={homeHref}
        >
          <BotIcon className="size-4" />
          {t('chat.sidebar.agent_workspace')}
        </Link>
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

      <SidebarSearch
        ariaLabel={t('chat.sidebar.search_placeholder')}
        onChange={(value) => onSearchQueryChange?.(value)}
        placeholder={t('chat.sidebar.search_placeholder')}
        value={searchQuery}
      />

      <div className="pl-3">
        <ScrollArea className="mt-3 h-[calc(100vh-10.5rem)]">
          <div className="flex flex-col gap-1.5 pr-3 pb-2">
            {conversations.length > 0 ? (
              <>
                {conversations.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'group hover:bg-accent text-foreground flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition',
                      item.id === activeConversationId || openMenuId === item.id ? 'bg-accent' : ''
                    )}
                  >
                    <Link className="min-w-0 flex-1" href={`/${locale}?id=${item.id}`}>
                      <div className="max-w-56 truncate">{item.title}</div>
                    </Link>
                    <DropdownMenu
                      open={openMenuId === item.id}
                      onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label={t('chat.sidebar.options_label')}
                          className={cn(
                            'shrink-0 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100',
                            openMenuId === item.id ? 'opacity-100' : ''
                          )}
                          onPointerDown={(event) => event.stopPropagation()}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="min-w-36"
                        onEscapeKeyDown={() => setOpenMenuId(null)}
                        onInteractOutside={() => setOpenMenuId(null)}
                      >
                        <DropdownMenuItem>{t('chat.sidebar.rename')}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          {t('chat.sidebar.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                {!isFiltering && hasMoreConversations ? (
                  <div aria-hidden className="min-h-3 w-full shrink-0" ref={sentinelRef} />
                ) : null}
                {isLoadingMoreConversations ? (
                  <div className="flex flex-col gap-1 py-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-8 w-full rounded-md" />
                    ))}
                  </div>
                ) : null}
              </>
            ) : isLoadingMoreConversations ? (
              <div className="flex flex-col gap-1 py-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-full rounded-md" />
                ))}
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
