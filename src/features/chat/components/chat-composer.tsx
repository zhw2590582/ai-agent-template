'use client';

import type { ChatStatus } from 'ai';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';

interface ChatComposerProps {
  input: string;
  isBusy: boolean;
  status: ChatStatus;
  onInputChange: (value: string) => void;
  onStop: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatComposer({
  input,
  isBusy,
  status,
  onInputChange,
  onStop,
  onSubmit,
}: ChatComposerProps) {
  return (
    <div className="border-border bg-background border-t px-6 py-5">
      <div className="mx-auto w-full max-w-3xl">
        <PromptInput className="w-full" onSubmit={(_, event) => onSubmit(event)}>
          <PromptInputBody>
            <PromptInputTextarea
              className="min-h-19 border-0 bg-transparent text-base"
              disabled={isBusy}
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="给 AI Agent 发送消息"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <div className="text-muted-foreground px-2 text-xs">
                宽屏工作区，支持流式回复与工具调用
              </div>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!isBusy && input.trim().length === 0}
              onStop={onStop}
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>

        <p className="text-muted-foreground mt-3 text-center text-xs">
          Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
}
