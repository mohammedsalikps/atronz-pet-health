import { pillarScores } from '@/lib/healthScore';
import { formatNumber, possessive } from '@/lib/utils';
import type {
  AiInsight,
  DeviceStatus,
  HealthScore,
  Pet,
  DerivedVitals,
} from '@/types';

/**
 * Rule-based insight generation.
 *
 * Rules are evaluated in priority order and the first match wins, so the copy
 * always reflects the pet's *current* numbers rather than a canned sentence.
 *
 * Safety: this is wellness guidance, not diagnosis. Language is limited to
 * observations ("outside the usual baseline") and soft next steps
 * ("consider monitoring", "contact your vet if the change continues").
 */

interface Rule {
  id: string;
  matches: (ctx: Context) => boolean;
  build: (ctx: Context) => Omit<AiInsight, 'id' | 'petId' | 'generatedAt'>;
}

interface Context {
  pet: Pet;
  vitals: DerivedVitals;
  device: DeviceStatus;
  score: HealthScore;
  pillars: ReturnType<typeof pillarScores>;
}

const RULES: Rule[] = [
  {
    id: 'litter-drift',
    matches: ({ pillars }) => pillars.litter !== null && pillars.litter < 60,
    build: ({ pet, vitals }) => ({
      tone: 'attention',
      headline: `${possessive(pet.name)} litter box visits are outside the usual baseline`,
      body: `Atronz counted ${vitals.litterVisits} visits today against a usual ${vitals.litterBaselineVisits} per day. Bathroom frequency and food intake often move together, so both are worth watching over the next day.`,
      recommendation:
        'Consider monitoring for another 24 hours and contact your veterinarian if the change continues.',
      confidence: 0.78,
      action: { label: 'View litter', to: '/litter' },
    }),
  },
  {
    id: 'activity-low',
    matches: ({ pillars }) => pillars.activity < 60,
    build: ({ pet, vitals, pillars }) => ({
      tone: pillars.activity < 40 ? 'attention' : 'watch',
      headline: `${possessive(pet.name)} activity is below the usual baseline`,
      body: `${formatNumber(vitals.steps)} steps so far today — ${Math.round(pillars.activity)}% of the ${formatNumber(vitals.stepGoal)} step goal, against a usual ${formatNumber(vitals.baselineSteps)}. A quieter day often follows a change in routine or weather.`,
      recommendation:
        'Try adding a short walk this evening, and keep an eye on tomorrow’s numbers.',
      confidence: 0.82,
      action: { label: 'Monitor activity', to: '/health' },
    }),
  },
  {
    id: 'nutrition-low',
    matches: ({ pillars }) => pillars.nutrition < 70,
    build: ({ pet, vitals, pillars }) => ({
      tone: 'watch',
      headline: `${possessive(pet.name)} food intake is below the daily target`,
      body: `${formatNumber(vitals.calories)} of ${formatNumber(vitals.calorieTarget)} kcal logged (${Math.round(pillars.nutrition)}%), with ${vitals.mealsLogged} of ${vitals.mealsPlanned} meals recorded. This is often just a meal that has not been logged yet.`,
      recommendation:
        'Log the remaining meal, or offer a smaller portion if appetite seems low.',
      confidence: 0.74,
      action: { label: 'View nutrition', to: '/nutrition' },
    }),
  },
  {
    id: 'rest-low',
    matches: ({ pillars }) => pillars.rest < 70,
    build: ({ pet, vitals, pillars }) => ({
      tone: 'watch',
      headline: `${pet.name} rested less than usual`,
      body: `${Math.round(pillars.rest)}% of the daily rest goal, against a usual ${Math.round(vitals.baselineRestMinutes / 60)} hours. Broken rest can follow a noisy night or a late walk.`,
      recommendation:
        'Keep the evening routine calm and check whether rest recovers tomorrow.',
      confidence: 0.71,
      action: { label: 'Monitor activity', to: '/health' },
    }),
  },
  {
    id: 'meals-pending',
    matches: ({ vitals, pillars }) =>
      vitals.mealsLogged < vitals.mealsPlanned && pillars.nutrition < 95,
    build: ({ pet, vitals, pillars }) => ({
      tone: 'watch',
      headline: `${possessive(pet.name)} food intake is close to, but under, the daily target`,
      body: `${Math.round(pillars.nutrition)}% of the calorie target so far, with ${vitals.mealsPlanned - vitals.mealsLogged} of ${vitals.mealsPlanned} meals still to log. Appetite looks steady — the gap is mostly timing.`,
      recommendation:
        'Log the remaining meal once it is served to keep the daily total accurate.',
      confidence: 0.86,
      action: { label: 'View nutrition', to: '/nutrition' },
    }),
  },
  {
    id: 'battery-low',
    matches: ({ device }) => device.batteryPercent <= 20,
    build: ({ pet, device }) => ({
      tone: 'watch',
      headline: `${device.deviceName} battery is running low`,
      body: `The collar is at ${device.batteryPercent}%. Below 10% it stops sending activity data, which leaves gaps in ${possessive(pet.name)} daily score.`,
      recommendation: 'Charge the collar tonight to keep tracking continuous.',
      confidence: 0.95,
    }),
  },
  {
    id: 'steady',
    matches: () => true,
    build: ({ pet, score, pillars }) => ({
      tone: 'positive',
      headline: `${pet.name} is showing a normal rest and activity pattern`,
      body: `Activity is at ${Math.round(pillars.activity)}% of goal, rest at ${Math.round(pillars.rest)}% and nutrition at ${Math.round(pillars.nutrition)}%. The wellness score of ${score.score} is ${score.delta >= 0 ? 'up' : 'down'} ${Math.abs(score.delta)} point${Math.abs(score.delta) === 1 ? '' : 's'} on yesterday.`,
      recommendation: 'No change needed — keep the current routine.',
      confidence: 0.9,
    }),
  },
];

export function generateInsight(
  pet: Pet,
  vitals: DerivedVitals,
  device: DeviceStatus,
  score: HealthScore,
  generatedAt: string,
): AiInsight {
  const ctx: Context = { pet, vitals, device, score, pillars: pillarScores(vitals) };
  const rule = RULES.find((candidate) => candidate.matches(ctx)) ?? RULES[RULES.length - 1];

  return {
    id: `insight-${pet.id}-${rule.id}`,
    petId: pet.id,
    generatedAt,
    ...rule.build(ctx),
  };
}
