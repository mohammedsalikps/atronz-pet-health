import { useNavigate } from 'react-router-dom';
import {
  Activity,
  History,
  PawPrint,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { QUICK_ACTIONS } from '@/config/quickActions';
import { cn } from '@/lib/utils';
import type { QuickActionId } from '@/types';

export interface QuickActionsCardProps {
  /** Opens the pet switcher / add-pet dialog. */
  onAddPet: () => void;
  /** Opens the full care-history dialog. */
  onCareHistory: () => void;
  className?: string;
}

const ACTION_ICON: Record<QuickActionId, LucideIcon> = {
  'log-food': UtensilsCrossed,
  'view-health': Activity,
  'check-litter': Sparkles,
  'add-pet': PawPrint,
  'care-history': History,
};

/** Five shortcuts, each wired to a real destination or dialog. */
export function QuickActionsCard({
  onAddPet,
  onCareHistory,
  className,
}: QuickActionsCardProps) {
  const navigate = useNavigate();

  const handleAction = (id: QuickActionId) => {
    switch (id) {
      case 'log-food':
        navigate('/nutrition');
        return;
      case 'view-health':
        navigate('/health');
        return;
      case 'check-litter':
        navigate('/litter');
        return;
      case 'add-pet':
        onAddPet();
        return;
      case 'care-history':
        onCareHistory();
        return;
    }
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Quick actions"
        description="Common tasks, one tap away"
      />

      <div className="grid grid-cols-2 gap-2.5">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = ACTION_ICON[action.id];
          const isLastOdd =
            index === QUICK_ACTIONS.length - 1 && QUICK_ACTIONS.length % 2 === 1;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleAction(action.id)}
              className={cn(
                'flex flex-col items-start gap-2 rounded-xl border border-cream-300 bg-cream-50 p-3 text-left transition hover:border-sage-200 hover:bg-sage-50',
                isLastOdd && 'col-span-2',
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sage-600 ring-1 ring-cream-300">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-charcoal-800">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-charcoal-500">
                  {action.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
