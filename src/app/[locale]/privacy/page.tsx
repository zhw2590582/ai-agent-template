import { getTranslations } from 'next-intl/server';

export default async function PrivacyPage() {
  const t = await getTranslations();

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">
          {t('auth.privacy_policy')}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{t('auth.privacy_policy')}</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-6">
          This page explains the basic data flow for the current AI Agent Template preview.
        </p>
      </header>

      <section className="flex flex-col gap-6 text-sm leading-7">
        <div>
          <h2 className="text-lg font-medium">What we store</h2>
          <p className="text-muted-foreground mt-2">
            If you sign in, your profile, configured providers, and conversations may be stored in
            the connected Supabase project. If you do not sign in, local conversation and model data
            stay in your browser.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-medium">Provider credentials</h2>
          <p className="text-muted-foreground mt-2">
            API keys and model configuration are used only to send requests to the providers you
            explicitly configure.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-medium">Third-party processing</h2>
          <p className="text-muted-foreground mt-2">
            Your prompts and model requests may be processed by external providers such as OpenAI,
            Anthropic, Google, or any provider you configure.
          </p>
        </div>
      </section>
    </main>
  );
}
