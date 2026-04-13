'use client';

import { useState, type ReactNode } from 'react';
import type { Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { createClient, isSupabaseBrowserConfigured } from '@/lib/supabase/client';

type OauthSignInButtonProps = {
  buttonLabel: string;
  icon: ReactNode;
  nextPath: string;
  provider: Provider;
  variant?: 'default' | 'outline';
  errorLabel?: string;
};

export function OauthSignInButton({
  buttonLabel,
  errorLabel,
  icon,
  nextPath,
  provider,
  variant = 'outline',
}: OauthSignInButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = async () => {
    if (!isSupabaseBrowserConfigured()) {
      return;
    }

    setIsPending(true);

    const supabase = createClient();
    const localePrefix = nextPath.split('/').filter(Boolean)[0];
    const callbackPath = localePrefix ? `/${localePrefix}/auth/callback` : '/auth/callback';
    const redirectTo = new URL(callbackPath, window.location.origin);
    redirectTo.searchParams.set('next', nextPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo.toString(),
      },
    });

    if (error) {
      setIsPending(false);
      toast.error(errorLabel ?? error.message);
    }
  };

  return (
    <Button
      className="w-full justify-center gap-3"
      disabled={isPending}
      onClick={handleSignIn}
      size="lg"
      variant={variant}
    >
      {isPending ? <Spinner data-icon="inline-start" /> : icon}
      {buttonLabel}
    </Button>
  );
}
