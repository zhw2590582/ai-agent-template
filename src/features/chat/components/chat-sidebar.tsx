'use client';

import type { UIMessage } from 'ai';
import { MessageSquarePlusIcon, PanelLeftIcon, SparklesIcon } from 'lucide-react';

import { STARTER_PROMPTS } from '@/features/chat/lib/chat-config';
import { Button } from '@/components/ui/button';

interface ChatSidebarProps {
  isBusy: boolean;
  messages: UIMessage[];
  onQuickPrompt: (prompt: string) => void;
}

export function ChatSidebar({ isBusy, messages, onQuickPrompt }: ChatSidebarProps) {
  const totalMessages = Math.max(0, messages.length - 1);

  return (
    <aside className="border-border bg-muted/30 flex h-full flex-col border-r">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="text-foreground flex items-center gap-2 text-sm font-medium">
          <PanelLeftIcon className="size-4" />
          Agent Workspace
        </div>
        <div className="bg-background text-muted-foreground rounded-full px-2 py-1 text-[11px]">
          {totalMessages} messages
        </div>
      </div>

      <div className="px-3">
        <Button className="w-full justify-start gap-2 rounded-2xl" size="lg">
          <MessageSquarePlusIcon data-icon="inline-start" />
          新对话
        </Button>
      </div>

      <div className="px-3 pt-5">
        <div className="text-muted-foreground px-2 text-[11px] tracking-[0.26em] uppercase">
          Quick Prompts
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {STARTER_PROMPTS.map((prompt) => (
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
          Workspace
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <div className="bg-background rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SparklesIcon className="text-muted-foreground size-4" />
              通用 AI Agent
            </div>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              宽屏聊天工作区，支持流式回复和工具调用。
            </p>
          </div>
          <a
            href="https://ai-sdk.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background hover:bg-accent rounded-2xl px-4 py-3 text-sm transition"
          >
            查看 AI SDK 文档
          </a>
        </div>
      </div>

      <div className="text-muted-foreground mt-auto px-5 py-4 text-xs">Dark mode only</div>
    </aside>
  );
}
