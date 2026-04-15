import type { LucideIcon } from 'lucide-react';
import {
  BotIcon,
  BrainIcon,
  DatabaseIcon,
  FlaskConicalIcon,
  GlobeIcon,
  PlugIcon,
  ServerIcon,
  ShieldEllipsisIcon,
} from 'lucide-react';

export const HEADER_NAV_ITEMS = [
  { icon: PlugIcon, id: 'models', translationKey: 'navigation.models' },
  { icon: BotIcon, id: 'subagent', translationKey: 'navigation.subagent' },
  { icon: FlaskConicalIcon, id: 'sandbox', translationKey: 'navigation.sandbox' },
  { icon: ServerIcon, id: 'mcp', translationKey: 'navigation.mcp' },
  { icon: ShieldEllipsisIcon, id: 'skills', translationKey: 'navigation.skills' },
  { icon: DatabaseIcon, id: 'rag', translationKey: 'navigation.rag' },
  { icon: BrainIcon, id: 'memory', translationKey: 'navigation.memory' },
  { icon: GlobeIcon, id: 'search', translationKey: 'navigation.search' },
] as const;

export type HeaderNavItemId = (typeof HEADER_NAV_ITEMS)[number]['id'];

export function getHeaderNavItem(id: HeaderNavItemId): (typeof HEADER_NAV_ITEMS)[number] {
  return HEADER_NAV_ITEMS.find((item) => item.id === id) as (typeof HEADER_NAV_ITEMS)[number];
}

export type HeaderNavIcon = LucideIcon;
