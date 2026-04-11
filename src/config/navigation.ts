export const HEADER_NAV_ITEMS = [
  { id: 'providers', translationKey: 'navigation.providers' },
  { id: 'agents', translationKey: 'navigation.agents' },
  { id: 'plugins', translationKey: 'navigation.plugins' },
  { id: 'tools', translationKey: 'navigation.tools' },
  { id: 'skills', translationKey: 'navigation.skills' },
  { id: 'memory', translationKey: 'navigation.memory' },
  { id: 'settings', translationKey: 'navigation.settings' },
] as const;

export type HeaderNavItemId = (typeof HEADER_NAV_ITEMS)[number]['id'];
