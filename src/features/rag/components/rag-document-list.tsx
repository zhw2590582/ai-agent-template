'use client';

import { useMemo, useState } from 'react';

import { ChevronDownIcon, Trash2Icon } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Spinner } from '@/components/ui/spinner';
import type { RagDocument, RagDocumentMetadata } from '@/features/rag/types';

interface RagDocumentListProps {
  documents: RagDocument[];
  isDeletingId: string | null;
  isLoading: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete: (id: string) => Promise<boolean>;
  open?: boolean;
}

function getMetadata(document: RagDocument) {
  return (document.metadata ?? {}) as RagDocumentMetadata;
}

function formatNumber(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat().format(value);
}

export function RagDocumentList({
  documents,
  isDeletingId,
  isLoading,
  onOpenChange,
  onDelete,
  open = false,
}: RagDocumentListProps) {
  const t = useTranslations();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const deleteTarget = useMemo(
    () => documents.find((document) => document.id === deleteTargetId) ?? null,
    [deleteTargetId, documents]
  );

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) {
      return;
    }

    const success = await onDelete(deleteTargetId);
    if (success) {
      setDeleteTargetId(null);
    }
  };

  return (
    <>
      <Collapsible
        className="border-border rounded-md border"
        defaultOpen={false}
        open={open}
        onOpenChange={onOpenChange}
      >
        <CollapsibleTrigger className="group hover:bg-muted/40 flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">{t('rag_page.documents_title')}</h3>
            <p className="text-muted-foreground text-sm">{t('rag_page.documents_description')}</p>
          </div>
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t px-5 py-4">
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Spinner data-icon="inline-start" />
                {t('rag_page.documents_loading')}
              </div>
            ) : null}

            {!isLoading && documents.length === 0 ? (
              <div className="text-muted-foreground rounded-md border border-dashed px-4 py-6 text-sm">
                {t('rag_page.documents_empty')}
              </div>
            ) : null}

            {!isLoading ? (
              <div className="flex flex-col gap-3">
                {documents.map((document) => {
                  const metadata = getMetadata(document);

                  return (
                    <div
                      className="border-border flex items-start justify-between gap-4 rounded-md border px-4 py-4"
                      key={document.id}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1">
                          <h4 className="truncate text-sm font-medium">{document.title}</h4>
                          {document.source ? (
                            <p className="text-muted-foreground truncate text-xs">
                              {document.source}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs">
                          <span>
                            {t('rag_page.documents_chunks', {
                              count: formatNumber(metadata.chunkCount),
                            })}
                          </span>
                          <span>
                            {t('rag_page.documents_characters', {
                              count: formatNumber(metadata.characterCount),
                            })}
                          </span>
                        </div>
                        {metadata.excerpt ? (
                          <p className="text-muted-foreground mt-3 line-clamp-3 text-sm">
                            {metadata.excerpt}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        aria-label={t('rag_page.document_delete')}
                        disabled={isDeletingId === document.id}
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() => setDeleteTargetId(document.id)}
                      >
                        {isDeletingId === document.id ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <Trash2Icon />
                        )}
                        {t('rag_page.document_delete')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && isDeletingId == null) {
            setDeleteTargetId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('rag_page.delete_document_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('rag_page.delete_document_description', {
                title: deleteTarget?.title ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingId != null}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingId != null}
              variant="destructive"
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
            >
              {isDeletingId != null ? <Spinner data-icon="inline-start" /> : null}
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
