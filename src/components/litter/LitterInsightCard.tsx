import { Layers } from 'lucide-react';
import { InsightPanel } from '@/components/ui/InsightPanel';
import type { LitterInsight } from '@/lib/litter';

export interface LitterInsightCardProps {
  insight?: LitterInsight | null;
  loading?: boolean;
  demoModified: boolean;
  onSimulateLowLitter: () => void;
  onResetDemo: () => void;
  className?: string;
}

/**
 * Litter observation generated from today's tray events. Limited to pattern
 * language — Atronz never suggests a urinary, digestive or other condition.
 */
export function LitterInsightCard({
  insight,
  loading = false,
  demoModified,
  onSimulateLowLitter,
  onResetDemo,
  className,
}: LitterInsightCardProps) {
  return (
    <InsightPanel
      title="Litter insight"
      subtitle="From today’s tray activity"
      insight={insight}
      loading={loading}
      demoModified={demoModified}
      onResetDemo={onResetDemo}
      className={className}
      disclaimer="Wellness guidance only. Atronz does not diagnose conditions — contact your veterinarian if a persistent change concerns you."
      controls={
        <button
          type="button"
          onClick={onSimulateLowLitter}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50"
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
          Simulate low litter
        </button>
      }
    />
  );
}
