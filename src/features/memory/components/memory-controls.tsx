import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { MemorySettings } from '@/features/models/types';

interface MemoryControlsProps {
  isAuthenticated: boolean;
  settings: MemorySettings;
  t: (key: string) => string;
}

export function MemoryControls({ isAuthenticated, settings, t }: MemoryControlsProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{t('memory_page.controls.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('memory_page.controls.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={settings.enabled ? 'default' : 'secondary'}>
            {settings.enabled
              ? t('memory_page.controls.enabled')
              : t('memory_page.controls.disabled')}
          </Badge>
          <Badge variant="secondary">
            {isAuthenticated
              ? t('memory_page.controls.scope_account')
              : t('memory_page.controls.scope_guest')}
          </Badge>
        </div>
      </div>

      <Alert>
        <AlertTitle>{t('memory_page.controls.notice_title')}</AlertTitle>
        <AlertDescription>
          {isAuthenticated
            ? t('memory_page.controls.notice_authenticated')
            : t('memory_page.controls.notice_guest')}
        </AlertDescription>
      </Alert>
    </section>
  );
}
