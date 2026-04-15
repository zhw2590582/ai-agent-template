'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

interface RagImportSectionProps {
  apiKey: string;
  isImporting: boolean;
  onImport: (input: {
    apiKey: string;
    content: string;
    source: string;
    title: string;
  }) => Promise<boolean>;
}

function buildDefaultTitle(content: string) {
  const firstLine = content
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return 'Untitled document';
  }

  return firstLine.length > 80 ? `${firstLine.slice(0, 80).trimEnd()}…` : firstLine;
}

export function RagImportSection({ apiKey, isImporting, onImport }: RagImportSectionProps) {
  const t = useTranslations();
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [title, setTitle] = useState('');

  const handleImport = async () => {
    const normalizedContent = content.trim();
    const normalizedTitle = title.trim() || buildDefaultTitle(normalizedContent);

    const success = await onImport({
      apiKey,
      content: normalizedContent,
      source: source.trim(),
      title: normalizedTitle,
    });

    if (success) {
      setContent('');
      setSource('');
      setTitle('');
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
        <label className="text-sm font-medium" htmlFor="rag-document-content">
          {t('rag_page.document_content_label')}
        </label>
        <Textarea
          className="min-h-44"
          id="rag-document-content"
          placeholder={t('rag_page.document_content_placeholder')}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <p className="text-muted-foreground text-xs">{t('rag_page.document_content_hint')}</p>
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!apiKey.trim() || !content.trim() || isImporting}
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
