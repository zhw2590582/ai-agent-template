'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';

interface ProviderDeleteDialogProps {
  isDeleting: boolean;
  onConfirm: () => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  providerName: string;
  t: (key: string, values?: Record<string, string>) => string;
}

export function ProviderDeleteDialog({
  isDeleting,
  onConfirm,
  onOpenChange,
  open,
  providerName,
  t,
}: ProviderDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('models_page.providers.delete_title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('models_page.providers.delete_description', {
              provider: providerName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            variant="destructive"
            onClick={async (event) => {
              event.preventDefault();
              await onConfirm();
            }}
          >
            {isDeleting ? <Spinner data-icon="inline-start" /> : null}
            {t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
