import { getTranslations } from 'next-intl/server';

export default async function TermsPage() {
  const t = await getTranslations();

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">
          {t('auth.terms_of_service')}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{t('auth.terms_of_service')}</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-6">
          These terms apply to the current preview of AI Agent Template and describe basic usage
          expectations for this open-source demo.
        </p>
      </header>

      <section className="flex flex-col gap-6 text-sm leading-7">
        <div>
          <h2 className="text-lg font-medium">Use of the app</h2>
          <p className="text-muted-foreground mt-2">
            This project is provided as a development template. You are responsible for the
            third-party providers, API keys, and data you connect to it.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-medium">Accounts and authentication</h2>
          <p className="text-muted-foreground mt-2">
            Social sign-in is used only to identify you and associate your saved conversations and
            model settings with your account.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-medium">Third-party services</h2>
          <p className="text-muted-foreground mt-2">
            When you configure an AI provider, your requests are sent to that provider under its own
            terms and privacy practices.
          </p>
        </div>
      </section>
    </main>
  );
}
