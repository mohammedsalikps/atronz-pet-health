import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Minus, TrendingDown, TrendingUp, UtensilsCrossed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { clampPercent, cn, formatNumber } from '@/lib/utils';
import type { MetricSummary, NutritionSummary, TrendDirection } from '@/types';

export interface NutritionHealthCardProps {
  petName?: string;
  nutrition?: NutritionSummary | null;
  metric?: MetricSummary | null;
  loading?: boolean;
  className?: string;
}

const TREND_ICON: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

/** Calorie target, intake and meal completion for the selected pet. */
export function NutritionHealthCard({
  petName,
  nutrition,
  metric,
  loading = false,
  className,
}: NutritionHealthCardProps) {
  const navigate = useNavigate();

  if (loading || !nutrition || !metric) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </Card>
    );
  }

  const percent = clampPercent(nutrition.percent);
  const pending = nutrition.mealsPending + nutrition.mealsMissed;
  const TrendIcon = TREND_ICON[metric.trend];

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Nutrition"
        description={petName ? `Today's intake for ${petName}` : undefined}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-charcoal-600">
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {metric.status}
          </span>
        }
      />

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums text-charcoal-900">
          {Math.round(percent)}%
        </span>
        <span className="text-sm text-charcoal-500">of the daily target</span>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream-200"
        role="progressbar"
        aria-label="Calories against daily target"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-sage-500 transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-charcoal-500">
        {formatNumber(nutrition.consumedKcal)} of{' '}
        {formatNumber(nutrition.targetKcal)} kcal logged today
      </p>

      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
          Meals
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {Array.from({ length: nutrition.mealsPlanned }).map((_, index) => {
            const logged = index < nutrition.mealsLogged;
            return (
              <li
                key={index}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  logged
                    ? 'border-sage-200 bg-sage-50 text-sage-700'
                    : 'border-dashed border-cream-300 bg-cream-50 text-charcoal-500',
                )}
              >
                {logged ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                Meal {index + 1}
                <span className="sr-only">
                  {logged ? ' logged' : ' not logged yet'}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-sm text-charcoal-500">
          {pending === 0
            ? 'All meals logged for today.'
            : `${pending} meal${pending === 1 ? '' : 's'} still to log.`}
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate('/nutrition')}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50 hover:text-charcoal-900"
      >
        <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
        View nutrition
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </Card>
  );
}
