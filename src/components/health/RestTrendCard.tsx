import { Minus, Moon, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendChart } from '@/components/ui/TrendChart';
import { clampPercent, cn, formatDuration } from '@/lib/utils';
import type { PetVitals, SeriesPoint, TrendDirection } from '@/types';

export interface RestTrendCardProps {
  petName?: string;
  series: SeriesPoint[];
  vitals?: PetVitals | null;
  loading?: boolean;
  className?: string;
}

const TREND_ICON: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

/** Seven-day rest duration against the pet's usual nightly total. */
export function RestTrendCard({
  petName,
  series,
  vitals,
  loading = false,
  className,
}: RestTrendCardProps) {
  if (loading || !vitals) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-4 w-40" />
      </Card>
    );
  }

  const baseline = vitals.baselineRestMinutes;
  const deltaMinutes = vitals.restMinutes - baseline;
  const trend: TrendDirection =
    Math.abs(deltaMinutes) < 15 ? 'flat' : deltaMinutes > 0 ? 'up' : 'down';
  const TrendIcon = TREND_ICON[trend];
  const goalPercent = clampPercent(
    (vitals.restMinutes / vitals.restGoalMinutes) * 100,
  );

  const status =
    goalPercent >= 95
      ? 'Met the daily rest goal'
      : goalPercent >= 75
        ? 'Close to the daily rest goal'
        : 'Below the daily rest goal';

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Rest and sleep"
        description={
          petName ? `Daily rest over the last 7 days for ${petName}` : undefined
        }
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-charcoal-600">
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {trend === 'flat'
              ? 'Steady'
              : `${deltaMinutes > 0 ? '+' : '-'}${formatDuration(Math.abs(deltaMinutes))} vs. usual`}
          </span>
        }
      />

      {series.length === 0 ? (
        <EmptyState
          icon={Moon}
          title="No rest history yet"
          description="Rest is recorded once the collar has been worn overnight."
        />
      ) : (
        <>
          <dl className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
                Today
              </dt>
              <dd className="mt-1 whitespace-nowrap text-lg font-semibold tracking-tight tabular-nums text-charcoal-900">
                {formatDuration(vitals.restMinutes)}
              </dd>
              <dd className="text-xs text-charcoal-400">of rest</dd>
            </div>
            <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
                Usual
              </dt>
              <dd className="mt-1 whitespace-nowrap text-lg font-semibold tracking-tight tabular-nums text-charcoal-900">
                {formatDuration(baseline)}
              </dd>
              <dd className="text-xs text-charcoal-400">per day</dd>
            </div>
            <div className="col-span-2 rounded-xl border border-cream-200 bg-cream-50 p-3 sm:col-span-1">
              <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
                Goal
              </dt>
              <dd className="mt-1 whitespace-nowrap text-lg font-semibold tracking-tight tabular-nums text-charcoal-900">
                {formatDuration(vitals.restGoalMinutes)}
              </dd>
              <dd className="text-xs text-charcoal-400">per day</dd>
            </div>
          </dl>

          <TrendChart
            points={series}
            variant="bar"
            baseline={baseline}
            baselineLabel="Usual daily rest"
            formatValue={(value) => formatDuration(value)}
            ariaLabel={`Daily rest in hours and minutes for the last ${series.length} days${petName ? ` for ${petName}` : ''}.`}
          />

          <p className="mt-3 text-xs leading-relaxed text-charcoal-400">
            {status} ({Math.round(goalPercent)}% of goal). Rest patterns are a
            wellness signal, not a medical measurement.
          </p>
        </>
      )}
    </Card>
  );
}
