import { BAND_LABELS, bandFor } from '@/lib/trends';
import { formatDuration, possessive } from '@/lib/utils';
import type {
  BaselineRow,
  InsightAction,
  InsightTone,
  LitterDevice,
  LitterEvent,
  LitterSummary,
  LitterTotals,
  LitterUsageType,
  Pet,
  PetHistory,
  PetVitals,
  SeriesPoint,
} from '@/types';

/**
 * Litter is summed from the tray's event list rather than stored, in the same
 * way nutrition is summed from meals. A simulated visit therefore moves the
 * Litter screen, the Overview metric card, the wellness score and the Health
 * baseline together.
 *
 * Applicability is decided by whether the pet has a paired tray: dogs have
 * none, so every litter surface shows a not-applicable state instead of zeros.
 */

/**
 * The usual daily range is derived from `bandFor` itself rather than a
 * separate spread, so the displayed range can never contradict the band badge
 * (a stated range of 1-5 next to an "Outside usual baseline" pill at 5 visits).
 */
function usualRange(baseline: number): [number, number] {
  if (baseline <= 0) return [0, 0];
  const outside = (visits: number) =>
    bandFor(((visits - baseline) / baseline) * 100) === 'outside';

  let low = baseline;
  while (low - 1 >= 0 && !outside(low - 1)) low -= 1;

  let high = baseline;
  const ceiling = baseline * 4;
  while (high < ceiling && !outside(high + 1)) high += 1;

  return [low, high];
}

/** "3 visits" when the band admits a single value, "2-4 visits" otherwise. */
export function usualRangeLabel(low: number, high: number): string {
  return low === high ? `${low} visits` : `${low}–${high} visits`;
}

export const USAGE_TYPE_LABELS: Record<LitterUsageType, string> = {
  liquid: 'Liquid',
  solid: 'Solid',
  mixed: 'Mixed',
  unknown: 'Not detected',
};

