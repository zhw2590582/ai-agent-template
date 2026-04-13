'use client';

import { PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { ProviderModelItem } from '@/features/models/types';

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-medium">{t('models_page.models.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('models_page.models.description')}</p>
        </div>
        <Button type="button" variant="ghost" onClick={onAddModel}>
          <PlusCircleIcon data-icon="inline-start" />
          {t('models_page.actions.add_model')}
        </Button>
      </div>

      <div>
        {models.map((model, index) => (
          <div
            key={`${model.id || 'custom'}-${index}`}
            className="bg-background flex items-start gap-3 border px-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <Input
                className="h-8 border-0 px-0 text-sm font-medium shadow-none focus-visible:ring-0"
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
                className="text-muted-foreground h-7 border-0 px-0 text-sm shadow-none focus-visible:ring-0"
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
            <div className="flex shrink-0 items-center gap-2">
              <Switch
                aria-label={`${model.name || model.id || 'model'} ${model.enabled ? t('models_page.status.enabled') : t('models_page.status.disabled')}`}
                checked={model.enabled}
                onCheckedChange={() =>
                  onUpdateModel(index, {
                    ...model,
                    enabled: !model.enabled,
                  })
                }
              />
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
        ))}
      </div>
    </div>
  );
}
