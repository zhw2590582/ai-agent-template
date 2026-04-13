'use client';

import { useMemo, useState } from 'react';
import { PencilIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draftModelName, setDraftModelName] = useState('');
  const [draftModelId, setDraftModelId] = useState('');
  const normalizedDraftModelId = draftModelId.trim().toLowerCase();
  const deleteTargetModel = deleteTargetIndex == null ? null : (models[deleteTargetIndex] ?? null);
  const hasDuplicateModelId = useMemo(
    () =>
      normalizedDraftModelId.length > 0 &&
      models.some(
        (model, index) =>
          index !== editingIndex && model.id.trim().toLowerCase() === normalizedDraftModelId
      ),
    [editingIndex, models, normalizedDraftModelId]
  );

  const openCreateDialog = () => {
    setEditingIndex(null);
    setDraftModelName('');
    setDraftModelId('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const model = models[index];
    setEditingIndex(index);
    setDraftModelName(model.name);
    setDraftModelId(model.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const modelId = draftModelId.trim();
    const modelName = draftModelName.trim() || modelId;

    if (!modelId || hasDuplicateModelId) {
      return;
    }

    if (editingIndex == null) {
      onAddModel({
        id: modelId,
        name: modelName,
      });
    } else {
      onUpdateModel(editingIndex, {
        ...models[editingIndex],
        id: modelId,
        name: modelName,
      });
    }

    setDraftModelName('');
    setDraftModelId('');
    setEditingIndex(null);
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-medium">{t('models_page.models.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('models_page.models.description')}</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingIndex(null);
                setDraftModelName('');
                setDraftModelId('');
              }
            }}
          >
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" onClick={openCreateDialog}>
                <PlusCircleIcon data-icon="inline-start" />
                {t('models_page.actions.add_model')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingIndex == null
                    ? t('models_page.actions.add_model')
                    : t('models_page.actions.edit_model')}
                </DialogTitle>
                <DialogDescription>{t('models_page.models.description')}</DialogDescription>
              </DialogHeader>
              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSubmit();
                }}
              >
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
                  {hasDuplicateModelId ? (
                    <p className="text-sm text-red-500">{t('models_page.models.duplicate_id')}</p>
                  ) : null}
                </div>
                <DialogFooter>
                  <Button disabled={!draftModelId.trim() || hasDuplicateModelId} type="submit">
                    {editingIndex == null
                      ? t('models_page.actions.add_model')
                      : t('models_page.actions.edit_model')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="divide-y overflow-hidden rounded-lg border">
          {models.map((model, index) => (
            <div
              key={`${model.id || 'custom'}-${index}`}
              className="bg-background hover:bg-accent/10 flex items-start gap-4 px-4 py-4 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{model.name || model.id}</div>
                <div className="text-muted-foreground mt-1 truncate text-sm">{model.id}</div>
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
                  <>
                    <Button
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      onClick={() => openEditDialog(index)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      onClick={() => setDeleteTargetIndex(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog
        open={deleteTargetModel != null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetIndex(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('models_page.models.delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('models_page.models.delete_description', {
                model: deleteTargetModel?.name || deleteTargetModel?.id || '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTargetIndex == null) {
                  return;
                }

                onRemoveModel(deleteTargetIndex);
                setDeleteTargetIndex(null);
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
