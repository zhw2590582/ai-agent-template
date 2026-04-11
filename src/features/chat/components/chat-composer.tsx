'use client';

import type { ChatStatus } from 'ai';
import { ChevronDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { MODEL_OPTIONS, type ModelId } from '@/config/models';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ChatComposerProps {
  input: string;
  isBusy: boolean;
  isSidebarOpen: boolean;
  model: ModelId;
  onModelChange: (value: ModelId) => void;
  status: ChatStatus;
  onInputChange: (value: string) => void;
  onStop: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatComposer({
  input,
  isBusy,
  isSidebarOpen,
  model,
  onModelChange,
  status,
  onInputChange,
  onStop,
  onSubmit,
}: ChatComposerProps) {
  const t = useTranslations();

  return (
    <div className="border-border bg-background border-t px-6 py-5">
      <div
        className={`mx-auto w-full transition-[max-width] duration-300 ease-out ${isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl'}`}
      >
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
              <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" type="button" variant="outline">
                      {t('chat.composer.model_label')}
                      <span className="text-muted-foreground">
                        {t(
                          MODEL_OPTIONS.find((option) => option.id === model)?.translationKey ??
                            MODEL_OPTIONS[0].translationKey
                        )}
                      </span>
                      <ChevronDownIcon data-icon="inline-end" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-52">
                    <DropdownMenuRadioGroup
                      onValueChange={(value) => onModelChange(value as ModelId)}
                      value={model}
                    >
                      {MODEL_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem key={option.id} value={option.id}>
                          {t(option.translationKey)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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
