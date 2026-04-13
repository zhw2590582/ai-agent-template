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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    <div className="border-border bg-background border-t px-6 py-5">
      <div
        className={`mx-auto w-full transition-[max-width] duration-300 ease-out ${isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl'}`}
      >
        <PromptInput className="w-full" onSubmit={(_, event) => onSubmit(event)}>
          <PromptInputBody>
            <PromptInputTextarea
              className="min-h-19 border-0 bg-transparent text-base"
              disabled={isBusy}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder={t('chat.composer.placeholder')}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      disabled={isBusy || availableModels.length === 0}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {t('chat.composer.model_label')}
                      <span className="text-muted-foreground">
                        {availableModels.find((option) => option.id === model)?.title ??
                          t('chat.composer.model_missing')}
                      </span>
                      <ChevronDownIcon data-icon="inline-end" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-52">
                    <DropdownMenuRadioGroup onValueChange={onModelChange} value={model}>
                      {availableModels.map((option) => (
                        <DropdownMenuRadioItem key={option.id} value={option.id}>
                          {option.title}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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
