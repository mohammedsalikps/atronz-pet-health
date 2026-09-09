import { clampPercent, formatNumber, possessive } from '@/lib/utils';
import type {
  InsightAction,
  InsightTone,
  MealEntry,
  NutritionStatus,
  NutritionSummary,
  NutritionTotals,
  Pet,
  PetVitals,
} from '@/types';

/**
 * Nutrition is summed from the meal list rather than stored.
 *
 * That is what makes one logged meal move the Nutrition screen, the Overview
 * metric card, the wellness score and the Health baseline together: they all
 * read the same derived totals.
 */

const ON_TRACK_FLOOR = 85;
const ABOVE_CEILING = 110;

export function mealsFor(meals: MealEntry[], petId: string | null): MealEntry[] {
  if (!petId) return [];
  return meals.filter((meal) => meal.petId === petId);
}

/** Chronological by planned/served time. */
export function sortMeals(meals: MealEntry[]): MealEntry[] {
  return [...meals].sort((a, b) => a.time.localeCompare(b.time));
}

export function statusForPercent(
  percent: number,
  hasLoggedItems: boolean,
): NutritionStatus {
  if (!hasLoggedItems) return 'no-data';
  if (percent >= ABOVE_CEILING) return 'above';
  if (percent >= ON_TRACK_FLOOR) return 'on-track';
  return 'slightly-below';
}

export const NUTRITION_STATUS_LABELS: Record<NutritionStatus, string> = {
  'on-track': 'On track',
  'slightly-below': 'Slightly below target',
  above: 'Above target',
  'no-data': 'No data available',
};

export function nutritionStatusTone(status: NutritionStatus): string {
  switch (status) {
    case 'on-track':
      return 'bg-sage-50 text-sage-700 border-sage-200';
    case 'slightly-below':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'above':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'no-data':
      return 'bg-cream-100 text-charcoal-500 border-cream-300';
  }
}

export function summarizeNutrition(
  vitals: PetVitals,
  meals: MealEntry[],
): NutritionSummary {
  const logged = meals.filter((meal) => meal.status === 'logged');
  const scheduled = meals.filter((meal) => !meal.isTreat);

  const consumedKcal = logged.reduce(
    (total, meal) => total + (meal.calories ?? 0),
    0,
  );
  const treats = logged.filter((meal) => meal.isTreat);

  const targetKcal = vitals.calorieTarget;
  const percent = targetKcal > 0 ? (consumedKcal / targetKcal) * 100 : 0;

  const mealsLogged = scheduled.filter((meal) => meal.status === 'logged').length;
  const mealsMissed = scheduled.filter((meal) => meal.status === 'missed').length;

  return {
    targetKcal,
    consumedKcal,
    remainingKcal: Math.max(0, targetKcal - consumedKcal),
    percent: clampPercent(percent),
    mealsPlanned: scheduled.length,
    mealsLogged,
    mealsPending: scheduled.filter((meal) => meal.status === 'planned').length,
    mealsMissed,
    treatCount: treats.length,
    treatKcal: treats.reduce((total, meal) => total + (meal.calories ?? 0), 0),
    hasUnknownCalories: logged.some((meal) => meal.calories === null),
    waterMl: vitals.waterMl,
    waterTargetMl: vitals.waterTargetMl,
    status: statusForPercent(percent, logged.length > 0),
  };
}

/**
 * Merges the nutrition totals onto raw vitals. The caller adds the litter
 * totals to complete a `DerivedVitals`.
 */
export function withNutrition(
  vitals: PetVitals,
  meals: MealEntry[],
): PetVitals & NutritionTotals {
  const summary = summarizeNutrition(vitals, meals);
  return {
    ...vitals,
    calories: summary.consumedKcal,
    mealsLogged: summary.mealsLogged,
    mealsPlanned: summary.mealsPlanned,
  };
}

export interface NutritionInsight {
  tone: InsightTone;
  headline: string;
  body: string;
  recommendation: string;
  action?: InsightAction;
}

/**
 * Rule-based nutrition observation. Wellness wording only — Atronz never
 * prescribes a diet or diagnoses anything.
 */
export function generateNutritionInsight(
  pet: Pet,
  summary: NutritionSummary,
): NutritionInsight {
  const pct = Math.round(summary.percent);

  if (summary.status === 'no-data') {
    return {
      tone: 'watch',
      headline: `No food logged for ${pet.name} yet today`,
      body: `Nothing has been recorded against a ${formatNumber(summary.targetKcal)} kcal daily target, so today's intake cannot be summarised.`,
      recommendation: 'Log the first meal to start today’s record.',
    };
  }

  if (summary.mealsMissed > 0) {
    return {
      tone: 'attention',
      headline: `${possessive(pet.name)} intake is below the usual daily amount`,
      body: `${summary.mealsMissed} planned meal${summary.mealsMissed === 1 ? ' was' : 's were'} marked as missed, leaving ${formatNumber(summary.consumedKcal)} of ${formatNumber(summary.targetKcal)} kcal (${pct}%) recorded today.`,
      recommendation:
        'Consider monitoring intake over the next day, and contact your veterinarian if a persistent change concerns you.',
      action: { label: 'View health details', to: '/health' },
    };
  }

  if (summary.status === 'above') {
    return {
      tone: 'watch',
      headline: `${possessive(pet.name)} intake is above the daily target`,
      body: `${formatNumber(summary.consumedKcal)} of ${formatNumber(summary.targetKcal)} kcal recorded (${pct}%), including ${summary.treatCount} treat${summary.treatCount === 1 ? '' : 's'}.`,
      recommendation:
        'Review the feeding schedule and portion sizes for the rest of the day.',
    };
  }

  if (summary.mealsPending > 0) {
    return {
      tone: summary.status === 'slightly-below' ? 'watch' : 'positive',
      headline: `${pet.name} has ${summary.mealsPending} planned meal${summary.mealsPending === 1 ? '' : 's'} remaining today`,
      body: `${formatNumber(summary.consumedKcal)} of ${formatNumber(summary.targetKcal)} kcal so far (${pct}%), with ${summary.mealsLogged} of ${summary.mealsPlanned} meals served.`,
      recommendation:
        'Review the feeding schedule and log the remaining meal once it is served.',
    };
  }

  if (summary.status === 'slightly-below') {
    return {
      tone: 'watch',
      headline: `${possessive(pet.name)} intake is a little below the daily target`,
      body: `${formatNumber(summary.consumedKcal)} of ${formatNumber(summary.targetKcal)} kcal recorded (${pct}%) with every planned meal already served.`,
      recommendation:
        'Consider monitoring intake, and contact your veterinarian if a persistent change concerns you.',
      action: { label: 'View health details', to: '/health' },
    };
  }

  return {
    tone: 'positive',
    headline: `${pet.name} is close to the daily food target`,
    body: `${formatNumber(summary.consumedKcal)} of ${formatNumber(summary.targetKcal)} kcal recorded (${pct}%), with all ${summary.mealsPlanned} planned meals served.`,
    recommendation: 'No change needed — keep the current feeding schedule.',
  };
}
