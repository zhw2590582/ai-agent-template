'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type SignOutButtonProps = {
  buttonLabel: string;
  errorLabel?: string;
  redirectTo: string;
  successLabel?: string;
};

export function SignOutButton({
  buttonLabel,
  errorLabel,
  redirectTo,
  successLabel,
}: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      if (successLabel) toast.success(successLabel);
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setIsPending(false);
      if (errorLabel) toast.error(errorLabel);
    }
  };

  return (
    <Button disabled={isPending} onClick={handleSignOut} size="lg" variant="outline">
      {isPending ? <Spinner data-icon="inline-start" /> : null}
      {buttonLabel}
    </Button>
  );
}
