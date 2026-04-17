import type { AppProfileSettings } from '@/features/settings/types';

export function getOrderedProviders(settings: AppProfileSettings) {
  const providers = settings.models.providers;

  return Object.values(providers).sort((left, right) =>
    left.name.localeCompare(right.name, 'en', {
      sensitivity: 'base',
    })
  );
}
