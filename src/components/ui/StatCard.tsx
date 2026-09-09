import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, clampPercent } from '@/lib/utils';
import type { MetricSummary, TrendDirection } from '@/types';

export interface StatCardProps {
  icon: LucideIcon;
  metric?: MetricSummary | null;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const TREND_ICON: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const TREND_TONE: Record<TrendDirection, string> = {
  up: 'text-sage-600',
  down: 'text-clay',
  flat: 'text-charcoal-400',
};

/** Compact metric tile used across the Overview grid. */
export function StatCard({
  icon: Icon,
  metric,
  loading = false,
  onClick,
  className,
}: StatCardProps) {
  if (loading || !metric) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-1.5 w-full" />
      </Card>
    );
  }

  const unavailable = Boolean(metric.unavailableLabel);
  const TrendIcon = TREND_ICON[metric.trend];
  const progress = clampPercent(metric.progress);
  const interactive = Boolean(onClick) && !unavailable;

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            unavailable
              ? 'bg-cream-200 text-charcoal-400'
              : 'bg-sage-50 text-sage-600',
          )}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        {!unavailable ? (
          <span
            className={cn(
              'rounded-full bg-cream-100 px-2 py-0.5 text-[11px] font-medium',
              progress >= 75 ? 'text-sage-700' : 'text-charcoal-500',
            )}
          >
            {metric.status}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-xs font-medium uppercase tracking-[0.1em] text-charcoal-400">
        {metric.label}
      </p>

      {unavailable ? (
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-charcoal-500">
          {metric.unavailableLabel}
        </p>
      ) : (
        <>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight text-charcoal-900 tabular-nums">
              {metric.value}
            </span>
            {metric.unit ? (
              <span className="truncate text-sm text-charcoal-400">
                {metric.unit}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm leading-snug text-charcoal-500">
            {metric.caption}
          </p>

          <div className="mt-auto pt-3">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-cream-200"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${metric.label} progress`}
            >
              <div
                className="h-full rounded-full bg-sage-500 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {metric.trendLabel ? (
              <span
                className={cn(
                  'mt-2 flex items-center gap-1 text-xs font-medium',
                  TREND_TONE[metric.trend],
                )}
              >
                <TrendIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{metric.trendLabel}</span>
              </span>
            ) : null}
          </div>
        </>
      )}
    </>
  );

  if (interactive) {
    return (
      <Card
        padded={false}
        className={cn(
          'transition hover:border-sage-200 hover:shadow-pop',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className="flex h-full w-full flex-col rounded-2xl p-4 text-left sm:p-5"
        >
          {body}
        </button>
      </Card>
    );
  }

  return <Card className={cn('flex flex-col', className)}>{body}</Card>;
}
