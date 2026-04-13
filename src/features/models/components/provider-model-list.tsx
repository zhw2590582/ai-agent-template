'use client';

import { useState } from 'react';
import { PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { ProviderModelItem } from '@/features/models/types';

interface ProviderModelListProps {
  models: ProviderModelItem[];
  onAddModel: (model: Pick<ProviderModelItem, 'id' | 'name'>) => void;
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [draftModelName, setDraftModelName] = useState('');
  const [draftModelId, setDraftModelId] = useState('');

  const handleAddModel = () => {
    const modelId = draftModelId.trim();
    const modelName = draftModelName.trim() || modelId;

    if (!modelId) {
      return;
    }

    onAddModel({
      id: modelId,
      name: modelName,
    });
    setDraftModelName('');
    setDraftModelId('');
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-medium">{t('models_page.models.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('models_page.models.description')}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost">
              <PlusCircleIcon data-icon="inline-start" />
              {t('models_page.actions.add_model')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('models_page.actions.add_model')}</DialogTitle>
              <DialogDescription>{t('models_page.models.description')}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  {t('models_page.models.name_placeholder')}
                </label>
                <Input
                  placeholder={t('models_page.models.name_placeholder')}
                  value={draftModelName}
                  onChange={(event) => setDraftModelName(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  {t('models_page.models.id_placeholder')}
                </label>
                <Input
                  placeholder={t('models_page.models.id_placeholder')}
                  value={draftModelId}
                  onChange={(event) => setDraftModelId(event.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button disabled={!draftModelId.trim()} type="button" onClick={handleAddModel}>
                {t('models_page.actions.add_model')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y overflow-hidden rounded-lg border">
        {models.map((model, index) => (
          <div
            key={`${model.id || 'custom'}-${index}`}
            className="bg-background hover:bg-accent/10 flex items-start gap-4 px-4 py-4 transition-colors"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <Input
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
            <div className="flex shrink-0 items-center gap-2 self-center">
              <Switch
                aria-label={`${model.name || model.id || 'model'} ${model.enabled ? t('models_page.status.enabled') : t('models_page.status.disabled')}`}
                checked={model.enabled}
                className="shrink-0 data-checked:bg-emerald-500 dark:data-checked:bg-emerald-500"
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
