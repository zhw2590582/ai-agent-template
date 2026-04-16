import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { useState } from 'react';
import { EmptyMemoryState } from '@/features/memory/components/empty-memory-state';
import { SummaryEditorDialog } from '@/features/memory/components/summary-editor-dialog';
import type { ConversationSummary } from '@/features/chat/storage/types';

interface MemorySummaryListProps {
  locale: string;
  onDeleteSummary?: (conversationId: string) => Promise<boolean> | void;
  onEditSummary?: (input: { conversationId: string; summary: string }) => Promise<boolean> | void;
  pendingDeleteId?: string | null;
  pendingEditId?: string | null;
  summaries: ConversationSummary[];
  t: (key: string) => string;
}

export function MemorySummaryList({
  locale,
  onDeleteSummary,
  onEditSummary,
  pendingDeleteId,
  pendingEditId,
  summaries,
  t,
}: MemorySummaryListProps) {
  const items = summaries.filter((summary) => summary.summary?.trim());
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const editingSummary = items.find((summary) => summary.id === editingSummaryId) ?? null;
  const deleteTarget = items.find((summary) => summary.id === deleteTargetId) ?? null;
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
            {items.length === 0 ? (
              <EmptyMemoryState
                description={t('memory_page.summaries.empty_description')}
                title={t('memory_page.summaries.empty_title')}
              />
            ) : (
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
