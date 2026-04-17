'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CircleUserRoundIcon, LogInIcon, LogOutIcon } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthUser } from '@/features/auth/components/auth-user-provider';
import { OauthSignInButton } from '@/features/auth/components/oauth-sign-in-button';
import { GithubMark, GoogleMark } from '@/features/auth/components/auth-provider-icons';
import { toAuthUserSnapshot } from '@/features/auth/lib/auth-user';
import { createClient } from '@/lib/supabase/client';

type AuthDialogProps = {
  configurationMissingDescription: string;
  configurationMissingTitle: string;
  description: string;
  githubLabel: string;
  googleLabel: string;
  privacyPolicyLabel: string;
  signInLabel: string;
  signInFailedLabel?: string;
  signOutLabel: string;
  signOutFailedLabel?: string;
  signOutSuccessLabel?: string;
  signedInAsLabel: string;
  supabaseConfigured: boolean;
  termsAgreementLabel: string;
  termsOfServiceLabel: string;
  title: string;
};

export function AuthDialog({
  configurationMissingDescription,
  configurationMissingTitle,
  description,
  githubLabel,
  googleLabel,
  privacyPolicyLabel,
  signInLabel,
  signInFailedLabel,
  signOutLabel,
  signedInAsLabel,
  supabaseConfigured,
  termsAgreementLabel,
  termsOfServiceLabel,
  title,
}: AuthDialogProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useAuthUser();

  useEffect(() => {
    if (!supabaseConfigured) {
      return;
    }

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUserSnapshot(session?.user ?? null));

      if (session?.user) {
        setIsOpen(false);
      }

      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, setUser, supabaseConfigured]);

  const nextPath = pathname || '/';
  const signOutHref = `/auth/sign-out?next=${encodeURIComponent(`/${locale}`)}`;
  const displayName = user?.fullName ?? user?.email ?? 'User';
  const avatarUrl = user?.avatarUrl ?? null;
  const initials = displayName.trim().charAt(0).toUpperCase() || 'U';

  if (user) {
    return (
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={signedInAsLabel}
              className="ring-ring/50 rounded-full outline-none focus-visible:ring-3"
              type="button"
            >
              {avatarUrl ? (
                <Image
                  alt={displayName}
                  className="border-border size-8 rounded-full border object-cover"
                  height="32"
                  src={avatarUrl}
                  unoptimized
                  width="32"
                />
              ) : (
                <div className="bg-muted text-foreground border-border flex size-8 items-center justify-center rounded-full border text-xs font-semibold">
                  {initials || <CircleUserRoundIcon className="size-4" />}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-56" sideOffset={6}>
            <DropdownMenuLabel>{signedInAsLabel}</DropdownMenuLabel>
            <div className="px-2 py-1.5">
              <div className="truncate text-sm font-medium">{displayName}</div>
              <div className="text-muted-foreground truncate text-xs">{user.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild variant="destructive">
              <a href={signOutHref}>
                <LogOutIcon data-icon="inline-start" />
                {signOutLabel}
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={user ? 'secondary' : 'outline'}>
          <LogInIcon data-icon="inline-start" />
          {signInLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </DialogHeader>

        {!supabaseConfigured ? (
          <div className="border-border bg-background/60 rounded-xl border px-4 py-4 text-sm leading-7">
            <div className="font-medium">{configurationMissingTitle}</div>
            <p className="text-muted-foreground mt-2">{configurationMissingDescription}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <OauthSignInButton
                buttonLabel={googleLabel}
                errorLabel={signInFailedLabel}
                icon={<GoogleMark />}
                nextPath={nextPath}
                provider="google"
                supabaseConfigured={supabaseConfigured}
              />
              <OauthSignInButton
                buttonLabel={githubLabel}
                errorLabel={signInFailedLabel}
                icon={<GithubMark />}
                nextPath={nextPath}
                provider="github"
                supabaseConfigured={supabaseConfigured}
              />
            </div>

            <p className="text-muted-foreground text-center text-xs leading-5">
              {termsAgreementLabel}{' '}
              <Link
                className="text-primary hover:text-primary/80 underline underline-offset-4"
                href={`/${locale}/terms`}
                onClick={() => setIsOpen(false)}
              >
                {termsOfServiceLabel}
              </Link>{' '}
              and{' '}
              <Link
                className="text-primary hover:text-primary/80 underline underline-offset-4"
                href={`/${locale}/privacy`}
                onClick={() => setIsOpen(false)}
              >
                {privacyPolicyLabel}
              </Link>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
