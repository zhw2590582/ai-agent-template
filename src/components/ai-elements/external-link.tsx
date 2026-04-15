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
import { cn } from '@/lib/utils';
import { ExternalLinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type ExternalLinkProps = ComponentProps<'a'>;

function shouldConfirmExternalLink(href: string): boolean {
  if (typeof window === 'undefined' || href.startsWith('#')) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function openExternalLink(href: string, target?: string) {
  window.open(href, target || '_blank', 'noopener,noreferrer');
}

export const ExternalLink = ({
  href,
  title,
  children,
  className,
  onClick,
  target,
  rel,
  ...props
}: ExternalLinkProps) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  if (!href) {
    return <span {...props}>{children}</span>;
  }

  const shouldConfirm = shouldConfirmExternalLink(href);

  return (
    <>
      <a
        className={cn(
          'text-primary hover:text-primary/80 underline decoration-current underline-offset-3',
          className
        )}
        href={href}
        onClick={(event) => {
          onClick?.(event);

          if (event.defaultPrevented || !shouldConfirm) {
            return;
          }

          event.preventDefault();
          setOpen(true);
        }}
        rel={rel ?? (shouldConfirm ? 'noreferrer' : undefined)}
        target={target}
        {...props}
      >
        {children}
      </a>

      {shouldConfirm ? (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <ExternalLinkIcon className="size-5" />
              </AlertDialogMedia>
              <AlertDialogTitle>{t('chat.external_link.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('chat.external_link.description')}
                <span className="text-foreground mt-2 block font-medium break-all">
                  {title || href}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  openExternalLink(href, target);
                }}
              >
                {t('chat.external_link.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
};
