'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface WorkbenchDialogPanelProps {
  bodyClassName?: string;
  children: ReactNode;
  footer: ReactNode;
}

export function WorkbenchDialogPanel({
  bodyClassName,
  children,
  footer,
}: WorkbenchDialogPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
      <div className="bg-muted/50 flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4">
        {footer}
      </div>
    </div>
  );
}
