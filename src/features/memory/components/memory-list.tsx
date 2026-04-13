import { EmptyMemoryState } from '@/features/memory/components/empty-memory-state';

interface MemoryListProps {
  t: (key: string) => string;
}

export function MemoryList({ t }: MemoryListProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{t('memory_page.saved_memories.title')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('memory_page.saved_memories.description')}
        </p>
      </div>

      <EmptyMemoryState
        description={t('memory_page.saved_memories.empty_description')}
        title={t('memory_page.saved_memories.empty_title')}
      />
    </section>
  );
}
