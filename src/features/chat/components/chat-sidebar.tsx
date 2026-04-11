'use client';

import Link from 'next/link';
import type { UIMessage } from 'ai';
import {
  HouseIcon,
  MenuIcon,
  MessageSquarePlusIcon,
  MessageSquareTextIcon,
  PanelLeftCloseIcon,
} from 'lucide-react';
import { useMemo } from 'react';
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
import { getTextContent } from '@/features/chat/lib/message-utils';

interface ChatSidebarProps {
  isOpen: boolean;
  messages: UIMessage[];
  onClearChat: () => void;
  onSelectHistory: (value: string) => void;
  onToggleOpen: () => void;
}

export function ChatSidebar({
  isOpen,
  messages,
  onClearChat,
  onSelectHistory,
  onToggleOpen,
}: ChatSidebarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const totalMessages = Math.max(0, messages.length - 1);
  const homeHref = `/${locale}`;
  const historyItems = useMemo(
    () =>
      messages
        .filter((message) => message.role === 'user')
        .map((message) => ({
          id: message.id,
          text: getTextContent(message).trim(),
        }))
        .filter((message) => message.text.length > 0)
        .slice(-8)
        .reverse(),
    [messages]
  );

  const handleReturnHome = () => {
    if (pathname === homeHref) {
      onClearChat();
    }
  };

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
          <Link href={homeHref} onClick={handleReturnHome}>
            <MessageSquarePlusIcon data-icon="inline-start" />
            {t('chat.sidebar.new_chat')}
          </Link>
        </Button>
      </div>

      <div className="px-3 pt-5">
        <div className="text-muted-foreground px-2 text-[11px] tracking-[0.26em] uppercase">
          {t('chat.sidebar.history')}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {historyItems.length > 0 ? (
            historyItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectHistory(item.text)}
                className="bg-background text-foreground hover:border-border hover:bg-accent rounded-2xl border border-transparent px-3 py-3 text-left transition"
              >
                <div className="flex items-start gap-2">
                  <MessageSquareTextIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-muted-foreground text-[11px] tracking-[0.22em] uppercase">
                      {t('chat.sidebar.history_item', { index: historyItems.length - index })}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm leading-6">{item.text}</div>
                  </div>
                </div>
              </button>
            ))
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
      </div>

      <div className="text-muted-foreground mt-auto px-5 py-4 text-xs">
        <div className="mb-2 text-[11px]">
          {t('chat.sidebar.messages', { count: totalMessages })}
        </div>
        {t('chat.sidebar.dark_mode_only')}
      </div>
    </aside>
  );
}
