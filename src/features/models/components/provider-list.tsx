'use client';

import { useTranslations } from 'next-intl';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { ProviderIcon } from '@/features/models/components/provider-icon';
import type { ProviderPreset, ProviderSettings } from '@/features/models/types';
import { cn } from '@/lib/utils';

interface ProviderListProps {
  providers: ProviderPreset[];
  selectedProviderId: string;
  settings: Record<string, ProviderSettings>;
  onSelectProvider: (providerId: string) => void;
  onToggleProvider: (providerId: string) => void;
}

export function ProviderList({
  providers,
  selectedProviderId,
  settings,
  onSelectProvider,
  onToggleProvider,
}: ProviderListProps) {
  const t = useTranslations();

  return (
    <ScrollArea className="h-full overflow-hidden">
      <div className="space-y-2 p-2">
        {providers.map((provider) => {
          const providerSettings = settings[provider.id];
          const isSelected = provider.id === selectedProviderId;

          return (
            <div
              key={provider.id}
              className={cn(
                'hover:bg-accent/15 flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors',
                isSelected && 'border-primary/35 bg-accent hover:bg-accent'
              )}
              onClick={() => onSelectProvider(provider.id)}
            >
              <div className="flex h-auto min-w-0 flex-1 items-center justify-start gap-3 px-0 py-0 font-normal">
                <ProviderIcon
                  fallbackClassName="flex size-10 shrink-0 items-center justify-center border text-sm font-semibold"
                  providerId={provider.id}
                />
                <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                  {provider.name}
                </span>
              </div>
              <Switch
                aria-label={`${provider.name} ${providerSettings.enabled ? t('models_page.status.enabled') : t('models_page.status.disabled')}`}
                checked={providerSettings.enabled}
                className="shrink-0 data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
                onCheckedChange={() => onToggleProvider(provider.id)}
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
