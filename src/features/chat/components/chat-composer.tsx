'use client';

interface ChatComposerProps {
  input: string;
  isBusy: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatComposer({
  input,
  isBusy,
  onInputChange,
  onSubmit,
}: ChatComposerProps) {
  return (
    <div className="border-t border-stone-200/80 px-5 py-5 sm:px-7">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-[1.9rem] border border-stone-300 bg-white p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <textarea
            value={input}
            onChange={event => onInputChange(event.target.value)}
            rows={4}
            placeholder="输入你的问题。这个界面支持普通问答，也支持时间、天气和计算类工具调用。"
            disabled={isBusy}
            className="min-h-28 w-full resize-none rounded-[1.4rem] border-0 bg-transparent px-4 py-3 text-sm leading-7 text-stone-900 outline-none placeholder:text-stone-400 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
            Enter 换行后点击发送，流式响应会直接出现在上方。
          </p>
          <button
            type="submit"
            disabled={isBusy || input.trim().length === 0}
            className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {isBusy ? '处理中...' : '发送消息'}
          </button>
        </div>
      </form>
    </div>
  );
}

