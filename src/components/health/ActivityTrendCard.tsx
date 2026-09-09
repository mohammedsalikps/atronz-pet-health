import { Activity, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendChart } from '@/components/ui/TrendChart';
import { cn, formatNumber } from '@/lib/utils';
import type { PetVitals, SeriesPoint, TrendDirection } from '@/types';

export interface ActivityTrendCardProps {
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

const TREND_TONE: Record<TrendDirection, string> = {
  up: 'text-sage-700 bg-sage-50',
  down: 'text-clay bg-cream-100',
  flat: 'text-charcoal-500 bg-cream-100',
};

/** Seven-day movement trend against the pet's usual daily step count. */
export function ActivityTrendCard({
  petName,
  series,
  vitals,
  loading = false,
  className,
}: ActivityTrendCardProps) {
  if (loading || !vitals) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-4 w-40" />
      </Card>
    );
  }

  const baseline = vitals.baselineSteps;
  const deltaPercent = baseline
    ? ((vitals.steps - baseline) / baseline) * 100
    : 0;
  const trend: TrendDirection =
    Math.abs(deltaPercent) < 3 ? 'flat' : deltaPercent > 0 ? 'up' : 'down';
  const TrendIcon = TREND_ICON[trend];

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Activity trend"
        description={
          petName ? `Movement over the last 7 days for ${petName}` : undefined
        }
        action={
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              TREND_TONE[trend],
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {trend === 'flat'
              ? 'Steady'
              : `${deltaPercent > 0 ? '+' : ''}${Math.round(deltaPercent)}% vs. usual`}
          </span>
        }
      />

      {series.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity history yet"
          description="Once the collar has synced for a few days, the movement trend appears here."
        />
      ) : (
        <>
          <dl className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
                Today
              </dt>
              <dd className="mt-1 whitespace-nowrap text-lg font-semibold tracking-tight tabular-nums text-charcoal-900">
                {formatNumber(vitals.steps)}
              </dd>
              <dd className="text-xs text-charcoal-400">steps</dd>
            </div>
            <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
                Usual
              </dt>
              <dd className="mt-1 whitespace-nowrap text-lg font-semibold tracking-tight tabular-nums text-charcoal-900">
                {formatNumber(baseline)}
              </dd>
              <dd className="text-xs text-charcoal-400">steps/day</dd>
            </div>
            <div className="col-span-2 rounded-xl border border-cream-200 bg-cream-50 p-3 sm:col-span-1">
              <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
                Goal
              </dt>
              <dd className="mt-1 whitespace-nowrap text-lg font-semibold tracking-tight tabular-nums text-charcoal-900">
                {formatNumber(vitals.stepGoal)}
              </dd>
              <dd className="text-xs text-charcoal-400">steps/day</dd>
            </div>
          </dl>

          <TrendChart
            points={series}
            variant="area"
            baseline={baseline}
            baselineLabel="Usual daily steps"
            formatValue={(value) => `${formatNumber(value)} steps`}
            ariaLabel={`Daily step count for the last ${series.length} days${petName ? ` for ${petName}` : ''}.`}
          />

          <p className="mt-3 flex items-center gap-2 text-xs text-charcoal-400">
            <span
              className="h-0 w-5 shrink-0 border-t-2 border-dashed border-sage-300"
              aria-hidden="true"
            />
            Dashed line marks the usual daily average of{' '}
            {formatNumber(baseline)} steps.
          </p>
        </>
      )}
    </Card>
  );
}
