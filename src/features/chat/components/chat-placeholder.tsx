import type { TFunction } from '@/types/i18n';
import type { HeaderNavItemId } from '@/config/navigation';

type WorkbenchView = 'chat' | HeaderNavItemId | 'settings';

interface ChatPlaceholderProps {
  activeView: WorkbenchView;
  t: TFunction;
}

export function ChatPlaceholder({ activeView, t }: ChatPlaceholderProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-8">
      <section className="border-border bg-card/70 w-full max-w-2xl rounded-[2rem] border p-8 shadow-2xl shadow-black/10">
        <div className="text-muted-foreground text-[11px] tracking-[0.28em] uppercase">
          {t(`navigation.${activeView}`)}
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          {t(`placeholders.${activeView}.title`)}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm leading-7">
          {t(`placeholders.${activeView}.description`)}
        </p>
      </section>
    </div>
  );
}
