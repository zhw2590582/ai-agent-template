'use client';

import type { UIMessage } from 'ai';
import { useTranslations } from 'next-intl';

import type { RagSourceItem } from '@/features/rag/types';

function getRagSources(message: UIMessage) {
  const metadata = (message.metadata ?? null) as { ragSources?: RagSourceItem[] } | null;
  return Array.isArray(metadata?.ragSources) ? metadata.ragSources : [];
}

interface ChatRagSourcesProps {
  message: UIMessage;
}

export function ChatRagSources({ message }: ChatRagSourcesProps) {
  const t = useTranslations();
  const sources = getRagSources(message);

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
        {t('chat.rag_sources.title')}
      </div>
      <div className="grid gap-3">
        {sources.map((source, index) => (
          <div className="border-border rounded-md border px-4 py-3" key={source.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">{source.documentTitle}</div>
                {source.source ? (
                  <div className="text-muted-foreground truncate text-xs">{source.source}</div>
                ) : null}
              </div>
              <div className="text-muted-foreground shrink-0 text-xs">
                {t('chat.rag_sources.reference', { index: index + 1 })}
              </div>
            </div>
            <p className="text-muted-foreground mt-3 line-clamp-3 text-sm">{source.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
