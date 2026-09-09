import { pillarScores } from '@/lib/healthScore';
import { clampPercent, formatDuration, formatNumber } from '@/lib/utils';
import type {
  MetricSummary,
  Pet,
  PetMetrics,
  DerivedVitals,
  TrendDirection,
} from '@/types';

/** Turns raw vitals into the four Overview metric cards. */

const TREND_DEADBAND = 0.03;

function trendFrom(current: number, baseline: number): {
  trend: TrendDirection;
  label: string;
} {
  if (!baseline) return { trend: 'flat', label: 'No baseline yet' };
  const change = (current - baseline) / baseline;
  if (Math.abs(change) < TREND_DEADBAND) {
    return { trend: 'flat', label: 'Steady vs. yesterday' };
  }
  const pct = Math.round(Math.abs(change) * 100);
  return {
    trend: change > 0 ? 'up' : 'down',
    label: `${change > 0 ? '+' : '-'}${pct}% vs. yesterday`,
  };
}

function statusWord(progress: number): string {
  if (progress >= 95) return 'On target';
  if (progress >= 75) return 'On track';
  if (progress >= 55) return 'Below target';
  return 'Well below';
}

/**
 * A pet with nothing recorded should not be labelled "Well below" — that
 * judges data which does not exist. Fall back to a neutral status instead.
 */
function statusFor(progress: number, hasData: boolean): string {
  return hasData ? statusWord(progress) : 'No data yet';
}

export function buildMetrics(pet: Pet, vitals: DerivedVitals): PetMetrics {
  const pillars = pillarScores(vitals);

  const activityTrend = trendFrom(vitals.steps, vitals.baselineSteps);
  const restTrend = trendFrom(vitals.restMinutes, vitals.baselineRestMinutes);

  const activity: MetricSummary = {
    id: 'activity',
    label: 'Activity',
    value: formatNumber(vitals.steps),
    unit: 'steps',
    status: statusFor(pillars.activity, vitals.steps > 0),
    caption:
      vitals.steps > 0
        ? `${Math.round(pillars.activity)}% of a ${formatNumber(vitals.stepGoal)} step goal`
        : `No movement recorded yet · goal ${formatNumber(vitals.stepGoal)} steps`,
    progress: pillars.activity,
    trend: activityTrend.trend,
    trendLabel: activityTrend.label,
    to: '/health',
  };

  const rest: MetricSummary = {
    id: 'rest',
    label: 'Rest',
    value: formatDuration(vitals.restMinutes),
    status: statusFor(pillars.rest, vitals.restMinutes > 0),
    caption:
      vitals.restMinutes > 0
        ? `Goal ${formatDuration(vitals.restGoalMinutes)} of rest per day`
        : `No rest recorded yet · goal ${formatDuration(vitals.restGoalMinutes)}`,
    progress: pillars.rest,
    trend: restTrend.trend,
    trendLabel: restTrend.label,
    to: '/health',
  };

  const pending = Math.max(0, vitals.mealsPlanned - vitals.mealsLogged);

  const nutrition: MetricSummary = {
    id: 'nutrition',
    label: 'Nutrition',
    value: `${Math.round(pillars.nutrition)}%`,
    unit: 'of target',
    status: statusFor(pillars.nutrition, vitals.mealsPlanned > 0 || vitals.calories > 0),
    caption:
      vitals.mealsPlanned > 0 || vitals.calories > 0
        ? `${formatNumber(vitals.calories)} of ${formatNumber(vitals.calorieTarget)} kcal · ${vitals.mealsLogged}/${vitals.mealsPlanned} meals`
        : `No meals logged yet · target ${formatNumber(vitals.calorieTarget)} kcal`,
    progress: pillars.nutrition,
    trend:
      pillars.nutrition >= 95 ? 'up' : pillars.nutrition >= 75 ? 'flat' : 'down',
    trendLabel:
      vitals.mealsPlanned === 0
        ? ''
        : vitals.mealsLogged >= vitals.mealsPlanned
          ? 'All meals logged'
          : `${pending} meal${pending === 1 ? '' : 's'} pending`,
    to: '/nutrition',
  };

  const litterApplies = vitals.litterVisits !== null && pillars.litter !== null;

  const litter: MetricSummary = litterApplies
    ? {
        id: 'litter',
        label: 'Litter',
        value:
          pillars.litter! >= 80
            ? 'Normal'
            : pillars.litter! >= 50
              ? 'Watch'
              : 'Unusual',
        unit: 'pattern',
        status: `${vitals.litterVisits} visits today`,
        caption: `Baseline ${vitals.litterBaselineVisits}/day · tray ${vitals.litterLevelPercent}% full`,
        progress: clampPercent(pillars.litter!),
        trend:
          vitals.litterVisits! > vitals.litterBaselineVisits!
            ? 'up'
            : vitals.litterVisits! < vitals.litterBaselineVisits!
              ? 'down'
              : 'flat',
        trendLabel: `${vitals.litterVisits} vs. ${vitals.litterBaselineVisits} usual`,
        to: '/litter',
      }
    : {
        id: 'litter',
        label: 'Litter',
        value: '—',
        status: 'Not tracked',
        caption:
          pet.species === 'cat'
            ? 'Needs a paired Atronz Smart Tray.'
            : 'Litter tracking applies to cat profiles.',
        progress: 0,
        trend: 'flat',
        trendLabel: '',
        to: null,
        // Two different reasons produce this tile: the pet is not a cat, or it
        // is a cat with no tray paired. Saying "is a cat, so there is no tray"
        // reads as a contradiction, so each case gets its own sentence.
        unavailableLabel:
          pet.species === 'cat'
            ? `${pet.name} has no Atronz Smart Tray paired yet, so there is nothing to track.`
            : `${pet.name} is a dog, so there is no litter tray to track.`,
      };

  return { activity, rest, nutrition, litter };
}
