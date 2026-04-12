import { Skeleton } from '@/components/ui/skeleton';

export function ChatShellSkeleton() {
  return (
    <main className="bg-background text-foreground h-screen">
      <div className="flex h-full w-full overflow-hidden">
        <aside className="border-border bg-muted/30 hidden h-full w-70 border-r lg:flex lg:flex-col">
          <div className="flex items-center justify-between px-4 py-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="size-7 rounded-lg" />
          </div>
          <div className="px-3">
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
          <div className="px-3 pt-5">
            <Skeleton className="h-3 w-20 rounded-full" />
            <div className="mt-3 flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </aside>

        <section className="bg-background flex min-h-0 flex-1 flex-col">
          <div className="border-border border-b px-4 py-2">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }).map((_, index) => (
                  <Skeleton key={index} className="h-7 w-20 rounded-lg" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="size-8 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-6 px-6 py-8">
            <div className="flex justify-end">
              <Skeleton className="h-16 w-2xl max-w-[75%] rounded-[1.6rem]" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-28 w-208 max-w-[88%] rounded-[1.6rem]" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-14 w-xl max-w-[70%] rounded-[1.6rem]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
