'use client';

import type { ChatStatus } from 'ai';
import { useTranslations } from 'next-intl';

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { ChatModelSelector } from '@/features/chat/components/composer/chat-model-selector';
import type { ChatModelOption } from '@/features/models/types';

interface ChatComposerProps {
  availableModels: ChatModelOption[];
  input: string;
  isBusy: boolean;
  isCreatingThread?: boolean;
  isSidebarOpen: boolean;
  model: string;
  onInputChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onStop: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  status: ChatStatus;
}

export function ChatComposer({
  availableModels,
  input,
  isBusy,
  isCreatingThread = false,
  isSidebarOpen,
  model,
  onInputChange,
  onModelChange,
  onStop,
  onSubmit,
  status,
}: ChatComposerProps) {
  const t = useTranslations();

  return (
    <div className="border-border bg-background border-t px-6 py-5 select-none">
      <div
        className={`mx-auto w-full transition-[max-width] duration-300 ease-out ${isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl'}`}
      >
        <PromptInput
          className="w-full **:data-[slot=input-group]:has-disabled:bg-transparent **:data-[slot=input-group]:has-disabled:opacity-100 dark:**:data-[slot=input-group]:has-disabled:bg-transparent"
          onSubmit={(_, event) => onSubmit(event)}
        >
          <PromptInputBody>
            <PromptInputTextarea
              className="min-h-19 border-0 bg-transparent text-base"
              onChange={(event) => onInputChange(event.target.value)}
              placeholder={t('chat.composer.placeholder')}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <div className="flex flex-wrap items-center gap-2">
                <ChatModelSelector
                  models={availableModels}
                  value={model}
                  onValueChange={onModelChange}
                />
              </div>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={
                isCreatingThread ||
                availableModels.length === 0 ||
                (!isBusy && input.trim().length === 0)
              }
              onStop={isCreatingThread ? undefined : onStop}
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
