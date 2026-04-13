'use client';

import { useTranslations } from 'next-intl';

import { Separator } from '@/components/ui/separator';
import type { ConversationSummary } from '@/features/chat/storage/types';
import { MemoryControls } from '@/features/memory/components/memory-controls';
import { MemoryList } from '@/features/memory/components/memory-list';
import { MemorySummaryList } from '@/features/memory/components/memory-summary-list';
import type { MemorySettings } from '@/features/models/types';

interface MemoryPageProps {
  isAuthenticated: boolean;
  settings: MemorySettings;
  summaries: ConversationSummary[];
}

export function MemoryPage({ isAuthenticated, settings, summaries }: MemoryPageProps) {
  const t = useTranslations();

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <MemoryControls isAuthenticated={isAuthenticated} settings={settings} t={t} />
        <Separator />
        <MemoryList t={t} />
        <Separator />
        <MemorySummaryList summaries={summaries} t={t} />
      </div>
    </div>
  );
}
