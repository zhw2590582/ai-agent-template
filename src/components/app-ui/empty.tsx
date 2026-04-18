import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function Empty({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-6 rounded-xl border border-dashed px-6 py-10 text-center',
        className
      )}
      {...props}
    />
  );
}

export function EmptyHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex max-w-sm flex-col items-center gap-3', className)} {...props} />;
}

export function EmptyMedia({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={cn(
        'bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-sm font-semibold', className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-muted-foreground text-sm leading-6', className)} {...props} />;
}

export function EmptyContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-center gap-3', className)} {...props} />;
}
