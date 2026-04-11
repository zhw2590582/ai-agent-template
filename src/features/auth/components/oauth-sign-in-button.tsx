'use client';

import { useState, type ReactNode } from 'react';
import type { Provider } from '@supabase/supabase-js';

import { Button } from '@/components/ui/button';
import { createClient, isSupabaseBrowserConfigured } from '@/lib/supabase/client';

type OauthSignInButtonProps = {
  buttonLabel: string;
  icon: ReactNode;
  nextPath: string;
  provider: Provider;
  variant?: 'default' | 'outline';
};

export function OauthSignInButton({
  buttonLabel,
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
      throw error;
    }
  };

  return (
    <Button
      className="w-full justify-start gap-3"
      disabled={isPending}
      onClick={handleSignIn}
      size="lg"
      variant={variant}
    >
      {icon}
      {isPending ? `${buttonLabel}...` : buttonLabel}
    </Button>
  );
}
