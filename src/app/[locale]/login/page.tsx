import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import { isSupabaseConfigured } from '@/config/env';
import { GithubMark, GoogleMark } from '@/features/auth/components/auth-provider-icons';
import { OauthSignInButton } from '@/features/auth/components/oauth-sign-in-button';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const { error } = await searchParams;

  const supabaseEnabled = isSupabaseConfigured();
  const user = supabaseEnabled ? (await (await createClient()).auth.getUser()).data.user : null;
  const authErrorMessage = error === 'oauth_callback' ? t('auth.errors.oauth_callback') : undefined;

  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-6 py-10">
      <section className="border-border bg-card/80 w-full max-w-xl rounded-[2rem] border p-8 shadow-2xl shadow-black/20">
        <div className="text-muted-foreground text-[11px] tracking-[0.28em] uppercase">
          {t('auth.sign_in')}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{t('auth.title')}</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-7">{t('auth.description')}</p>

        {authErrorMessage ? (
          <div className="border-destructive/40 bg-destructive/10 text-destructive mt-6 rounded-xl border px-4 py-3 text-sm">
            {authErrorMessage}
          </div>
        ) : null}

        {!supabaseEnabled ? (
          <div className="border-border bg-background/60 mt-6 rounded-2xl border px-5 py-4 text-sm leading-7">
            <div className="font-medium">{t('auth.configuration_missing_title')}</div>
            <p className="text-muted-foreground mt-2">
              {t('auth.configuration_missing_description')}
            </p>
          </div>
        ) : user ? (
          <div className="border-border bg-background/60 mt-6 rounded-2xl border px-5 py-5">
            <div className="text-sm font-medium">{t('auth.signed_in_as')}</div>
            <div className="mt-3 text-base font-semibold">
              {user.user_metadata.full_name ?? user.email}
            </div>
            <div className="text-muted-foreground mt-1 text-sm">{user.email}</div>
            <p className="text-muted-foreground mt-4 text-sm leading-7">
              {t('auth.signed_in_description')}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={`/${locale}`}>{t('auth.continue_to_chat')}</Link>
              </Button>
              <SignOutButton buttonLabel={t('auth.sign_out')} redirectTo={`/${locale}/login`} />
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            <OauthSignInButton
              buttonLabel={t('auth.sign_in_with_google')}
              icon={<GoogleMark />}
              nextPath={`/${locale}`}
              provider="google"
            />
            <OauthSignInButton
              buttonLabel={t('auth.sign_in_with_github')}
              icon={<GithubMark />}
              nextPath={`/${locale}`}
              provider="github"
            />
            <p className="text-muted-foreground text-sm leading-7">{t('auth.oauth_description')}</p>
          </div>
        )}

        <div className="mt-8">
          <Button asChild variant="ghost">
            <Link href={`/${locale}`}>{t('common.back_to_chat')}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
