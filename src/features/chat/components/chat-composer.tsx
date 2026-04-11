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
  const t = useTranslations();

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
              placeholder={t('chat.composer.placeholder')}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <div className="text-muted-foreground px-2 text-xs">
                {t('chat.composer.workspace_hint')}
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
          {t('chat.composer.enter_hint')}
        </p>
      </div>
    </div>
  );
}
