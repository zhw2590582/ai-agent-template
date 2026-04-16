import type { MouseEvent } from 'react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { ChevronDownIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { CONVERSATION_SUMMARY_PAGE_SIZE } from '@/config/chat';
import { EmptyMemoryState } from '@/features/memory/components/empty-memory-state';
import { SummaryEditorDialog } from '@/features/memory/components/summary-editor-dialog';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { cn } from '@/lib/utils';

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

interface MemorySummaryListProps {
  currentPage: number;
  isLoading?: boolean;
  locale: string;
  onDeleteSummary?: (conversationId: string) => Promise<boolean> | void;
  onEditSummary?: (input: { conversationId: string; summary: string }) => Promise<boolean> | void;
  onPageChange: (page: number) => void;
  pendingDeleteId?: string | null;
  pendingEditId?: string | null;
  summaries: ConversationSummary[];
  t: (key: string, values?: Record<string, string | number>) => string;
  totalItems: number;
  totalPages: number;
}

export function MemorySummaryList({
  currentPage,
  isLoading = false,
  locale,
  onDeleteSummary,
  onEditSummary,
  onPageChange,
  pendingDeleteId,
  pendingEditId,
  summaries,
  t,
  totalItems,
  totalPages,
}: MemorySummaryListProps) {
  const items = summaries.filter((summary) => summary.summary?.trim());
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const editingSummary = items.find((summary) => summary.id === editingSummaryId) ?? null;
  const deleteTarget = items.find((summary) => summary.id === deleteTargetId) ?? null;
  const paginationEntries = useMemo(
    () => buildPaginationEntries(currentPage, totalPages),
    [currentPage, totalPages]
  );
  const currentRangeStart =
    totalItems === 0 ? 0 : (currentPage - 1) * CONVERSATION_SUMMARY_PAGE_SIZE + 1;
  const currentRangeEnd = Math.min(
    (currentPage - 1) * CONVERSATION_SUMMARY_PAGE_SIZE + items.length,
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
    if (!deleteTarget || !onDeleteSummary) {
      return;
    }

    const success = await onDeleteSummary(deleteTarget.id);
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
      <section>
        <Collapsible className="border-border rounded-md border" defaultOpen={false}>
          <CollapsibleTrigger className="group hover:bg-muted/40 flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-medium">{t('memory_page.summaries.title')}</h2>
              <p className="text-muted-foreground text-sm">
                {t('memory_page.summaries.description')}
              </p>
            </div>
            <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>

          <CollapsibleContent className="border-t px-5 py-4">
            {isLoading && items.length === 0 ? (
              <div className="text-muted-foreground flex min-h-32 items-center justify-center gap-2 text-sm">
                <Spinner data-icon="inline-start" />
                {t('common.loading')}
              </div>
            ) : items.length === 0 ? (
              <EmptyMemoryState
                description={t('memory_page.summaries.empty_description')}
                title={t('memory_page.summaries.empty_title')}
              />
            ) : (
              <div className="space-y-4">
                <div className="border-border overflow-hidden rounded-md border">
                  {items.map((summary) => (
                    <article
                      className="border-border flex flex-col gap-3 border-b px-5 py-4 last:border-b-0"
                      key={summary.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium">{summary.title}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{formatDate(summary.lastMessageAt)}</Badge>
                          {onEditSummary ? (
                            <Button
                              onClick={() => setEditingSummaryId(summary.id)}
                              size="sm"
                              variant="ghost"
                            >
                              {pendingEditId === summary.id ? (
                                <Spinner data-icon="inline-start" />
                              ) : (
                                <PencilIcon />
                              )}
                              {t('memory_page.saved_memories.edit')}
                            </Button>
                          ) : null}
                          {onDeleteSummary ? (
                            <Button
                              onClick={() => setDeleteTargetId(summary.id)}
                              size="sm"
                              variant="ghost"
                            >
                              {pendingDeleteId === summary.id ? (
                                <Spinner data-icon="inline-start" />
                              ) : (
                                <Trash2Icon />
                              )}
                              {t('memory_page.saved_memories.delete')}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-6">{summary.summary}</p>
                    </article>
                  ))}
                </div>

                {totalItems > CONVERSATION_SUMMARY_PAGE_SIZE ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-sm">
                      {t('memory_page.summaries.pagination.summary', {
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
                            text={t('memory_page.summaries.pagination.previous')}
                            onClick={handlePaginationClick(currentPage - 1)}
                          />
                        </PaginationItem>
                        {paginationEntries.map((entry) => (
                          <PaginationItem key={entry}>
                            {typeof entry === 'number' ? (
                              <PaginationLink
                                aria-label={t('memory_page.summaries.pagination.page', {
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
                            text={t('memory_page.summaries.pagination.next')}
                            onClick={handlePaginationClick(currentPage + 1)}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                ) : null}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </section>

      <SummaryEditorDialog
        key={editingSummary?.id ?? 'summary-editor'}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSummaryId(null);
          }
        }}
        onSave={onEditSummary ?? (async () => false)}
        open={editingSummary != null}
        saving={pendingEditId != null && pendingEditId === editingSummary?.id}
        summary={editingSummary}
        t={t}
      />

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
            <AlertDialogTitle>{t('memory_page.summaries.delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('memory_page.summaries.delete_description')}
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
