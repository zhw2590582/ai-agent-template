'use client';

import type { UIMessage } from 'ai';
import { MessageSquarePlusIcon, PanelLeftIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

interface ChatSidebarProps {
  isBusy: boolean;
  messages: UIMessage[];
  onQuickPrompt: (prompt: string) => void;
  starterPrompts: string[];
}

export function ChatSidebar({ isBusy, messages, onQuickPrompt, starterPrompts }: ChatSidebarProps) {
  const t = useTranslations();
  const totalMessages = Math.max(0, messages.length - 1);

  return (
    <aside className="border-border bg-muted/30 flex h-full flex-col border-r">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="text-foreground flex items-center gap-2 text-sm font-medium">
          <PanelLeftIcon className="size-4" />
          {t('chat.sidebar.agent_workspace')}
        </div>
        <div className="bg-background text-muted-foreground rounded-full px-2 py-1 text-[11px]">
          {t('chat.sidebar.messages', { count: totalMessages })}
        </div>
      </div>

      <div className="px-3">
        <Button className="w-full justify-start gap-2 rounded-2xl" size="lg">
          <MessageSquarePlusIcon data-icon="inline-start" />
          {t('chat.sidebar.new_chat')}
        </Button>
      </div>

      <div className="px-3 pt-5">
        <div className="text-muted-foreground px-2 text-[11px] tracking-[0.26em] uppercase">
          {t('chat.quick_prompts.title')}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onQuickPrompt(prompt)}
              disabled={isBusy}
              className="bg-background text-foreground hover:border-border hover:bg-accent rounded-2xl border border-transparent px-3 py-3 text-left text-sm leading-6 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 px-3">
        <div className="text-muted-foreground px-2 text-[11px] tracking-[0.26em] uppercase">
          {t('chat.sidebar.workspace')}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <div className="bg-background rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SparklesIcon className="text-muted-foreground size-4" />
              {t('chat.title')}
            </div>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {t('chat.sidebar.workspace_desc')}
            </p>
          </div>
          <a
            href="https://ai-sdk.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background hover:bg-accent rounded-2xl px-4 py-3 text-sm transition"
          >
            {t('chat.sidebar.view_ai_sdk_docs')}
          </a>
        </div>
      </div>

      <div className="text-muted-foreground mt-auto px-5 py-4 text-xs">
        {t('chat.sidebar.dark_mode_only')}
      </div>
    </aside>
  );
}
