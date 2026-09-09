import { ArrowRight, Minus, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  clampPercent,
  cn,
  healthHeadline,
  healthStatusLabel,
  healthStatusTone,
} from '@/lib/utils';
import type { HealthScore, Pet } from '@/types';

export interface HealthScoreCardProps {
  pet?: Pet | null;
  healthScore?: HealthScore | null;
  loading?: boolean;
  onViewDetails?: () => void;
  className?: string;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Hero metric on the Overview page: the composite Atronz wellness score. */
export function HealthScoreCard({
  pet,
  healthScore,
  loading = false,
  onViewDetails,
  className,
}: HealthScoreCardProps) {
  if (loading || !pet || !healthScore) {
    return (
      <Card className={cn('flex flex-col gap-5 sm:flex-row', className)}>
        <Skeleton className="h-32 w-32 shrink-0 rounded-full" />
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Card>
    );
  }

  const pending = healthScore.status === 'pending';
  const score = clampPercent(healthScore.score);
  const dashOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const { delta, pillars } = healthScore;
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  const pillarRows = [
    { label: 'Activity', value: pillars.activity },
    { label: 'Rest', value: pillars.rest },
    { label: 'Nutrition', value: pillars.nutrition },
    ...(pillars.litter !== null
      ? [{ label: 'Litter', value: pillars.litter }]
      : []),
  ];

  return (
    <Card
      tone="accent"
      className={cn(
        'flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8',
        className,
      )}
    >
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="#E3EBE5"
            strokeWidth="10"
          />
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke={pending ? '#C6D8CB' : '#55755F'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'font-semibold tracking-tight tabular-nums',
              pending ? 'text-2xl text-charcoal-400' : 'text-4xl text-charcoal-900',
            )}
          >
            {pending ? '—' : score}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal-400">
            {pending ? 'no data' : 'of 100'}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-sage-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Wellness score
          </span>
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs font-medium',
              healthStatusTone(healthScore.status),
            )}
          >
            {healthStatusLabel(healthScore.status)}
          </span>
        </div>

        <h3 className="mt-2 text-xl font-semibold tracking-tight text-charcoal-900 sm:text-2xl">
          {healthHeadline(pet.name, healthScore.status)}
        </h3>

        <div
          className={cn(
            'mt-2 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:justify-start',
            pending ? 'hidden' : 'flex',
          )}
        >
          <span
            className={cn(
              'inline-flex items-center gap-1 font-medium',
              delta > 0
                ? 'text-sage-600'
                : delta < 0
                  ? 'text-clay'
                  : 'text-charcoal-400',
            )}
          >
            <DeltaIcon className="h-4 w-4" aria-hidden="true" />
            {delta === 0
              ? 'Unchanged'
              : `${delta > 0 ? '+' : ''}${delta} vs. yesterday`}
          </span>
          <span className="text-charcoal-400">
            Yesterday {healthScore.previous}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-charcoal-500">
          {healthScore.summary}
        </p>

        <dl className={cn('mt-4 space-y-2 text-left', pending && 'hidden')}>
          {pillarRows.map((pillar) => (
            <div key={pillar.label} className="flex items-center gap-3">
              <dt className="w-20 shrink-0 text-xs font-medium text-charcoal-500">
                {pillar.label}
              </dt>
              <dd className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/70"
                  role="progressbar"
                  aria-label={`${pillar.label} contribution`}
                  aria-valuenow={Math.round(pillar.value)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    className="block h-full rounded-full bg-sage-500 transition-[width] duration-500 ease-out"
                    style={{ width: `${clampPercent(pillar.value)}%` }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-charcoal-500">
                  {Math.round(pillar.value)}%
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          {onViewDetails ? (
            <button
              type="button"
              onClick={onViewDetails}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-700 sm:w-auto"
            >
              View health details
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-charcoal-400">
          A wellness indicator built from activity, rest and nutrition trends.
          It is not a medical diagnosis.
        </p>
      </div>
    </Card>
  );
}
