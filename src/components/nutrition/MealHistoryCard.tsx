import { Check, Clock, Cookie, Plus, UtensilsCrossed, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatNumber } from '@/lib/utils';
import type { MealCategory, MealEntry, MealStatus } from '@/types';

export interface MealHistoryCardProps {
  petName?: string;
  meals: MealEntry[];
  loading?: boolean;
  onLogFood: () => void;
  className?: string;
}

export const CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  treat: 'Treat',
};

const STATUS_ICON: Record<MealStatus, LucideIcon> = {
  logged: Check,
  planned: Clock,
  missed: X,
};

const STATUS_LABEL: Record<MealStatus, string> = {
  logged: 'Logged',
  planned: 'Planned',
  missed: 'Missed',
};

const STATUS_TONE: Record<MealStatus, string> = {
  logged: 'border-sage-200 bg-sage-50 text-sage-700',
  planned: 'border-cream-300 bg-cream-50 text-charcoal-500',
  missed: 'border-amber-200 bg-amber-50 text-amber-700',
};

/** Everything recorded for the pet today, newest time last. */
export function MealHistoryCard({
  petName,
  meals,
  loading = false,
  onLogFood,
  className,
}: MealHistoryCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Meal history"
        description={petName ? `Everything recorded for ${petName} today` : undefined}
        action={
          <button
            type="button"
            onClick={onLogFood}
            className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Log food
          </button>
        }
      />

      {loading ? (
        <ul className="space-y-3">
          {[0, 1, 2].map((key) => (
            <li key={key} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : meals.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No food logged yet today"
          description={
            petName
              ? `Nothing has been recorded for ${petName}. Log the first meal to start today's record.`
              : 'Log the first meal to start today’s record.'
          }
          actionLabel="Log food"
          onAction={onLogFood}
        />
      ) : (
        <ul className="-mx-1 divide-y divide-cream-200">
          {meals.map((meal) => {
            const StatusIcon = STATUS_ICON[meal.status];
            return (
              <li key={meal.id} className="flex gap-3 px-1 py-3 first:pt-0">
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    meal.isTreat
                      ? 'bg-cream-200 text-charcoal-600'
                      : 'bg-sage-50 text-sage-600',
                  )}
                >
                  {meal.isTreat ? (
                    <Cookie className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-charcoal-800">
                      {meal.name}
                    </p>
                    <span className="rounded-full bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-charcoal-500">
                      {CATEGORY_LABELS[meal.category]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-charcoal-500">
                    {meal.foodType} · {meal.quantity} {meal.unit} ·{' '}
                    {meal.calories === null ? (
                      <span className="italic text-charcoal-400">
                        no calorie data
                      </span>
                    ) : (
                      `${formatNumber(meal.calories)} kcal`
                    )}
                  </p>
                  {meal.notes ? (
                    <p className="mt-0.5 text-xs leading-snug text-charcoal-400">
                      {meal.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs tabular-nums text-charcoal-500">
                    {meal.time}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                      STATUS_TONE[meal.status],
                    )}
                  >
                    <StatusIcon className="h-3 w-3" aria-hidden="true" />
                    {STATUS_LABEL[meal.status]}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
