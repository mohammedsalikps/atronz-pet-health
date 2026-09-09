import { useCallback } from 'react';
import { PawPrint, RotateCcw } from 'lucide-react';
import { PageHeading } from '@/components/layout/PageHeading';
import { ActivityTrendCard } from '@/components/health/ActivityTrendCard';
import { BaselineComparisonCard } from '@/components/health/BaselineComparisonCard';
import { NutritionHealthCard } from '@/components/health/NutritionHealthCard';
import { RestTrendCard } from '@/components/health/RestTrendCard';
import { WeightTrendCard } from '@/components/health/WeightTrendCard';
import { AiInsightCard } from '@/components/overview/AiInsightCard';
import { LiveMonitoringCard } from '@/components/overview/LiveMonitoringCard';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { HealthScoreCard } from '@/components/ui/HealthScoreCard';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import {
  cn,
  formatMinutesAgo,
  healthStatusLabel,
  healthStatusTone,
  possessive,
} from '@/lib/utils';

/**
 * The Health screen. Every value shown comes from the selected pet's raw
 * telemetry through the shared derivation layer, so the demo simulations move
 * the charts, the score, the baseline bands and the AI explanation together.
 */
export function HealthPage() {
  const {
    status,
    error,
    reload,
    selectedPet,
    vitals,
    device,
    metrics,
    nutrition,
    healthScore,
    insight,
    activitySeries,
    restSeries,
    weightTrend,
    baselineRows,
    simulateLiveUpdate,
    simulateHealthChange,
    resetDemoData,
    demoModified,
  } = useAppData();
  const { showToast } = useToast();

  const loading = status === 'loading';
  const petName = selectedPet?.name;

  const handleLiveUpdate = useCallback(() => {
    const message = simulateLiveUpdate();
    if (!message) return;
    showToast({
      tone: 'success',
      title: message,
      description: 'Simulated collar sync — charts and score refreshed.',
    });
  }, [simulateLiveUpdate, showToast]);

  const handleHealthChange = useCallback(() => {
    const message = simulateHealthChange();
    if (!message) return;
    showToast({
      tone: 'warning',
      title: message,
      description: 'Charts, baseline bands and the AI explanation updated.',
    });
  }, [simulateHealthChange, showToast]);

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
        <PageHeading eyebrow="Health" title="Health overview" />
        <Card className="mx-auto max-w-2xl">
          <EmptyState
            icon={PawPrint}
            title="We could not load health data"
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
        eyebrow="Health"
        title="Health overview"
        description={
          loading
            ? 'Loading health data…'
            : petName
              ? `A closer look at ${possessive(petName)} activity, rest, nutrition and collar readings.`
              : 'Select a pet to see their health data.'
        }
        action={
          healthScore && !loading ? (
            <div className="flex flex-col items-start gap-1.5 sm:items-end">
              <span
                className={cn(
                  'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  healthStatusTone(healthScore.status),
                )}
              >
                <span className="truncate">{petName}</span>
                <span className="shrink-0">
                  · {healthStatusLabel(healthScore.status)}
                </span>
              </span>
              <span className="text-xs text-charcoal-400">
                Updated{' '}
                {device
                  ? formatMinutesAgo(device.lastSeenMinutesAgo).toLowerCase()
                  : 'recently'}
              </span>
            </div>
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
        {/* 2 + 7 — Score with pillar breakdown, alongside collar telemetry */}
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
          <HealthScoreCard
            pet={selectedPet}
            healthScore={healthScore}
            loading={loading}
            className="xl:col-span-2"
          />
          <LiveMonitoringCard
            petName={petName}
            device={device}
            vitals={vitals}
            loading={loading}
            onSimulate={handleLiveUpdate}
          />
        </div>

        {/* 3 + 4 — Activity and rest trends */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ActivityTrendCard
            petName={petName}
            series={activitySeries}
            vitals={vitals}
            loading={loading}
          />
          <RestTrendCard
            petName={petName}
            series={restSeries}
            vitals={vitals}
            loading={loading}
          />
        </div>

        {/* 5 + 6 — Nutrition and weight */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <NutritionHealthCard
            petName={petName}
            nutrition={nutrition}
            metric={metrics?.nutrition}
            loading={loading}
          />
          <WeightTrendCard
            petName={petName}
            weight={weightTrend}
            loading={loading}
          />
        </div>

        {/* 8 + 9 — Baseline comparison and the AI explanation */}
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
          <BaselineComparisonCard
            petName={petName}
            rows={baselineRows}
            loading={loading}
          />
          <AiInsightCard
            insight={insight}
            loading={loading}
            demoModified={demoModified}
            onSimulateHealthChange={handleHealthChange}
            onResetDemo={handleReset}
            className="xl:col-span-2"
          />
        </div>
      </div>
    </div>
  );
}
