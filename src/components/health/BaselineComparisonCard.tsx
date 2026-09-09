import { Minus, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { BAND_LABELS } from '@/lib/trends';
import { cn, possessive } from '@/lib/utils';
import type { BaselineBand, BaselineRow, TrendDirection } from '@/types';

export interface BaselineComparisonCardProps {
  petName?: string;
  rows: BaselineRow[];
  loading?: boolean;
  className?: string;
}

const BAND_TONE: Record<BaselineBand, string> = {
  within: 'bg-sage-50 text-sage-700 border-sage-200',
  'slightly-below': 'bg-amber-50 text-amber-700 border-amber-200',
  'slightly-above': 'bg-amber-50 text-amber-700 border-amber-200',
  outside: 'bg-red-50 text-red-700 border-red-200',
};

const TREND_ICON: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

/**
 * Today's readings next to the pet's own usual values.
 * Wording stays observational — no diagnosis, no alarm.
 */
export function BaselineComparisonCard({
  petName,
  rows,
  loading = false,
  className,
}: BaselineComparisonCardProps) {
  if (loading) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-40" />
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-14 w-full rounded-xl" />
        ))}
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Baseline comparison"
        description={
          petName
            ? `Today's readings against ${possessive(petName)} own usual values`
            : undefined
        }
      />

      {rows.length === 0 ? (
        <p className="text-sm text-charcoal-500">
          No readings available to compare yet.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => {
            const TrendIcon = TREND_ICON[row.trend];
            const notTracked = row.current === '—';
            const noBaseline = Boolean(row.noBaseline);
            return (
              <li
                key={row.id}
                className="rounded-xl border border-cream-200 bg-cream-50 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal-800">
                      {row.label}
                    </p>
                    <p className="mt-0.5 text-sm text-charcoal-500">
                      <span className="font-medium text-charcoal-700">
                        {row.current}
                      </span>{' '}
                      · {row.baseline}
                    </p>
                  </div>

                  {notTracked || noBaseline ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-2.5 py-1 text-xs font-medium text-charcoal-500">
                      <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                      {notTracked ? 'Not tracked' : 'Not enough history'}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                        BAND_TONE[row.band],
                      )}
                    >
                      <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {BAND_LABELS[row.band]}
                      <span className="tabular-nums">
                        {row.deltaPercent > 0 ? '+' : ''}
                        {Math.round(row.deltaPercent)}%
                      </span>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs leading-relaxed text-charcoal-400">
        Comparisons use each pet's own recent history as the reference. A
        reading outside the usual baseline is worth monitoring — it is not a
        diagnosis. Contact your veterinarian if a change continues.
      </p>
    </Card>
  );
}
