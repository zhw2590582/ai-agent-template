'use client';

import { useRef, useState } from 'react';
import { FileTextIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

interface RagImportSectionProps {
  apiKey: string;
  isImporting: boolean;
  onImport: (input: {
    apiKey: string;
    file: File;
    source: string;
    title: string;
    type: 'file';
  }) => Promise<boolean>;
}

export function RagImportSection({ apiKey, isImporting, onImport }: RagImportSectionProps) {
  const t = useTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImport = async () => {
    if (!file) {
      return;
    }

    const normalizedTitle = title.trim() || file.name.replace(/\.[^.]+$/, '').trim() || file.name;

    const success = await onImport({
      apiKey,
      file,
      source: source.trim(),
      title: normalizedTitle,
      type: 'file',
    });

    if (success) {
      setFile(null);
      setSource('');
      setTitle('');
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
          id="rag-document-file"
          ref={fileInputRef}
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <p className="text-muted-foreground text-xs">{t('rag_page.document_file_hint')}</p>
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
