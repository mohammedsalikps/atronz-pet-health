import { UtensilsCrossed } from 'lucide-react';
import { InsightPanel } from '@/components/ui/InsightPanel';
import type { NutritionInsight } from '@/lib/nutrition';

export interface NutritionInsightCardProps {
  insight?: NutritionInsight | null;
  loading?: boolean;
  demoModified: boolean;
  onSimulateMissedMeal: () => void;
  onResetDemo: () => void;
  className?: string;
}

/**
 * Nutrition observation generated from today's meal list. Wellness wording
 * only — Atronz never prescribes a diet.
 */
export function NutritionInsightCard({
  insight,
  loading = false,
  demoModified,
  onSimulateMissedMeal,
  onResetDemo,
  className,
}: NutritionInsightCardProps) {
  return (
    <InsightPanel
      title="Nutrition insight"
      subtitle="From today’s meal log"
      insight={insight}
      loading={loading}
      demoModified={demoModified}
      onResetDemo={onResetDemo}
      className={className}
      disclaimer="Wellness guidance only. Atronz does not prescribe diets — contact your veterinarian if a persistent change concerns you."
      controls={
        <button
          type="button"
          onClick={onSimulateMissedMeal}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50"
        >
          <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          Simulate missed meal
        </button>
      }
    />
  );
}
