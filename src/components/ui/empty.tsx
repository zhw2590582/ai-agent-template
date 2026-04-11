'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const emptyMediaVariants = cva(
  'flex items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'size-16',
        icon: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-4 rounded-2xl', className)} {...props} />;
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-border bg-background flex flex-col items-start gap-3 rounded-2xl border p-4',
        className
      )}
      {...props}
    />
  );
}

function EmptyMedia({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return <div className={cn(emptyMediaVariants({ variant, className }))} {...props} />;
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-sm font-medium', className)} {...props} />;
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-muted-foreground text-sm leading-6', className)} {...props} />;
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-2', className)} {...props} />;
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle };
