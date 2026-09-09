import type { ReactNode } from 'react';
import { ArrowRight, Lightbulb, RotateCcw, Sparkle, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { INSIGHT_TONE_LABELS, cn, insightToneClasses } from '@/lib/utils';
import type { InsightAction, InsightTone } from '@/types';

/** The shape every derived insight shares. */
export interface PanelInsight {
  tone: InsightTone;
  headline: string;
  body: string;
  recommendation: string;
  action?: InsightAction;
}

export interface InsightPanelProps {
  title: string;
  subtitle: string;
  insight?: PanelInsight | null;
  loading?: boolean;
  /** Rendered after the deep-link button — usually simulation controls. */
  controls?: ReactNode;
  demoModified?: boolean;
  onResetDemo?: () => void;
  disclaimer: string;
  className?: string;
}

/**
 * Shared presentation for the derived insight cards (nutrition, litter).
 * Keeps the observation → recommendation → action rhythm identical across
 * screens so the wording and the safety footer stay consistent.
 */
export function InsightPanel({
  title,
  subtitle,
  insight,
  loading = false,
  controls,
  demoModified = false,
  onResetDemo,
  disclaimer,
  className,
}: InsightPanelProps) {
  const navigate = useNavigate();

  if (loading || !insight) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-8 w-40 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    );
  }

  const tone = insightToneClasses(insight.tone);

  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-600 text-white">
            <Sparkle className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-charcoal-800">
              {title}
            </span>
            <span className="block text-xs text-charcoal-400">{subtitle}</span>
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
            Suggested next step
          </p>
          <p className="mt-0.5 text-sm text-charcoal-700">
            {insight.recommendation}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-cream-200 pt-4 sm:flex-row sm:flex-wrap">
        {insight.action ? (
          <button
            type="button"
            onClick={() => navigate(insight.action!.to)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700"
          >
            {insight.action.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
        {controls}
      </div>

      {demoModified && onResetDemo ? (
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
        {disclaimer}
      </p>
    </Card>
  );
}
