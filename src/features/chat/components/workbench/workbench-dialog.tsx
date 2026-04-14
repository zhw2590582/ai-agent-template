'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { WorkbenchView } from '@/features/chat/types';

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

interface WorkbenchDialogProps {
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  t: TranslateFn;
  view: Exclude<WorkbenchView, 'chat'>;
}

function getDialogDescriptionKey(view: Exclude<WorkbenchView, 'chat'>) {
  if (view === 'models') {
    return 'models_page.sidebar.description';
  }

  if (view === 'memory') {
    return 'memory_page.controls.description';
  }

  if (view === 'search') {
    return 'search_page.description';
  }

  return `placeholders.${view}.description`;
}

export function WorkbenchDialog({ children, onOpenChange, open, t, view }: WorkbenchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(90vh,56rem)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl"
        showCloseButton
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {t(`navigation.${view}`)}
          </DialogTitle>
          <DialogDescription>{t(getDialogDescriptionKey(view))}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
