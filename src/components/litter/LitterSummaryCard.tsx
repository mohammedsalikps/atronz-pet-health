import { Clock, Layers, Minus, Scale, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { BAND_LABELS, formatSeconds, usualRangeLabel } from '@/lib/litter';
import { cn } from '@/lib/utils';
import type { BaselineBand, LitterSummary } from '@/types';

export interface LitterSummaryCardProps {
  petName?: string;
  summary?: LitterSummary | null;
  loading?: boolean;
  onSimulateUsage: () => void;
  className?: string;
}

const BAND_TONE: Record<BaselineBand, string> = {
  within: 'bg-sage-100 text-sage-700 border-sage-200',
  'slightly-below': 'bg-amber-50 text-amber-700 border-amber-200',
  'slightly-above': 'bg-amber-50 text-amber-700 border-amber-200',
  outside: 'bg-red-50 text-red-700 border-red-200',
};

const BAND_ICON: Record<BaselineBand, LucideIcon> = {
  within: Minus,
  'slightly-below': TrendingDown,
  'slightly-above': TrendingUp,
  outside: TrendingUp,
};

/** Today's tray activity at a glance. */
export function LitterSummaryCard({
  petName,
  summary,
  loading = false,
  onSimulateUsage,
  className,
}: LitterSummaryCardProps) {
  if (loading || !summary) {
    return (
      <Card className={cn('flex flex-col gap-4', className)}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </Card>
    );
  }

  const BandIcon = BAND_ICON[summary.band];

  return (
    <Card tone="accent" className={cn('flex flex-col', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-sage-700">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Today's litter
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            BAND_TONE[summary.band],
          )}
        >
          <BandIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {BAND_LABELS[summary.band]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-3xl font-semibold tracking-tight tabular-nums text-charcoal-900">
          {summary.visitsToday}
        </span>
        <span className="text-sm text-charcoal-500">
          visit{summary.visitsToday === 1 ? '' : 's'} today
          {petName ? ` for ${petName}` : ''}
        </span>
      </div>
      <p className="mt-1 text-sm text-charcoal-500">
        Usual{' '}
        {usualRangeLabel(summary.usualRangeLow, summary.usualRangeHigh)} per day
        for {petName ?? 'this pet'}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat
          icon={Clock}
          label="Last visit"
          value={summary.lastVisitTime ?? 'No visits yet'}
        />
        <Stat
          icon={Clock}
          label="Avg. duration"
          value={
            summary.avgDurationSeconds === null
              ? 'Not recorded'
              : formatSeconds(summary.avgDurationSeconds)
          }
        />
        <Stat
          icon={Layers}
          label="Litter level"
          value={`${summary.litterLevelPercent}%`}
          warn={summary.isLowLitter}
        />
        <Stat
          icon={Scale}
          label="Recorded weight"
          value={
            summary.totalDepositGrams === null
              ? 'Not supported'
              : `${summary.totalDepositGrams} g`
          }
        />
      </dl>

      <button
        type="button"
        onClick={onSimulateUsage}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700 sm:w-auto sm:self-start"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Simulate litter usage
      </button>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  warn = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-2.5',
        warn ? 'border-amber-200 bg-amber-50' : 'border-white/70 bg-white/70',
      )}
    >
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
        <Icon
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            warn ? 'text-amber-600' : 'text-charcoal-400',
          )}
          aria-hidden="true"
        />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold tabular-nums text-charcoal-800">
        {value}
      </dd>
    </div>
  );
}
