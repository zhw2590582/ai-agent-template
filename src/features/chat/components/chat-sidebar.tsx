'use client';

import Link from 'next/link';
import type { UIMessage } from 'ai';
import { MessageSquarePlusIcon, PanelLeftIcon, SparklesIcon } from 'lucide-react';

import { STARTER_PROMPTS } from '@/features/chat/lib/chat-config';
import { Button } from '@/components/ui/button';

interface ChatSidebarProps {
  isBusy: boolean;
  messages: UIMessage[];
  onQuickPrompt: (prompt: string) => void;
}

export function ChatSidebar({
  isBusy,
  messages,
  onQuickPrompt,
}: ChatSidebarProps) {
  const totalMessages = Math.max(0, messages.length - 1);

  return (
    <aside className="flex h-full flex-col border-r border-border bg-muted/30">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <PanelLeftIcon className="size-4" />
          Agent Workspace
        </div>
        <div className="rounded-full bg-background px-2 py-1 text-[11px] text-muted-foreground">
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
        <div className="px-2 text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
          Quick Prompts
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onQuickPrompt(prompt)}
              disabled={isBusy}
              className="rounded-2xl border border-transparent bg-background px-3 py-3 text-left text-sm leading-6 text-foreground transition hover:border-border hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 px-3">
        <div className="px-2 text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
          Workspace
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SparklesIcon className="size-4 text-muted-foreground" />
              通用 AI Agent
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              宽屏聊天工作区，支持流式回复和工具调用。
            </p>
          </div>
          <Link
            href="/test-deepseek"
            className="rounded-2xl bg-background px-4 py-3 text-sm transition hover:bg-accent"
          >
            打开 DeepSeek 测试页
          </Link>
          <a
            href="https://ai-sdk.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-background px-4 py-3 text-sm transition hover:bg-accent"
          >
            查看 AI SDK 文档
          </a>
        </div>
      </div>

      <div className="mt-auto px-5 py-4 text-xs text-muted-foreground">
        布局参考 chatgpt.com
      </div>
    </aside>
  );
}
