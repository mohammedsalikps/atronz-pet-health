import { clampPercent, possessive } from '@/lib/utils';
import type {
  HealthScore,
  HealthStatus,
  Pet,
  DerivedVitals,
  ScorePillars,
} from '@/types';

/**
 * The Atronz wellness score.
 *
 * This is a lifestyle indicator built from goal attainment across activity,
 * rest, nutrition and (for cats) litter regularity. It is deliberately NOT a
 * clinical measure and no copy in the app presents it as one.
 */

type Pillars = ScorePillars;

const DOG_WEIGHTS = { activity: 0.4, rest: 0.28, nutrition: 0.32 };
const CAT_WEIGHTS = { activity: 0.3, rest: 0.25, nutrition: 0.25, litter: 0.2 };

/** How far litter frequency may drift from baseline before it costs points. */
const LITTER_SENSITIVITY = 1.2;

export function pillarScores(vitals: DerivedVitals): Pillars {
  const activity = clampPercent((vitals.steps / vitals.stepGoal) * 100);
  const rest = clampPercent((vitals.restMinutes / vitals.restGoalMinutes) * 100);
  const nutrition = clampPercent((vitals.calories / vitals.calorieTarget) * 100);

  let litter: number | null = null;
  if (vitals.litterVisits !== null && vitals.litterBaselineVisits) {
    const drift =
      Math.abs(vitals.litterVisits - vitals.litterBaselineVisits) /
      vitals.litterBaselineVisits;
    litter = clampPercent(100 - drift * 100 * LITTER_SENSITIVITY);
  }

  return { activity, rest, nutrition, litter };
}

export function statusForScore(score: number): HealthStatus {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'monitor';
  return 'attention';
}

/** Names the weakest pillar so the card can explain the score in one line. */
function weakestPillar(pillars: Pillars): { label: string; value: number } {
  const entries: Array<{ label: string; value: number }> = [
    { label: 'activity', value: pillars.activity },
    { label: 'rest', value: pillars.rest },
    { label: 'nutrition', value: pillars.nutrition },
  ];
  if (pillars.litter !== null) {
    entries.push({ label: 'litter regularity', value: pillars.litter });
  }
  return entries.reduce((low, item) => (item.value < low.value ? item : low));
}

/** True once anything at all has been recorded for the pet today. */
function hasAnyReadings(vitals: DerivedVitals): boolean {
  return (
    vitals.steps > 0 ||
    vitals.restMinutes > 0 ||
    vitals.calories > 0 ||
    (vitals.litterVisits ?? 0) > 0
  );
}

export function computeHealthScore(pet: Pet, vitals: DerivedVitals): HealthScore {
  const pillars = pillarScores(vitals);

  // A brand-new pet has no telemetry yet. Scoring that as 0 would read as
  // "needs attention", so it gets an explicit pending state instead.
  if (!hasAnyReadings(vitals)) {
    return {
      score: 0,
      pillars,
      previous: pet.previousHealthScore,
      delta: 0,
      status: 'pending',
      summary: `Atronz has not recorded any readings for ${pet.name} yet. The wellness score appears once activity, rest or meals are logged.`,
    };
  }

  const raw =
    pillars.litter === null
      ? pillars.activity * DOG_WEIGHTS.activity +
        pillars.rest * DOG_WEIGHTS.rest +
        pillars.nutrition * DOG_WEIGHTS.nutrition
      : pillars.activity * CAT_WEIGHTS.activity +
        pillars.rest * CAT_WEIGHTS.rest +
        pillars.nutrition * CAT_WEIGHTS.nutrition +
        pillars.litter * CAT_WEIGHTS.litter;

  const score = Math.round(clampPercent(raw));
  const status = statusForScore(score);
  const weakest = weakestPillar(pillars);

  const summary =
    status === 'excellent'
      ? `Activity, rest and nutrition are all sitting inside ${possessive(pet.name)} usual range.`
      : weakest.value >= 80
        ? `A balanced day overall, with ${weakest.label} the only pillar slightly below target.`
        : `${weakest.label.charAt(0).toUpperCase()}${weakest.label.slice(1)} is the pillar pulling this score down today.`;

  return {
    score,
    pillars,
    previous: pet.previousHealthScore,
    delta: score - pet.previousHealthScore,
    status,
    summary,
  };
}
