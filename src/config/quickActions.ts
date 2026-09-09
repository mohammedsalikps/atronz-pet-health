import type { QuickAction } from '@/types';

/** Static UI configuration for the Overview quick-action grid. */
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'log-food',
    label: 'Log food',
    description: 'Record a meal and portion',
  },
  {
    id: 'view-health',
    label: 'View health',
    description: 'Vitals and full alert history',
  },
  {
    id: 'check-litter',
    label: 'Check litter',
    description: 'Tray level and visit pattern',
  },
  {
    id: 'add-pet',
    label: 'Add pet',
    description: 'Switch or register a pet',
  },
  {
    id: 'care-history',
    label: 'Care history',
    description: 'Everything recorded so far',
  },
];
