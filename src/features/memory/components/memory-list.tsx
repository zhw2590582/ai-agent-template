import { Badge } from '@/components/ui/badge';
import { EmptyMemoryState } from '@/features/memory/components/empty-memory-state';
import type { MemoryListItem } from '@/features/memory/types';

interface MemoryListProps {
  memories: MemoryListItem[];
  t: (key: string) => string;
}

export function MemoryList({ memories, t }: MemoryListProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{t('memory_page.saved_memories.title')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('memory_page.saved_memories.description')}
        </p>
      </div>

      {memories.length === 0 ? (
        <EmptyMemoryState
          description={t('memory_page.saved_memories.empty_description')}
          title={t('memory_page.saved_memories.empty_title')}
        />
      ) : (
        <div className="border-border flex flex-col border">
          {memories.map((memory) => (
            <article
              className="border-border flex flex-col gap-3 border-b px-5 py-4 last:border-b-0"
              key={memory.id}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{memory.kind}</Badge>
                  <Badge variant="outline">{memory.source}</Badge>
                </div>
                <span className="text-muted-foreground text-xs">
                  {new Date(memory.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm leading-6">{memory.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
