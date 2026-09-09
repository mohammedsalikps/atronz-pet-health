import { CalendarClock, Check, Clock, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { CATEGORY_LABELS } from '@/components/nutrition/MealHistoryCard';
import { cn, formatNumber } from '@/lib/utils';
import type { MealEntry } from '@/types';

export interface FeedingScheduleCardProps {
  petName?: string;
  /** Scheduled (non-treat) meals for today. */
  meals: MealEntry[];
  loading?: boolean;
  onComplete: (mealId: string) => void;
  className?: string;
}

/** The day's planned meals, with a control to mark one as served. */
export function FeedingScheduleCard({
  petName,
  meals,
  loading = false,
  onComplete,
  className,
}: FeedingScheduleCardProps) {
  const served = meals.filter((meal) => meal.status === 'logged').length;
  const pending = meals.filter((meal) => meal.status === 'planned').length;

  if (loading) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-36" />
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-16 w-full rounded-xl" />
        ))}
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Feeding schedule"
        description={
          petName ? `${served} served · ${pending} pending for ${petName}` : undefined
        }
      />

      {meals.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No feeding schedule yet"
          description="Planned meals appear here once a schedule is set for this pet."
        />
      ) : (
        <ul className="space-y-2.5">
          {meals.map((meal) => {
            const isServed = meal.status === 'logged';
            const isMissed = meal.status === 'missed';
            return (
              <li
                key={meal.id}
                className={cn(
                  'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border p-3',
                  isServed
                    ? 'border-sage-200 bg-sage-50/60'
                    : isMissed
                      ? 'border-amber-200 bg-amber-50/60'
                      : 'border-cream-300 bg-cream-50',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    isServed
                      ? 'bg-sage-100 text-sage-700'
                      : isMissed
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-white text-charcoal-500 ring-1 ring-cream-300',
                  )}
                >
                  {isServed ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : isMissed ? (
                    <X className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Clock className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-charcoal-800">
                      {meal.time} · {CATEGORY_LABELS[meal.category]}
                    </p>
                    {isMissed ? (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                        Missed
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-charcoal-500">
                    {meal.name} · {meal.quantity} {meal.unit}
                    {meal.calories !== null
                      ? ` · ${formatNumber(meal.calories)} kcal`
                      : ' · no calorie data'}
                  </p>
                </div>

                {isServed ? (
                  <span className="shrink-0 text-xs font-medium text-sage-700">
                    Served
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onComplete(meal.id)}
                    className="shrink-0 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50 hover:text-sage-700"
                  >
                    Mark as served
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
