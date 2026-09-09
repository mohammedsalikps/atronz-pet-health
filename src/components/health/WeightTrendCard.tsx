import { Minus, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { WeightTrend } from '@/lib/trends';
import type { TrendDirection } from '@/types';

export interface WeightTrendCardProps {
  petName?: string;
  weight?: WeightTrend | null;
  loading?: boolean;
  className?: string;
}

const TREND_ICON: Record<TrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

/**
 * Weight readings over time. Shown as a comparison rather than a judgement —
 * no dietary or treatment guidance is given here.
 */
export function WeightTrendCard({
  petName,
  weight,
  loading = false,
  className,
}: WeightTrendCardProps) {
  if (loading || !weight) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </Card>
    );
  }

  const hasHistory = weight.previous !== null && weight.entries.length > 1;
  const TrendIcon = TREND_ICON[weight.trend];
  const maxWeight = Math.max(...weight.entries.map((e) => e.weightKg));
  const minWeight = Math.min(...weight.entries.map((e) => e.weightKg));
  const span = maxWeight - minWeight || 1;

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Weight"
        description={petName ? `Recorded weigh-ins for ${petName}` : undefined}
        action={
          hasHistory ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-charcoal-600">
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {weight.changeKg === 0 || weight.trend === 'flat'
                ? 'Stable'
                : `${weight.changeKg! > 0 ? '+' : ''}${weight.changeKg!.toFixed(2)} kg`}
            </span>
          ) : undefined
        }
      />

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums text-charcoal-900">
          {weight.current}
        </span>
        <span className="text-sm text-charcoal-500">kg today</span>
      </div>

      {!hasHistory ? (
        <EmptyState
          icon={Scale}
          title="No recent weight data"
          description={
            petName
              ? `Only one reading is on file for ${petName}. Log another weigh-in to see the trend.`
              : 'Log another weigh-in to see the trend.'
          }
          className="mt-4"
        />
      ) : (
        <>
          <p className="mt-1 text-sm text-charcoal-500">
            Previous reading {weight.previous} kg ·{' '}
            {weight.changeKg === 0
              ? 'no change'
              : `${weight.changeKg! > 0 ? 'up' : 'down'} ${Math.abs(weight.changeKg!).toFixed(2)} kg (${Math.abs(weight.changePercent ?? 0).toFixed(1)}%)`}
          </p>

          <ol className="mt-4 space-y-2.5">
            {weight.entries.map((entry, index) => {
              const fill = 12 + ((entry.weightKg - minWeight) / span) * 88;
              const isCurrent = index === weight.entries.length - 1;
              return (
                <li key={entry.label} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-charcoal-500">
                    {entry.label}
                  </span>
                  <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-cream-200">
                    <span
                      className={cn(
                        'block h-full rounded-full transition-[width] duration-500 ease-out',
                        isCurrent ? 'bg-sage-600' : 'bg-sage-300',
                      )}
                      style={{ width: `${fill}%` }}
                    />
                  </span>
                  <span
                    className={cn(
                      'w-14 shrink-0 text-right text-xs tabular-nums',
                      isCurrent
                        ? 'font-semibold text-charcoal-800'
                        : 'text-charcoal-500',
                    )}
                  >
                    {entry.weightKg} kg
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 text-xs leading-relaxed text-charcoal-400">
            Weigh-ins are recorded for tracking only. Talk to your veterinarian
            before changing diet or portion sizes.
          </p>
        </>
      )}
    </Card>
  );
}
