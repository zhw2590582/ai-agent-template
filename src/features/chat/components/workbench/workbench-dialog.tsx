'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getHeaderNavItem } from '@/config/navigation';
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

  if (view === 'mcp') {
    return 'mcp_page.description';
  }

  if (view === 'search') {
    return 'search_page.description';
  }

  if (view === 'rag') {
    return 'rag_page.description';
  }

  if (view === 'sandbox') {
    return 'sandbox_page.description';
  }

  if (view === 'subagent') {
    return 'subagent_page.description';
  }

  return `placeholders.${view}.description`;
}

export function WorkbenchDialog({ children, onOpenChange, open, t, view }: WorkbenchDialogProps) {
  const Icon = getHeaderNavItem(view).icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(calc(100dvh-1rem),56rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:h-[min(90vh,56rem)] sm:max-w-6xl"
        showCloseButton
      >
        <DialogHeader className="bg-muted/50 shrink-0 border-b px-4 py-4 pr-12 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
            {Icon ? <Icon className="size-6 shrink-0" /> : null}
            <span>{t(`navigation.${view}`)}</span>
          </DialogTitle>
          <DialogDescription>{t(getDialogDescriptionKey(view))}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
