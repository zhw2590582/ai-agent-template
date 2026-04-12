export const HEADER_NAV_ITEMS = [
  { id: 'providers', translationKey: 'navigation.providers' },
  { id: 'agents', translationKey: 'navigation.agents' },
  { id: 'sandbox', translationKey: 'navigation.sandbox' },
  { id: 'mcp', translationKey: 'navigation.mcp' },
  { id: 'skills', translationKey: 'navigation.skills' },
  { id: 'memory', translationKey: 'navigation.memory' },
] as const;

export type HeaderNavItemId = (typeof HEADER_NAV_ITEMS)[number]['id'];
