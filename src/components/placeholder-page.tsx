import Link from 'next/link';

import { Button } from '@/components/ui/button';

type PlaceholderPageProps = {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-6">
      <section className="border-border bg-card/80 w-full max-w-md rounded-[2rem] border p-8 shadow-2xl shadow-black/20">
        <div className="text-muted-foreground text-[11px] tracking-[0.28em] uppercase">
          {eyebrow}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">{description}</p>
        <div className="mt-8">
          <Button asChild>
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
