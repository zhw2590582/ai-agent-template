'use client';

import { useState, type ComponentProps } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { BookIcon, ChevronDownIcon, ExternalLinkIcon } from 'lucide-react';

export type SourcesProps = ComponentProps<typeof Collapsible>;

export const Sources = ({ className, ...props }: SourcesProps) => (
  <Collapsible className={cn('not-prose text-primary mb-4 text-xs', className)} {...props} />
);

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export const SourcesTrigger = ({ className, count, children, ...props }: SourcesTriggerProps) => (
  <CollapsibleTrigger
    className={cn('group flex items-center justify-between gap-2', className)}
    {...props}
  >
    {children ?? <p className="font-medium">Used {count} sources</p>}
    <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
  </CollapsibleTrigger>
);

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({ className, ...props }: SourcesContentProps) => (
  <CollapsibleContent
    className={cn(
      'mt-3 flex w-fit flex-col gap-2',
      'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in outline-none',
      className
    )}
    {...props}
  />
);

export type SourceProps = ComponentProps<'a'>;

export const Source = ({ href, title, children, onClick, ...props }: SourceProps) => {
  const [open, setOpen] = useState(false);

  if (!href) {
    return (
      <span className="flex items-center gap-2">
        {children ?? (
          <>
            <BookIcon className="h-4 w-4" />
            <span className="block font-medium">{title}</span>
          </>
        )}
      </span>
    );
  }

  return (
    <>
      <a
        className="flex items-center gap-2"
        href={href}
        rel="noreferrer"
        onClick={(event) => {
          onClick?.(event);

          if (event.defaultPrevented) {
            return;
          }

          event.preventDefault();
          setOpen(true);
        }}
        {...props}
      >
        {children ?? (
          <>
            <BookIcon className="h-4 w-4" />
            <span className="block font-medium">{title}</span>
          </>
        )}
      </a>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ExternalLinkIcon className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Open external link?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to open an external website:
              <span className="text-foreground mt-2 block font-medium break-all">
                {title || href}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(href, '_blank', 'noopener,noreferrer');
              }}
            >
              Open link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
