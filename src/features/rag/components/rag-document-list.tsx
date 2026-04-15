'use client';

import { Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { RagDocument, RagDocumentMetadata } from '@/features/rag/types';

interface RagDocumentListProps {
  documents: RagDocument[];
  isDeletingId: string | null;
  isLoading: boolean;
  onDelete: (id: string) => Promise<boolean>;
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
  onDelete,
}: RagDocumentListProps) {
  const t = useTranslations();

  return (
    <section className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t('rag_page.documents_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('rag_page.documents_description')}</p>
      </div>

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
                      <p className="text-muted-foreground truncate text-xs">{document.source}</p>
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
                  size="icon"
                  type="button"
                  variant="outline"
                  onClick={() => void onDelete(document.id)}
                >
                  {isDeletingId === document.id ? <Spinner /> : <Trash2Icon className="size-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
