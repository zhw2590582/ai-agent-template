'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

type SignOutButtonProps = {
  buttonLabel: string;
  redirectTo: string;
};

export function SignOutButton({ buttonLabel, redirectTo }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <Button disabled={isPending} onClick={handleSignOut} size="lg" variant="outline">
      {isPending ? `${buttonLabel}...` : buttonLabel}
    </Button>
  );
}
