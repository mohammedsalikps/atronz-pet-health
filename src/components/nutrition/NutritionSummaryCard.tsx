import { Check, Cookie, Droplets, Minus, Plus, UtensilsCrossed } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  NUTRITION_STATUS_LABELS,
  nutritionStatusTone,
} from '@/lib/nutrition';
import { clampPercent, cn, formatNumber } from '@/lib/utils';
import type { NutritionSummary } from '@/types';

export interface NutritionSummaryCardProps {
  petName?: string;
  nutrition?: NutritionSummary | null;
  loading?: boolean;
  onLogFood: () => void;
  className?: string;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The day's food at a glance: target, consumed, remaining and meal counts. */
export function NutritionSummaryCard({
  petName,
  nutrition,
  loading = false,
  onLogFood,
  className,
}: NutritionSummaryCardProps) {
  if (loading || !nutrition) {
    return (
      <Card className={cn('flex flex-col gap-5 sm:flex-row', className)}>
        <Skeleton className="h-32 w-32 shrink-0 rounded-full" />
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
      </Card>
    );
  }

  const percent = clampPercent(nutrition.percent);
  const dashOffset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  const waterPercent =
    nutrition.waterMl !== null && nutrition.waterTargetMl
      ? clampPercent((nutrition.waterMl / nutrition.waterTargetMl) * 100)
      : null;

  return (
    <Card
      tone="accent"
      className={cn(
        'flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8',
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
            stroke="#55755F"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-tight tabular-nums text-charcoal-900">
            {Math.round(percent)}%
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal-400">
            of target
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-sage-700">
            <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
            Today's food
          </span>
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs font-medium',
              nutritionStatusTone(nutrition.status),
            )}
          >
            {NUTRITION_STATUS_LABELS[nutrition.status]}
          </span>
        </div>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-charcoal-900 sm:text-2xl">
          {formatNumber(nutrition.consumedKcal)} of{' '}
          {formatNumber(nutrition.targetKcal)} kcal
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          {formatNumber(nutrition.remainingKcal)} kcal remaining
          {petName ? ` for ${petName} today` : ' today'}
          {nutrition.hasUnknownCalories
            ? ' · some items have no calorie data on file'
            : ''}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-2.5 text-left sm:grid-cols-4">
          <Stat
            icon={Check}
            label="Meals served"
            value={`${nutrition.mealsLogged}/${nutrition.mealsPlanned}`}
          />
          <Stat
            icon={Minus}
            label="Pending"
            value={String(nutrition.mealsPending)}
            tone={nutrition.mealsPending > 0 ? 'warn' : 'default'}
          />
          <Stat
            icon={Cookie}
            label="Treats"
            value={
              nutrition.treatCount === 0
                ? '0'
                : `${nutrition.treatCount}${nutrition.treatKcal ? ` · ${nutrition.treatKcal} kcal` : ''}`
            }
          />
          <Stat
            icon={Droplets}
            label="Water"
            value={
              nutrition.waterMl === null
                ? 'Not tracked'
                : `${formatNumber(nutrition.waterMl)} ml${waterPercent !== null ? ` · ${Math.round(waterPercent)}%` : ''}`
            }
          />
        </dl>

        <button
          type="button"
          onClick={onLogFood}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log food
        </button>
      </div>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: typeof Check;
  label: string;
  value: string;
  tone?: 'default' | 'warn';
}) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/70 p-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
        <Icon
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            tone === 'warn' ? 'text-amber-600' : 'text-charcoal-400',
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
