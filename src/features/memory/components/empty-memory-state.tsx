interface EmptyMemoryStateProps {
  description: string;
  title: string;
}

export function EmptyMemoryState({ description, title }: EmptyMemoryStateProps) {
  return (
    <div className="border-border bg-card text-card-foreground flex min-h-32 items-center justify-center border px-6 py-8 text-center">
      <div className="flex max-w-md flex-col gap-2">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm leading-6">{description}</p>
      </div>
    </div>
  );
}
