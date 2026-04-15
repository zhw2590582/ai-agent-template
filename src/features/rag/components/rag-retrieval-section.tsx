'use client';

import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import type { RagSettings } from '@/features/rag/types';

interface RagRetrievalSectionProps {
  settings: RagSettings;
  onUpdateSettings: (updater: (settings: RagSettings) => RagSettings) => void;
}

function parseInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseFloatValue(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function RagRetrievalSection({ settings, onUpdateSettings }: RagRetrievalSectionProps) {
  const t = useTranslations();

  return (
    <section className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t('rag_page.retrieval_title')}</h3>
        <p className="text-muted-foreground text-sm">{t('rag_page.retrieval_description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="rag-match-count">
            {t('rag_page.match_count_label')}
          </label>
          <Input
            id="rag-match-count"
            inputMode="numeric"
            type="number"
            value={String(settings.matchCount)}
            onChange={(event) => {
              const value = parseInteger(event.target.value, settings.matchCount);
              onUpdateSettings((current) => ({
                ...current,
                matchCount: value,
              }));
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="rag-match-threshold">
            {t('rag_page.match_threshold_label')}
          </label>
          <Input
            id="rag-match-threshold"
            inputMode="decimal"
            step="0.05"
            type="number"
            value={String(settings.matchThreshold)}
            onChange={(event) => {
              const value = parseFloatValue(event.target.value, settings.matchThreshold);
              onUpdateSettings((current) => ({
                ...current,
                matchThreshold: value,
              }));
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="rag-max-context-characters">
            {t('rag_page.max_context_characters_label')}
          </label>
          <Input
            id="rag-max-context-characters"
            inputMode="numeric"
            type="number"
            value={String(settings.maxContextCharacters)}
            onChange={(event) => {
              const value = parseInteger(event.target.value, settings.maxContextCharacters);
              onUpdateSettings((current) => ({
                ...current,
                maxContextCharacters: value,
              }));
            }}
          />
        </div>
      </div>
    </section>
  );
}
