import { Badge } from '@/components/ui/badge';
import { EmptyMemoryState } from '@/features/memory/components/empty-memory-state';
import type { ConversationSummary } from '@/features/chat/storage/types';

interface MemorySummaryListProps {
  summaries: ConversationSummary[];
  t: (key: string) => string;
}

export function MemorySummaryList({ summaries, t }: MemorySummaryListProps) {
  const items = summaries.filter((summary) => summary.summary?.trim());

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{t('memory_page.summaries.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('memory_page.summaries.description')}</p>
      </div>

      {items.length === 0 ? (
        <EmptyMemoryState
          description={t('memory_page.summaries.empty_description')}
          title={t('memory_page.summaries.empty_title')}
        />
      ) : (
        <div className="border-border flex flex-col border">
          {items.map((summary) => (
            <article
              className="border-border flex flex-col gap-3 border-b px-5 py-4 last:border-b-0"
              key={summary.id}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium">{summary.title}</h3>
                <Badge variant="secondary">
                  {new Date(summary.lastMessageAt).toLocaleDateString()}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm leading-6">{summary.summary}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
