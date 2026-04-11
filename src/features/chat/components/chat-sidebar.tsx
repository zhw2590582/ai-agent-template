'use client';

import Link from 'next/link';
import type { UIMessage } from 'ai';

import { ToolStats } from '@/features/tools/components/tool-stats';
import { STARTER_PROMPTS } from '@/features/chat/lib/chat-config';

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
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
      <div className="rounded-[2rem] border border-stone-200/80 bg-white/80 p-6 shadow-[0_18px_50px_rgba(28,25,23,0.08)] backdrop-blur">
        <div className="text-[11px] uppercase tracking-[0.32em] text-stone-500">
          AI Agent
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-stone-950">
          通用聊天界面
        </h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          首页现在直接是一个可用的 agent 工作台。文本响应、工具调用和工具统计都在同一个界面里。
        </p>
      </div>

      <ToolStats messages={messages} />

      <div className="rounded-[1.8rem] border border-stone-200/80 bg-[#1c1917] p-5 text-stone-100 shadow-[0_18px_50px_rgba(28,25,23,0.16)]">
        <div className="text-[11px] uppercase tracking-[0.28em] text-stone-400">
          Quick Start
        </div>
        <div className="mt-3 space-y-3">
          {STARTER_PROMPTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => onQuickPrompt(prompt)}
              disabled={isBusy}
              className="w-full rounded-2xl border border-stone-700 px-4 py-3 text-left text-sm leading-6 text-stone-200 transition hover:border-stone-500 hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.8rem] border border-stone-200/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(28,25,23,0.08)]">
        <div className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
          Resource
        </div>
        <div className="mt-3 flex flex-col gap-3 text-sm text-stone-700">
          <Link
            href="/test-deepseek"
            className="rounded-2xl bg-stone-100 px-4 py-3 transition hover:bg-stone-200"
          >
            打开 DeepSeek 测试页
          </Link>
          <a
            href="https://ai-sdk.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-stone-100 px-4 py-3 transition hover:bg-stone-200"
          >
            查看 AI SDK 文档
          </a>
        </div>
      </div>
    </aside>
  );
}

