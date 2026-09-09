import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb, RotateCcw, Sparkle, Waves } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  INSIGHT_TONE_LABELS,
  cn,
  insightToneClasses,
} from '@/lib/utils';
import type { AiInsight } from '@/types';

export interface AiInsightCardProps {
  insight?: AiInsight | null;
  loading?: boolean;
  demoModified: boolean;
  onSimulateHealthChange: () => void;
  onResetDemo: () => void;
  /** Omitted on the Health page, which is already the details view. */
  onViewDetails?: () => void;
  className?: string;
}

/**
 * The Atronz model summary. Copy is generated from the pet's current numbers
 * in `src/lib/insights.ts` and stays observational — never diagnostic.
 */
export function AiInsightCard({
  insight,
  loading = false,
  demoModified,
  onSimulateHealthChange,
  onResetDemo,
  onViewDetails,
  className,
}: AiInsightCardProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    );
  }

  if (!insight) {
    return (
      <Card className={cn('flex flex-col', className)}>
        <EmptyState
          icon={Sparkle}
          title="No insight yet"
          description="Atronz needs a few more days of data for this pet."
        />
      </Card>
    );
  }

  const tone = insightToneClasses(insight.tone);
  // Hide the deep link when it points at the page we are already on.
  const action =
    insight.action && !pathname.startsWith(insight.action.to)
      ? insight.action
      : null;

  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-600 text-white">
            <Sparkle className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-charcoal-800">
              AI Insight
            </span>
            <span className="block text-xs text-charcoal-400">
              {insight.generatedAt}
            </span>
          </span>
        </span>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            tone.chip,
          )}
        >
          <Waves className="h-3.5 w-3.5" aria-hidden="true" />
          {INSIGHT_TONE_LABELS[insight.tone]}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold leading-snug tracking-tight text-charcoal-900 sm:text-lg">
        {insight.headline}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-charcoal-500">
        {insight.body}
      </p>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-cream-200 bg-cream-50 p-3">
        <Lightbulb
          className={cn('mt-0.5 h-4 w-4 shrink-0', tone.accent)}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
            Recommended next step
          </p>
          <p className="mt-0.5 text-sm text-charcoal-700">
            {insight.recommendation}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200"
          role="progressbar"
          aria-label="Model confidence"
          aria-valuenow={Math.round(insight.confidence * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-sage-500 transition-[width] duration-500"
            style={{ width: `${Math.round(insight.confidence * 100)}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-charcoal-500">
          {Math.round(insight.confidence * 100)}% confidence
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-cream-200 pt-4 sm:flex-row sm:flex-wrap">
        {onViewDetails ? (
          <button
            type="button"
            onClick={onViewDetails}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700"
          >
            View health details
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
        {action ? (
          <button
            type="button"
            onClick={() => navigate(action.to)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition',
              onViewDetails
                ? 'border border-cream-300 bg-white text-charcoal-700 hover:border-sage-200 hover:bg-sage-50'
                : 'bg-sage-600 text-white hover:bg-sage-700',
            )}
          >
            {action.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSimulateHealthChange}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50"
        >
          Simulate health change
        </button>
      </div>

      {demoModified ? (
        <button
          type="button"
          onClick={onResetDemo}
          className="mt-2 inline-flex items-center justify-center gap-1.5 self-center rounded-full px-3 py-1.5 text-xs font-medium text-charcoal-500 transition hover:bg-cream-100 hover:text-charcoal-800"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset demo data
        </button>
      ) : null}

      <p className="mt-2 text-xs leading-relaxed text-charcoal-400">
        Wellness guidance only. Atronz does not diagnose conditions — contact
        your veterinarian if a change continues.
      </p>
    </Card>
  );
}
