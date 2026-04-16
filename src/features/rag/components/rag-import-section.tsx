'use client';

import { useRef, useState } from 'react';
import { FileTextIcon, UploadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { RagProviderId } from '@/features/rag/types';

interface RagImportSectionProps {
  apiKey: string;
  isImporting: boolean;
  onImport: (input: {
    apiKey: string;
    file: File;
    provider: RagProviderId;
    source: string;
    title: string;
    type: 'file';
  }) => Promise<boolean>;
  provider: RagProviderId;
}

export function RagImportSection({
  apiKey,
  isImporting,
  onImport,
  provider,
}: RagImportSectionProps) {
  const t = useTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [source, setSource] = useState('');
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setSelectedFile = (nextFile: File | null) => {
    setFile(nextFile);
    setIsDragging(false);
  };

  const handleImport = async () => {
    if (!file) {
      return;
    }

    const normalizedTitle = title.trim() || file.name.replace(/\.[^.]+$/, '').trim() || file.name;

    const success = await onImport({
      apiKey,
      file,
      provider,
      source: source.trim(),
      title: normalizedTitle,
      type: 'file',
    });

    if (success) {
      setFile(null);
      setSource('');
      setTitle('');
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <section className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t('rag_page.import_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('rag_page.import_description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="rag-document-title">
            {t('rag_page.document_title_label')}
          </label>
          <Input
            id="rag-document-title"
            placeholder={t('rag_page.document_title_placeholder')}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="rag-document-source">
            {t('rag_page.document_source_label')}
          </label>
          <Input
            id="rag-document-source"
            placeholder={t('rag_page.document_source_placeholder')}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="rag-document-file">
          {t('rag_page.document_file_label')}
        </label>
        <Input
          accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
          className="sr-only"
          id="rag-document-file"
          ref={fileInputRef}
          type="file"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />
        <button
          className={cn(
            'border-border bg-muted/20 hover:bg-muted/40 flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-6 text-center transition-colors',
            isDragging && 'border-primary bg-primary/5'
          )}
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            const nextTarget = event.relatedTarget;
            if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
              return;
            }
            setIsDragging(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isDragging) {
              setIsDragging(true);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            const droppedFile = event.dataTransfer.files?.[0] ?? null;
            setSelectedFile(droppedFile);
            if (fileInputRef.current) {
              const files = event.dataTransfer.files;
              if (files?.length) {
                fileInputRef.current.files = files;
              }
            }
          }}
        >
          <div
            className={cn(
              'bg-background text-muted-foreground flex size-10 items-center justify-center rounded-full border',
              isDragging && 'text-primary border-primary'
            )}
          >
            <UploadIcon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{t('rag_page.document_file_dropzone_title')}</p>
            <p className="text-muted-foreground text-sm">
              {t('rag_page.document_file_dropzone_description')}
            </p>
          </div>
          <p className="text-muted-foreground text-xs">{t('rag_page.document_file_hint')}</p>
        </button>
        {file ? (
          <div className="bg-muted/40 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <FileTextIcon className="size-4" />
            <span className="truncate">{file.name}</span>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!apiKey.trim() || !file || isImporting}
          type="button"
          onClick={() => void handleImport()}
        >
          {isImporting ? <Spinner data-icon="inline-start" /> : null}
          {t('rag_page.import_action')}
        </Button>
      </div>
    </section>
  );
}
