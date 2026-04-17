import type { MouseEvent } from 'react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { MEMORY_CONFIG } from '@/config/memory';
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
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { EmptyMemoryState } from '@/features/memory/components/empty-memory-state';
import { MemoryEditorDialog } from '@/features/memory/components/memory-editor-dialog';
import { buildPaginationEntries } from '@/features/memory/components/pagination-utils';
import type { MemoryKind, MemoryListItem } from '@/features/memory/types';
import { cn } from '@/lib/utils';

interface MemoryListProps {
  currentPage: number;
  locale: string;
  onEditMemory?: (input: {
    content: string;
    id: string;
    kind: MemoryKind;
  }) => Promise<boolean> | void;
  memories: MemoryListItem[];
  onDeleteMemory?: (memoryId: string) => Promise<boolean> | void;
  onPageChange: (page: number) => void;
  pendingEditId?: string | null;
  pendingDeleteId?: string | null;
  t: (key: string, values?: Record<string, string | number>) => string;
  totalItems: number;
  totalPages: number;
}

export function MemoryList({
  currentPage,
  locale,
  onEditMemory,
  memories,
  onDeleteMemory,
  onPageChange,
  pendingEditId,
  pendingDeleteId,
  t,
  totalItems,
  totalPages,
}: MemoryListProps) {
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const editingMemory = memories.find((memory) => memory.id === editingMemoryId) ?? null;
  const deleteTarget = memories.find((memory) => memory.id === deleteTargetId) ?? null;
  const paginationEntries = useMemo(
    () => buildPaginationEntries(currentPage, totalPages),
    [currentPage, totalPages]
  );
  const currentRangeStart =
    totalItems === 0 ? 0 : (currentPage - 1) * MEMORY_CONFIG.SAVED_MEMORIES_PAGE_SIZE + 1;
  const currentRangeEnd = Math.min(
    (currentPage - 1) * MEMORY_CONFIG.SAVED_MEMORIES_PAGE_SIZE + memories.length,
    totalItems
  );
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'numeric',
      timeZone: 'UTC',
      year: 'numeric',
    }).format(new Date(value));

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDeleteMemory) {
      return;
    }

    const success = await onDeleteMemory(deleteTarget.id);

    if (success !== false) {
      setDeleteTargetId(null);
    }
  };

  const handlePaginationClick = (nextPage: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onPageChange(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{t('memory_page.saved_memories.title')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('memory_page.saved_memories.description')}
          </p>
        </div>

        {memories.length === 0 ? (
          <EmptyMemoryState
            description={t('memory_page.saved_memories.empty_description')}
            title={t('memory_page.saved_memories.empty_title')}
          />
        ) : (
          <div className="space-y-4">
            <div className="border-border overflow-hidden rounded-md border">
              {memories.map((memory) => (
                <article
                  className="border-border flex flex-col gap-3 border-b px-5 py-4 last:border-b-0"
                  key={memory.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{memory.kind}</Badge>
                      <Badge variant="outline">{memory.source}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs">
                        {formatDate(memory.updatedAt)}
                      </span>
                      {onEditMemory ? (
                        <Button
                          onClick={() => setEditingMemoryId(memory.id)}
                          size="sm"
                          variant="ghost"
                        >
                          {pendingEditId === memory.id ? (
                            <Spinner data-icon="inline-start" />
                          ) : (
                            <PencilIcon />
                          )}
                          {t('memory_page.saved_memories.edit')}
                        </Button>
                      ) : null}
                      {onDeleteMemory ? (
                        <Button
                          onClick={() => setDeleteTargetId(memory.id)}
                          size="sm"
                          variant="ghost"
                        >
                          {pendingDeleteId === memory.id ? (
                            <Spinner data-icon="inline-start" />
                          ) : (
                            <Trash2Icon />
                          )}
                          {t('memory_page.saved_memories.delete')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm leading-6">{memory.content}</p>
                </article>
              ))}
            </div>

            {totalItems > MEMORY_CONFIG.SAVED_MEMORIES_PAGE_SIZE ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-sm">
                  {t('memory_page.saved_memories.pagination.summary', {
                    end: String(currentRangeEnd),
                    start: String(currentRangeStart),
                    total: String(totalItems),
                  })}
                </p>
                <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        aria-disabled={currentPage === 1}
                        className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                        href="#"
                        text={t('memory_page.saved_memories.pagination.previous')}
                        onClick={handlePaginationClick(currentPage - 1)}
                      />
                    </PaginationItem>
                    {paginationEntries.map((entry) => (
                      <PaginationItem key={entry}>
                        {typeof entry === 'number' ? (
                          <PaginationLink
                            aria-label={t('memory_page.saved_memories.pagination.page', {
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
                        className={cn(
                          currentPage === totalPages && 'pointer-events-none opacity-50'
                        )}
                        href="#"
                        text={t('memory_page.saved_memories.pagination.next')}
                        onClick={handlePaginationClick(currentPage + 1)}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : null}
          </div>
        )}

        <MemoryEditorDialog
          key={editingMemory?.id ?? 'memory-editor'}
          memory={editingMemory}
          onOpenChange={(open) => {
            if (!open) {
              setEditingMemoryId(null);
            }
          }}
          onSave={onEditMemory ?? (async () => false)}
          open={editingMemory != null}
          saving={pendingEditId != null && pendingEditId === editingMemory?.id}
          t={t}
        />
      </section>

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && pendingDeleteId == null) {
            setDeleteTargetId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('memory_page.saved_memories.delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('memory_page.saved_memories.delete_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingDeleteId != null}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={pendingDeleteId != null}
              variant="destructive"
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
            >
              {pendingDeleteId != null ? <Spinner data-icon="inline-start" /> : null}
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
