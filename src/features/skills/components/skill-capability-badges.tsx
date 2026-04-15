'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import type { SkillCapability } from '@/features/skills/types';
import { cn } from '@/lib/utils';

interface SkillCapabilityBadgesProps {
  capabilities: SkillCapability[];
  className?: string;
}

export function SkillCapabilityBadges({ capabilities, className }: SkillCapabilityBadgesProps) {
  const t = useTranslations();

  if (capabilities.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {capabilities.map((capability) => (
        <Badge key={capability} variant="outline">
          {t(`skills_page.capabilities.${capability}`)}
        </Badge>
      ))}
    </div>
  );
}