export function litterEventsFor(
  events: LitterEvent[],
  petId: string | null,
): LitterEvent[] {
  if (!petId) return [];
  return events
    .filter((event) => event.petId === petId)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function litterDeviceFor(
  devices: LitterDevice[],
  petId: string | null,
): LitterDevice | null {
  if (!petId) return null;
  return devices.find((device) => device.petId === petId) ?? null;
}

/** Formats seconds as "1m 40s" — durations here are short. */
export function formatSeconds(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

export function summarizeLitter(
  vitals: PetVitals,
  device: LitterDevice | null,
  events: LitterEvent[],
): LitterSummary | null {
  if (!device || vitals.litterBaselineVisits === null) return null;

  const baselineVisits = vitals.litterBaselineVisits;
  const visitsToday = events.length;
  const avgDurationSeconds =
    events.length === 0
      ? null
      : Math.round(
          events.reduce((total, event) => total + event.durationSeconds, 0) /
            events.length,
        );

  const deltaPercent =
    baselineVisits === 0
      ? 0
      : ((visitsToday - baselineVisits) / baselineVisits) * 100;

  const weighed = events.filter((event) => event.depositGrams !== null);

  return {
    visitsToday,
    lastVisitTime: events.length > 0 ? events[events.length - 1].time : null,
    avgDurationSeconds,
    baselineVisits,
    baselineDurationSeconds: vitals.litterBaselineDurationSeconds,
    usualRangeLow: usualRange(baselineVisits)[0],
    usualRangeHigh: usualRange(baselineVisits)[1],
    band: bandFor(deltaPercent),
    deltaPercent,
    litterLevelPercent: device.litterLevelPercent,
    lowLitterThreshold: device.lowLitterThreshold,
    isLowLitter: device.litterLevelPercent <= device.lowLitterThreshold,
    lastCleanedHoursAgo: device.lastCleanedHoursAgo,
    cleaningDue: device.lastCleanedHoursAgo >= device.cleaningIntervalHours,
    totalDepositGrams:
      weighed.length === 0
        ? null
        : weighed.reduce((total, event) => total + (event.depositGrams ?? 0), 0),
  };
}

/** Merges the derived litter totals onto raw vitals for the score layer. */
export function litterTotals(
  vitals: PetVitals,
  device: LitterDevice | null,
  events: LitterEvent[],
): LitterTotals {
  const summary = summarizeLitter(vitals, device, events);
  if (!summary) {
    return {
      litterVisits: null,
      litterAvgDurationSeconds: null,
      litterLevelPercent: null,
    };
  }
  return {
    litterVisits: summary.visitsToday,
    litterAvgDurationSeconds: summary.avgDurationSeconds,
    litterLevelPercent: summary.litterLevelPercent,
  };
}

/** Seven-day visit counts, today's value taken from the live event list. */
export function buildLitterSeries(
  history: PetHistory | null,
  visitsToday: number,
  dayLabels: string[],
): SeriesPoint[] {
  if (!history || history.litterVisits.length === 0) return [];
  const values = [...history.litterVisits, visitsToday];
  return values.map((value, index) => ({
    label: dayLabels[index] ?? '',
    value,
    isCurrent: index === values.length - 1,
  }));
}

/** Baseline rows in the same shape and language as the Health screen. */
export function buildLitterBaseline(summary: LitterSummary): BaselineRow[] {
  const rows: BaselineRow[] = [
    {
      id: 'visits',
      label: 'Visits today',
      current: `${summary.visitsToday} visit${summary.visitsToday === 1 ? '' : 's'}`,
      baseline: `usually ${summary.baselineVisits}/day`,
      deltaPercent: summary.deltaPercent,
      band: summary.band,
      trend:
        Math.abs(summary.deltaPercent) <= 3
          ? 'flat'
          : summary.deltaPercent > 0
            ? 'up'
            : 'down',
    },
  ];

  if (
    summary.avgDurationSeconds !== null &&
    summary.baselineDurationSeconds !== null &&
    summary.baselineDurationSeconds > 0
  ) {
    const delta =
      ((summary.avgDurationSeconds - summary.baselineDurationSeconds) /
        summary.baselineDurationSeconds) *
      100;
    rows.push({
      id: 'duration',
      label: 'Average duration',
      current: formatSeconds(summary.avgDurationSeconds),
      baseline: `usually ${formatSeconds(summary.baselineDurationSeconds)}`,
      deltaPercent: delta,
      band: bandFor(delta),
      trend: Math.abs(delta) <= 3 ? 'flat' : delta > 0 ? 'up' : 'down',
    });
  }

  if (summary.totalDepositGrams !== null) {
    rows.push({
      id: 'weight',
      label: 'Recorded weight',
      current: `${summary.totalDepositGrams} g today`,
      baseline: 'from the tray scale',
      deltaPercent: 0,
      band: 'within',
      trend: 'flat',
    });
  }

  return rows;
}

export interface LitterInsight {
  tone: InsightTone;
  headline: string;
  body: string;
  recommendation: string;
  action?: InsightAction;
}

/**
 * Rule-based litter observation. Deliberately limited to pattern language —
 * Atronz never suggests a urinary, digestive or any other condition.
 */
export function generateLitterInsight(
  pet: Pet,
  summary: LitterSummary,
): LitterInsight {
  const rangeText = `a usual ${usualRangeLabel(summary.usualRangeLow, summary.usualRangeHigh)} per day`;

  if (summary.band === 'outside') {
    return {
      tone: 'attention',
      headline: `${possessive(pet.name)} litter pattern is outside the usual baseline`,
      body: `${summary.visitsToday} visits recorded today against ${rangeText}. Bathroom frequency naturally varies with heat, water intake and routine.`,
      recommendation:
        'Consider monitoring this pattern for another day, and contact your veterinarian if the change continues.',
      action: { label: 'View health details', to: '/health' },
    };
  }

  if (summary.band !== 'within') {
    return {
      tone: 'watch',
      headline: `${possessive(pet.name)} visits are slightly ${summary.deltaPercent > 0 ? 'above' : 'below'} the usual daily range`,
      body: `${summary.visitsToday} visits today against ${rangeText}, averaging ${summary.avgDurationSeconds !== null ? formatSeconds(summary.avgDurationSeconds) : 'an unrecorded duration'} each.`,
      recommendation: 'Consider monitoring the pattern over the next day.',
      action: { label: 'View health details', to: '/health' },
    };
  }

  if (summary.isLowLitter) {
    return {
      tone: 'watch',
      headline: 'The tray is running low on litter',
      body: `The pattern itself is normal — ${summary.visitsToday} visits today, inside ${rangeText} — but the tray is at ${summary.litterLevelPercent}%.`,
      recommendation: 'Top up the litter and mark the tray as cleaned.',
    };
  }

  return {
    tone: 'positive',
    headline: `${pet.name} is showing a normal litter-box pattern`,
    body: `${summary.visitsToday} visits today, inside ${rangeText}${
      summary.avgDurationSeconds !== null
        ? `, averaging ${formatSeconds(summary.avgDurationSeconds)} each`
        : ''
    }.`,
    recommendation: 'No change needed — keep the current routine.',
  };
}

export { BAND_LABELS };

/** Formats the "last cleaned" figure, reusing the shared duration helper. */
export function formatHoursAgo(hours: number): string {
  if (hours <= 0) return 'Just now';
  if (hours < 1) return formatDuration(Math.round(hours * 60));
  const rounded = Math.round(hours);
  return rounded === 1 ? '1 hour ago' : `${rounded} hours ago`;
}
