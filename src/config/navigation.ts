import {
  Activity,
  Bone,
  LayoutDashboard,
  PawPrint,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  /** Short label used by the mobile bottom bar, where space is tight. */
  shortLabel: string;
  to: string;
  icon: LucideIcon;
}

/**
 * Single source of truth for primary navigation.
 * The sidebar, the mobile bottom bar and the router all read from this list.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Overview',
    to: '/overview',
    icon: LayoutDashboard,
  },
  {
    id: 'health',
    label: 'Health',
    shortLabel: 'Health',
    to: '/health',
    icon: Activity,
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    shortLabel: 'Food',
    to: '/nutrition',
    icon: Bone,
  },
  {
    id: 'litter',
    label: 'Litter',
    shortLabel: 'Litter',
    to: '/litter',
    icon: Sparkles,
  },
  {
    id: 'pets',
    label: 'My Pets',
    shortLabel: 'Pets',
    to: '/pets',
    icon: PawPrint,
  },
];

export const SOCIAL_ROUTE = '/social';
