'use client';

import { PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ProviderModelItem } from '@/features/models/types';
import { cn } from '@/lib/utils';

interface ProviderModelListProps {
  models: ProviderModelItem[];
  onAddModel: () => void;
  onRemoveModel: (index: number) => void;
  onUpdateModel: (index: number, nextModel: ProviderModelItem) => void;
}

export function ProviderModelList({
  models,
  onAddModel,
  onRemoveModel,
  onUpdateModel,
}: ProviderModelListProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium">{t('models_page.models.title')}</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('models_page.models.description')}
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onAddModel}>
          <PlusCircleIcon data-icon="inline-start" />
          {t('models_page.actions.add_model')}
        </Button>
      </div>

      <ScrollArea className="max-h-[28rem] border">
        <div className="space-y-3 p-3">
          {models.map((model, index) => (
            <div
              key={`${model.id || 'custom'}-${index}`}
              className="border-border bg-background border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'mt-1 size-3 rounded-full',
                      model.enabled ? 'bg-emerald-400' : 'bg-muted-foreground/40'
                    )}
                  />
                  <div className="min-w-0">
                    <Input
                      className="h-9 border-0 px-0 text-base font-medium shadow-none focus-visible:ring-0"
                      placeholder={t('models_page.models.name_placeholder')}
                      value={model.name}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdateModel(index, {
                          ...model,
                          name: event.target.value,
                        })
                      }
                    />
                    <Input
                      className="text-muted-foreground mt-1 h-8 border-0 px-0 text-sm shadow-none focus-visible:ring-0"
                      placeholder={t('models_page.models.id_placeholder')}
                      value={model.id}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdateModel(index, {
                          ...model,
                          id: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant={model.enabled ? 'default' : 'outline'}
                    onClick={() =>
                      onUpdateModel(index, {
                        ...model,
                        enabled: !model.enabled,
                      })
                    }
                  >
                    {model.enabled
                      ? t('models_page.status.enabled')
                      : t('models_page.status.disabled')}
                  </Button>
                  {model.isCustom ? (
                    <Button
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      onClick={() => onRemoveModel(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
