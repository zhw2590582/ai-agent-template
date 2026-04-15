'use client';

import {
  BotIcon,
  EarIcon,
  ImageIcon,
  type LucideIcon,
  RadarIcon,
  ScaleIcon,
  ShapesIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ModelCapability } from '@/features/models/types';
import { cn } from '@/lib/utils';

const CAPABILITY_ICON_MAP: Record<
  ModelCapability,
  {
    icon: LucideIcon;
  }
> = {
  audio: { icon: EarIcon },
  chat: { icon: BotIcon },
  embedding: { icon: ShapesIcon },
  image: { icon: ImageIcon },
  moderation: { icon: ScaleIcon },
  unknown: { icon: RadarIcon },
};

interface ModelCapabilityBadgesProps {
  capabilities?: ModelCapability[];
  className?: string;
}

export function ModelCapabilityBadges({
  capabilities = [],
  className,
}: ModelCapabilityBadgesProps) {
  const t = useTranslations();

  if (capabilities.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
        {capabilities.map((capability) => {
          const Icon = CAPABILITY_ICON_MAP[capability].icon;

          return (
            <Tooltip key={capability}>
              <TooltipTrigger asChild>
                <span className="bg-muted text-muted-foreground inline-flex size-6 items-center justify-center rounded-md border">
                  <Icon className="size-3.5" />
                  <span className="sr-only">
                    {t(`models_page.models.capabilities.${capability}`)}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                {t(`models_page.models.capabilities.${capability}`)}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
