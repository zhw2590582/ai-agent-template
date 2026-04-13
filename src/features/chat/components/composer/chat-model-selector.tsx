'use client';

import { useMemo, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { ChatModelOption } from '@/features/models/types';
import { cn } from '@/lib/utils';

interface ChatModelSelectorProps {
  disabled?: boolean;
  models: ChatModelOption[];
  value: string;
  onValueChange: (value: string) => void;
}

export function ChatModelSelector({
  disabled = false,
  models,
  value,
  onValueChange,
}: ChatModelSelectorProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const selectedModel = models.find((option) => option.id === value);
  const groupedModels = useMemo(() => {
    const groups = new Map<string, ChatModelOption[]>();

    for (const model of models) {
      const existing = groups.get(model.providerName) ?? [];
      existing.push(model);
      groups.set(model.providerName, existing);
    }

    return Array.from(groups.entries());
  }, [models]);

  return (
    <>
      <Button
        disabled={disabled || models.length === 0}
        size="sm"
        type="button"
        variant="outline"
        className="h-8 gap-2 rounded-full px-2.5"
        onClick={() => setOpen(true)}
      >
        <span className="bg-muted text-foreground flex size-5 items-center justify-center rounded-full text-[10px] font-semibold">
          {selectedModel?.providerName.slice(0, 2).toUpperCase() ?? 'AI'}
        </span>
        <span className="text-muted-foreground">
          {selectedModel?.title ?? t('chat.composer.model_missing')}
        </span>
        <ChevronDownIcon data-icon="inline-end" />
      </Button>

      <CommandDialog
        className="max-w-2xl border p-0 sm:max-w-2xl"
        description={t('chat.composer.model_selector_description')}
        open={open}
        showCloseButton
        title={t('chat.composer.model_selector_title')}
        onOpenChange={setOpen}
      >
        <DialogTitle className="sr-only">{t('chat.composer.model_selector_title')}</DialogTitle>
        <DialogDescription className="sr-only">
          {t('chat.composer.model_selector_description')}
        </DialogDescription>

        <Command className="rounded-none bg-transparent p-0">
          <div className="border-b px-3 py-3">
            <CommandInput placeholder={t('chat.composer.model_selector_search')} />
          </div>
          <CommandList className="max-h-[420px] p-2">
            <CommandEmpty>{t('chat.composer.model_selector_empty')}</CommandEmpty>
            {groupedModels.map(([providerName, providerModels], index) => (
              <div key={providerName}>
                {index > 0 ? <CommandSeparator /> : null}
                <CommandGroup className="px-1 py-2" heading={providerName}>
                  {providerModels.map((option) => (
                    <CommandItem
                      className={cn(
                        'rounded-xl px-3 py-3',
                        option.id === value && 'bg-accent text-accent-foreground'
                      )}
                      key={option.id}
                      value={`${option.providerName} ${option.title} ${option.modelId}`}
                      onSelect={() => {
                        onValueChange(option.id);
                        setOpen(false);
                      }}
                    >
                      <div className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                        {option.providerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium">{option.title}</span>
                        <span className="text-muted-foreground truncate text-xs">
                          {option.modelId}
                        </span>
                      </div>
                      {option.id === value ? (
                        <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full">
                          <CheckIcon className="size-3.5" />
                        </div>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
