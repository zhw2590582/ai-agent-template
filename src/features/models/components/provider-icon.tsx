'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import { MODEL_PROVIDER_PRESETS } from '@/features/models/catalog';
import { cn } from '@/lib/utils';

interface ProviderIconProps {
  className?: string;
  docsUrl?: string | null;
  fallbackClassName?: string;
  logoId?: string | null;
  monogram?: string;
  name?: string;
  plain?: boolean;
  providerId: string;
}

export function ProviderIcon({
  className,
  docsUrl,
  fallbackClassName,
  logoId: logoIdProp,
  monogram: monogramProp,
  name,
  plain = false,
  providerId,
}: ProviderIconProps) {
  const [hasError, setHasError] = useState(false);

  const preset = useMemo(
    () => MODEL_PROVIDER_PRESETS.find((item) => item.id === providerId),
    [providerId]
  );

  const logoId = logoIdProp ?? preset?.logoId ?? providerId;
  const monogram = monogramProp ?? preset?.monogram ?? providerId.slice(0, 2).toUpperCase();
  const displayName = name ?? preset?.name ?? providerId;
  const canUseRemoteLogo = Boolean((logoIdProp || preset?.logoId) && (docsUrl !== null || preset));

  if (!canUseRemoteLogo || !logoId || hasError) {
    return (
      <span
        className={cn(
          plain
            ? 'text-foreground flex items-center justify-center text-[10px] font-semibold'
            : 'bg-muted text-foreground flex items-center justify-center rounded-md text-[10px] font-semibold',
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
        plain
          ? 'inline-flex items-center justify-center'
          : 'bg-muted inline-flex items-center justify-center rounded-md',
        fallbackClassName ?? className
      )}
    >
      <Image
        alt={`${displayName} logo`}
        className={cn('size-6 object-contain dark:invert', className)}
        height={16}
        src={`https://models.dev/logos/${logoId}.svg`}
        width={16}
        onError={() => setHasError(true)}
      />
    </span>
  );
}
