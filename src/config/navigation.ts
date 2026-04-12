export const HEADER_NAV_ITEMS = [
  { id: 'models', translationKey: 'navigation.models' },
  { id: 'agents', translationKey: 'navigation.agents' },
  { id: 'sandbox', translationKey: 'navigation.sandbox' },
  { id: 'mcp', translationKey: 'navigation.mcp' },
  { id: 'skills', translationKey: 'navigation.skills' },
  { id: 'memory', translationKey: 'navigation.memory' },
  { id: 'search', translationKey: 'navigation.search' },
] as const;

export type HeaderNavItemId = (typeof HEADER_NAV_ITEMS)[number]['id'];
