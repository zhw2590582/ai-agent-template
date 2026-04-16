'use client';

import { DismissableLayerBranch } from '@radix-ui/react-dismissable-layer';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps) {
  return (
    <DismissableLayerBranch className="pointer-events-auto">
      <Sonner closeButton {...props} />
    </DismissableLayerBranch>
  );
}
