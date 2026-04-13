'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { MODEL_PROVIDER_PRESETS } from '@/features/models/catalog';
import { cn } from '@/lib/utils';

interface ProviderIconProps {
  className?: string;
  fallbackClassName?: string;
  providerId: string;
}

export function ProviderIcon({ className, fallbackClassName, providerId }: ProviderIconProps) {
  const [hasError, setHasError] = useState(false);

  const preset = useMemo(
    () => MODEL_PROVIDER_PRESETS.find((item) => item.id === providerId),
    [providerId]
  );

  const logoId = preset?.logoId ?? providerId;
  const monogram = preset?.monogram ?? providerId.slice(0, 2).toUpperCase();

  if (!logoId || hasError) {
    return (
      <span
        className={cn(
          'bg-muted text-foreground flex items-center justify-center rounded-md text-[10px] font-semibold',
          fallbackClassName ?? className
        )}
      >
        {monogram}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'bg-muted inline-flex items-center justify-center rounded-md',
        fallbackClassName ?? className
      )}
    >
      <Image
        alt={`${preset?.name ?? providerId} logo`}
        className={cn('size-4 object-contain dark:invert', className)}
        height={16}
        src={`https://models.dev/logos/${logoId}.svg`}
        width={16}
        onError={() => setHasError(true)}
      />
    </span>
  );
}
