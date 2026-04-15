'use client';

import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import type { RagSettings } from '@/features/rag/types';

interface RagKnowledgeSectionProps {
  settings: RagSettings;
  onUpdateSettings: (updater: (settings: RagSettings) => RagSettings) => void;
}

export function RagKnowledgeSection({ settings, onUpdateSettings }: RagKnowledgeSectionProps) {
  const t = useTranslations();

  return (
    <section className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t('rag_page.knowledge_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('rag_page.knowledge_description')}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="rag-knowledge-base-id">
          {t('rag_page.knowledge_base_id_label')}
        </label>
        <Input
          id="rag-knowledge-base-id"
          placeholder={t('rag_page.knowledge_base_id_placeholder')}
          value={settings.knowledgeBaseId ?? ''}
          onChange={(event) => {
            const value = event.target.value.trim();
            onUpdateSettings((current) => ({
              ...current,
              knowledgeBaseId: value.length > 0 ? value : null,
            }));
          }}
        />
        <p className="text-muted-foreground text-xs">
          {t('rag_page.knowledge_base_id_hint')}
        </p>
      </div>
    </section>
  );
}
