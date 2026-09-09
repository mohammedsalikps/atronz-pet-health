import { Check, Droplet, Minus, Scale, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendChart } from '@/components/ui/TrendChart';
import { USAGE_TYPE_LABELS, formatSeconds } from '@/lib/litter';
import { cn } from '@/lib/utils';
import type { LitterEvent, LitterSummary, SeriesPoint } from '@/types';

export interface LitterHistoryCardProps {
  petName?: string;
  events: LitterEvent[];
  series: SeriesPoint[];
  summary?: LitterSummary | null;
  loading?: boolean;
  className?: string;
}

/**
 * Seven-day visit counts plus every visit recorded today.
 * "Within usual pattern" compares each visit's duration to the pet's baseline.
 */
export function LitterHistoryCard({
  petName,
  events,
  series,
  summary,
  loading = false,
  className,
}: LitterHistoryCardProps) {
  if (loading || !summary) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </Card>
    );
  }

  const baselineDuration = summary.baselineDurationSeconds;
  const withinPattern = (event: LitterEvent) =>
    baselineDuration === null
      ? true
      : Math.abs(event.durationSeconds - baselineDuration) /
          baselineDuration <=
        0.5;

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Usage history"
        description={
          petName ? `Tray visits over the last 7 days for ${petName}` : undefined
        }
      />

      {series.length > 0 ? (
        <>
          <TrendChart
            points={series}
            variant="bar"
            baseline={summary.baselineVisits}
            baselineLabel="Usual daily visits"
            formatValue={(value) =>
              `${value} visit${value === 1 ? '' : 's'}`
            }
            ariaLabel={`Daily litter box visits for the last ${series.length} days${petName ? ` for ${petName}` : ''}.`}
          />
          <p className="mt-3 flex items-center gap-2 text-xs text-charcoal-400">
            <span
              className="h-0 w-5 shrink-0 border-t-2 border-dashed border-sage-400"
              aria-hidden="true"
            />
            Dashed line marks the usual {summary.baselineVisits} visits per day.
          </p>
        </>
      ) : null}

      <h3 className="mb-2 mt-5 text-sm font-semibold text-charcoal-800">
        Today’s visits
      </h3>

      {events.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No visits recorded today"
          description="Tray visits appear here as the smart litter box reports them."
        />
      ) : (
        <ul className="-mx-1 divide-y divide-cream-200">
          {events.map((event, index) => {
            const normal = withinPattern(event);
            return (
              <li key={event.id} className="flex gap-3 px-1 py-3 first:pt-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-200 text-charcoal-600">
                  <Droplet className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-charcoal-800">
                      Visit {index + 1} · {event.time}
                    </p>
                    <span className="rounded-full bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-charcoal-500">
                      {USAGE_TYPE_LABELS[event.usageType]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-charcoal-500">
                    {formatSeconds(event.durationSeconds)}
                    {event.depositGrams !== null
                      ? ` · ${event.depositGrams} g recorded`
                      : ' · no weight recorded'}
                  </p>
                </div>

                <span
                  className={cn(
                    'inline-flex h-fit shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                    normal
                      ? 'border-sage-200 bg-sage-50 text-sage-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700',
                  )}
                >
                  {normal ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Minus className="h-3 w-3" aria-hidden="true" />
                  )}
                  {normal ? 'Usual' : 'Longer'}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {summary.totalDepositGrams !== null ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-charcoal-400">
          <Scale className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {summary.totalDepositGrams} g recorded by the tray scale today.
        </p>
      ) : null}
    </Card>
  );
}
