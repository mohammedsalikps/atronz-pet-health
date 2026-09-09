import { useCallback, useMemo, useState } from 'react';
import { PawPrint, RotateCcw } from 'lucide-react';
import { PageHeading } from '@/components/layout/PageHeading';
import { FeedingScheduleCard } from '@/components/nutrition/FeedingScheduleCard';
import { FoodPreferencesCard } from '@/components/nutrition/FoodPreferencesCard';
import { LogFoodDialog } from '@/components/nutrition/LogFoodDialog';
import { MealHistoryCard } from '@/components/nutrition/MealHistoryCard';
import { NutritionInsightCard } from '@/components/nutrition/NutritionInsightCard';
import { NutritionSummaryCard } from '@/components/nutrition/NutritionSummaryCard';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppData } from '@/context/AppDataContext';
import type { NewMealDraft } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import {
  NUTRITION_STATUS_LABELS,
  nutritionStatusTone,
} from '@/lib/nutrition';
import { cn, todayLabel } from '@/lib/utils';

/**
 * The Nutrition screen. Meals are the source of truth: logging food, marking a
 * planned meal served or simulating a missed meal all edit the same list, and
 * the calorie totals, wellness score, Overview card and Health baseline follow
 * from it automatically.
 */
export function NutritionPage() {
  const {
    status,
    error,
    reload,
    selectedPet,
    meals,
    nutrition,
    nutritionInsight,
    foodProfile,
    logMeal,
    completeScheduledMeal,
    simulateMissedMeal,
    resetDemoData,
    demoModified,
  } = useAppData();
  const { showToast } = useToast();
  const [logOpen, setLogOpen] = useState(false);

  const loading = status === 'loading';
  const petName = selectedPet?.name;

  const scheduledMeals = useMemo(
    () => meals.filter((meal) => !meal.isTreat),
    [meals],
  );

  const handleLogFood = useCallback(
    (draft: NewMealDraft) => {
      const message = logMeal(draft);
      setLogOpen(false);
      if (!message) return;
      showToast({
        tone: 'success',
        title: message,
        description: 'Today’s totals and the wellness score were updated.',
      });
    },
    [logMeal, showToast],
  );

  const handleComplete = useCallback(
    (mealId: string) => {
      const message = completeScheduledMeal(mealId);
      if (!message) return;
      showToast({
        tone: 'success',
        title: message,
        description: 'Nutrition progress and the pending count were updated.',
      });
    },
    [completeScheduledMeal, showToast],
  );

  const handleMissedMeal = useCallback(() => {
    const message = simulateMissedMeal();
    if (!message) {
      showToast({
        tone: 'info',
        title: 'No meal available to miss',
        description: 'Every scheduled meal is already marked as missed.',
      });
      return;
    }
    showToast({
      tone: 'warning',
      title: message,
      description: 'A nutrition alert was added and the totals recalculated.',
    });
  }, [simulateMissedMeal, showToast]);

  const handleReset = useCallback(() => {
    resetDemoData();
    showToast({
      tone: 'info',
      title: 'Demo data reset',
      description: 'All pets are back to their starting readings.',
    });
  }, [resetDemoData, showToast]);

  if (status === 'error') {
    return (
      <div>
        <PageHeading eyebrow="Nutrition" title="Nutrition" />
        <Card className="mx-auto max-w-2xl">
          <EmptyState
            icon={PawPrint}
            title="We could not load nutrition data"
            description={error ?? 'Please try again.'}
            actionLabel="Retry"
            onAction={reload}
            className="border-0 bg-transparent"
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* 1 — Page heading */}
      <PageHeading
        eyebrow={`Nutrition · Today, ${todayLabel()}`}
        title="Nutrition"
        description={
          loading
            ? 'Loading today’s food log…'
            : petName
              ? `Today’s meals, treats and water for ${petName}.`
              : 'Select a pet to see their food log.'
        }
        action={
          nutrition && !loading ? (
            <span
              className={cn(
                'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                nutritionStatusTone(nutrition.status),
              )}
            >
              <span className="truncate">{petName}</span>
              <span className="shrink-0">
                · {NUTRITION_STATUS_LABELS[nutrition.status]}
              </span>
            </span>
          ) : undefined
        }
      />

      {demoModified ? (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2">
          <span className="text-xs text-charcoal-500">
            Showing simulated demo readings.
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-charcoal-700 ring-1 ring-cream-300 transition hover:bg-sage-50 hover:text-sage-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset demo data
          </button>
        </div>
      ) : null}

      <div className="space-y-4">
        {/* 2 + 3 — Daily summary and status */}
        <NutritionSummaryCard
          petName={petName}
          nutrition={nutrition}
          loading={loading}
          onLogFood={() => setLogOpen(true)}
        />

        {/* 4 + 6 — Meal history and the feeding schedule */}
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
          <MealHistoryCard
            petName={petName}
            meals={meals}
            loading={loading}
            onLogFood={() => setLogOpen(true)}
            className="xl:col-span-2"
          />
          <FeedingScheduleCard
            petName={petName}
            meals={scheduledMeals}
            loading={loading}
            onComplete={handleComplete}
          />
        </div>

        {/* 7 + 8 — Owner-recorded profile and the nutrition insight */}
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
          <FoodPreferencesCard
            petName={petName}
            profile={foodProfile}
            loading={loading}
          />
          <NutritionInsightCard
            insight={nutritionInsight}
            loading={loading}
            demoModified={demoModified}
            onSimulateMissedMeal={handleMissedMeal}
            onResetDemo={handleReset}
            className="xl:col-span-2"
          />
        </div>
      </div>

      {/* 5 — Log food */}
      <LogFoodDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        petName={petName}
        onSubmit={handleLogFood}
      />
    </div>
  );
}
