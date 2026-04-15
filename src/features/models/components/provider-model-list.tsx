'use client';

import { useMemo, useState, type MouseEvent } from 'react';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ModelCapabilityBadges } from '@/features/models/components/model-capability-badges';
import { Switch } from '@/components/ui/switch';
import type { ProviderModelItem } from '@/features/models/types';
import { cn } from '@/lib/utils';

const MODELS_PER_PAGE = 20;

type PaginationEntry = number | 'ellipsis-left' | 'ellipsis-right';

function buildPaginationEntries(currentPage: number, totalPages: number): PaginationEntry[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const entries: PaginationEntry[] = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    entries.push('ellipsis-left');
  }

  for (let page = startPage; page <= endPage; page += 1) {
    entries.push(page);
  }

  if (endPage < totalPages - 1) {
    entries.push('ellipsis-right');
  }

  entries.push(totalPages);
  return entries;
}

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
  const [page, setPage] = useState(1);
  const normalizedDraftModelId = draftModelId.trim().toLowerCase();
  const totalPages = Math.max(1, Math.ceil(models.length / MODELS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
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
  const paginatedModels = useMemo(() => {
    const startIndex = (currentPage - 1) * MODELS_PER_PAGE;
    return models
      .slice(startIndex, startIndex + MODELS_PER_PAGE)
      .map((model, index) => ({ index: startIndex + index, model }));
  }, [currentPage, models]);
  const paginationEntries = useMemo(
    () => buildPaginationEntries(currentPage, totalPages),
    [currentPage, totalPages]
  );
  const currentRangeStart = models.length === 0 ? 0 : (currentPage - 1) * MODELS_PER_PAGE + 1;
  const currentRangeEnd = Math.min(currentPage * MODELS_PER_PAGE, models.length);

  const updatePage = (page: number) => {
    setPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handlePaginationClick = (page: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    updatePage(page);
  };

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
      updatePage(Math.ceil((models.length + 1) / MODELS_PER_PAGE));
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
          {paginatedModels.map(({ model, index }) => (
            <div
              key={`${model.id || 'custom'}-${index}`}
              className="hover:bg-accent/10 flex items-start gap-4 px-4 py-4 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{model.name || model.id}</div>
                <div className="text-muted-foreground mt-1 truncate text-sm">{model.id}</div>
                <ModelCapabilityBadges className="mt-2" capabilities={model.capabilities} />
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

        {models.length > MODELS_PER_PAGE ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              {t('models_page.models.pagination.summary', {
                end: String(currentRangeEnd),
                start: String(currentRangeStart),
                total: String(models.length),
              })}
            </p>
            <Pagination className="mx-0 w-auto justify-start sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={currentPage === 1}
                    className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                    href="#"
                    text={t('models_page.models.pagination.previous')}
                    onClick={handlePaginationClick(currentPage - 1)}
                  />
                </PaginationItem>
                {paginationEntries.map((entry) => (
                  <PaginationItem key={entry}>
                    {typeof entry === 'number' ? (
                      <PaginationLink
                        aria-label={t('models_page.models.pagination.page', {
                          page: String(entry),
                        })}
                        href="#"
                        isActive={entry === currentPage}
                        onClick={handlePaginationClick(entry)}
                      >
                        {entry}
                      </PaginationLink>
                    ) : (
                      <PaginationEllipsis />
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    aria-disabled={currentPage === totalPages}
                    className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
                    href="#"
                    text={t('models_page.models.pagination.next')}
                    onClick={handlePaginationClick(currentPage + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
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
              variant="destructive"
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
