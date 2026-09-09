import { formatDuration, formatNumber } from '@/lib/utils';
import type {
  BaselineBand,
  BaselineRow,
  Pet,
  PetHistory,
  DerivedVitals,
  SeriesPoint,
  TrendDirection,
  WeightEntry,
} from '@/types';

/**
 * Chart series and baseline comparisons, derived from raw telemetry.
 *
 * The final point of every series is today's live value, so the charts move as
 * soon as a demo simulation changes the pet's vitals.
 */

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

/** Labels for the trailing `count` days, oldest first, ending at "Today". */
export function dayLabels(count: number, now: Date = new Date()): string[] {
  const labels: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    if (i === 0) {
      labels.push('Today');
    } else {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      labels.push(WEEKDAY.format(day));
    }
  }
  return labels;
}

function toSeries(history: number[], current: number): SeriesPoint[] {
  const values = [...history, current];
  const labels = dayLabels(values.length);
  return values.map((value, index) => ({
    label: labels[index] ?? '',
    value,
    isCurrent: index === values.length - 1,
  }));
}

export function buildActivitySeries(
  vitals: DerivedVitals,
  history: PetHistory | null,
): SeriesPoint[] {
  if (!history || history.steps.length === 0) return [];
  return toSeries(history.steps, vitals.steps);
}

export function buildRestSeries(
  vitals: DerivedVitals,
  history: PetHistory | null,
): SeriesPoint[] {
  if (!history || history.restMinutes.length === 0) return [];
  return toSeries(history.restMinutes, vitals.restMinutes);
}

export interface WeightTrend {
  entries: WeightEntry[];
  current: number;
  previous: number | null;
  changeKg: number | null;
  changePercent: number | null;
  trend: TrendDirection;
}

export function buildWeightTrend(
  pet: Pet,
  history: PetHistory | null,
): WeightTrend {
  const past = history?.weights ?? [];
  const entries: WeightEntry[] = [
    ...past,
    { label: 'Today', weightKg: pet.weightKg },
  ];
  const previous = past.length > 0 ? past[past.length - 1].weightKg : null;
  const changeKg =
    previous === null ? null : Number((pet.weightKg - previous).toFixed(2));
  const changePercent =
    previous === null || previous === 0
      ? null
      : ((pet.weightKg - previous) / previous) * 100;

  return {
    entries,
    current: pet.weightKg,
    previous,
    changeKg,
    changePercent,
    trend:
      changeKg === null || Math.abs(changeKg) < 0.05
        ? 'flat'
        : changeKg > 0
          ? 'up'
          : 'down',
  };
}

/** Deviation thresholds, in percent, for the baseline bands. */
const WITHIN_RANGE = 10;
const SLIGHT_RANGE = 25;

export function bandFor(deltaPercent: number): BaselineBand {
  const magnitude = Math.abs(deltaPercent);
  if (magnitude <= WITHIN_RANGE) return 'within';
  if (magnitude > SLIGHT_RANGE) return 'outside';
  return deltaPercent < 0 ? 'slightly-below' : 'slightly-above';
}

export const BAND_LABELS: Record<BaselineBand, string> = {
  within: 'Within usual range',
  'slightly-below': 'Slightly below usual range',
  'slightly-above': 'Slightly above usual range',
  outside: 'Outside usual baseline',
};

function row(
  id: string,
  label: string,
  current: string,
  baseline: string,
  currentValue: number,
  baselineValue: number,
): BaselineRow {
  const noBaseline = baselineValue === 0;
  const deltaPercent = noBaseline
    ? 0
    : ((currentValue - baselineValue) / baselineValue) * 100;
  return {
    id,
    label,
    current,
    baseline: noBaseline ? 'no history yet' : baseline,
    noBaseline,
    deltaPercent,
    band: bandFor(deltaPercent),
    trend:
      Math.abs(deltaPercent) <= 3 ? 'flat' : deltaPercent > 0 ? 'up' : 'down',
  };
}

/** Compares today's readings with the pet's own usual values. */
export function buildBaselineComparison(
  pet: Pet,
  vitals: DerivedVitals,
): BaselineRow[] {
  const rows: BaselineRow[] = [
    row(
      'activity',
      'Activity',
      `${formatNumber(vitals.steps)} steps`,
      `usually ${formatNumber(vitals.baselineSteps)}`,
      vitals.steps,
      vitals.baselineSteps,
    ),
    row(
      'rest',
      'Rest',
      formatDuration(vitals.restMinutes),
      `usually ${formatDuration(vitals.baselineRestMinutes)}`,
      vitals.restMinutes,
      vitals.baselineRestMinutes,
    ),
    row(
      'nutrition',
      'Food intake',
      `${formatNumber(vitals.calories)} kcal`,
      `target ${formatNumber(vitals.calorieTarget)} kcal`,
      vitals.calories,
      vitals.calorieTarget,
    ),
  ];

  if (vitals.litterVisits !== null && vitals.litterBaselineVisits) {
    rows.push(
      row(
        'litter',
        'Litter activity',
        `${vitals.litterVisits} visits`,
        `usually ${vitals.litterBaselineVisits}`,
        vitals.litterVisits,
        vitals.litterBaselineVisits,
      ),
    );
  } else {
    rows.push({
      id: 'litter',
      label: 'Litter activity',
      current: '—',
      baseline: `not tracked for ${pet.name}`,
      deltaPercent: 0,
      band: 'within',
      trend: 'flat',
    });
  }

  return rows;
}
