'use client';

import { CheckIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { PromptInputButton } from '@/components/ai-elements/prompt-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ProviderIcon } from '@/features/models/components/provider-icon';
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
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const selectedModel = models.find((option) => option.id === value);
  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return models;
    }

    return models.filter((model) =>
      [model.providerName, model.title, model.modelId].some((field) =>
        field.toLowerCase().includes(query)
      )
    );
  }, [models, search]);

  const groupedModels = useMemo(() => {
    const groups = new Map<string, ChatModelOption[]>();

    for (const model of filteredModels) {
      const existing = groups.get(model.providerName) ?? [];
      existing.push(model);
      groups.set(model.providerName, existing);
    }

    return Array.from(groups.entries());
  }, [filteredModels]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setSearch('');
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <PromptInputButton disabled={disabled || models.length === 0}>
          {selectedModel ? (
            <ProviderIcon
              className="size-3.5"
              fallbackClassName="size-5 rounded-full"
              providerId={selectedModel.providerId}
            />
          ) : (
            <span className="bg-muted text-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
              AI
            </span>
          )}
          <span className="truncate">
            {selectedModel?.title ?? t('chat.composer.model_missing')}
          </span>
          <ChevronDownIcon className="size-4 shrink-0" />
        </PromptInputButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-80 p-0">
        <div className="border-b p-2">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              className="pl-8"
              placeholder={t('chat.composer.model_selector_search')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation();
              }}
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-1">
          {groupedModels.length === 0 ? (
            <div className="text-muted-foreground px-2 py-6 text-center text-sm">
              {t('chat.composer.model_selector_empty')}
            </div>
          ) : (
            groupedModels.map(([providerName, providerModels], index) => (
              <div key={providerName}>
                {index > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{providerName}</DropdownMenuLabel>
                  {providerModels.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      className="gap-3 py-2"
                      onClick={() => {
                        onValueChange(option.id);
                        setOpen(false);
                      }}
                    >
                      <ProviderIcon
                        className="size-4"
                        fallbackClassName="size-8 shrink-0 rounded-md"
                        providerId={option.providerId}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">{option.title}</div>
                        <div className="text-muted-foreground truncate text-xs">
                          {option.modelId}
                        </div>
                      </div>
                      <CheckIcon
                        className={cn(
                          'size-4 shrink-0',
                          option.id === value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
