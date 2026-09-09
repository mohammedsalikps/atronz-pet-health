import { useCallback } from 'react';
import { PawPrint, RotateCcw } from 'lucide-react';
import { PageHeading } from '@/components/layout/PageHeading';
import { BaselineComparisonCard } from '@/components/health/BaselineComparisonCard';
import { LitterDeviceCard } from '@/components/litter/LitterDeviceCard';
import { LitterHistoryCard } from '@/components/litter/LitterHistoryCard';
import { LitterInsightCard } from '@/components/litter/LitterInsightCard';
import { LitterNotApplicableCard } from '@/components/litter/LitterNotApplicableCard';
import { LitterSummaryCard } from '@/components/litter/LitterSummaryCard';
import { RecentAlertsCard } from '@/components/overview/RecentAlertsCard';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import { BAND_LABELS } from '@/lib/litter';
import { cn, formatMinutesAgo, possessive, todayLabel } from '@/lib/utils';
import type { BaselineBand } from '@/types';

const BAND_TONE: Record<BaselineBand, string> = {
  within: 'bg-sage-50 text-sage-700 border-sage-200',
  'slightly-below': 'bg-amber-50 text-amber-700 border-amber-200',
  'slightly-above': 'bg-amber-50 text-amber-700 border-amber-200',
  outside: 'bg-red-50 text-red-700 border-red-200',
};

/**
 * The Litter screen. Applicability is decided by whether the selected pet has
 * a paired smart tray — dogs get a not-applicable state rather than a
 * dashboard full of zeros.
 */
export function LitterPage() {
  const {
    status,
    error,
    reload,
    pets,
    selectedPet,
    selectPet,
    litterDevice,
    litterEvents,
    litterSummary,
    litterInsight,
    litterSeries,
    litterBaselineRows,
    litterAlerts,
    markAlertRead,
    dismissAlert,
    simulateLitterUsage,
    simulateLowLitter,
    markTrayCleaned,
    resetDemoData,
    demoModified,
  } = useAppData();
  const { showToast } = useToast();

  const loading = status === 'loading';
  const petName = selectedPet?.name;

  // Another pet on the account that does have a tray, for the switch action.
  const trayPet =
    pets.find(
      (pet) => pet.species === 'cat' && pet.id !== selectedPet?.id,
    ) ?? null;

  const notify = useCallback(
    (message: string | null, description: string, tone: 'success' | 'warning') => {
      if (!message) return;
      showToast({ tone, title: message, description });
    },
    [showToast],
  );

  const handleUsage = useCallback(() => {
    notify(
      simulateLitterUsage(),
      'Visit count, chart and baseline status updated.',
      'success',
    );
  }, [simulateLitterUsage, notify]);

  const handleLowLitter = useCallback(() => {
    notify(
      simulateLowLitter(),
      'A low-litter alert was added and the tray card updated.',
      'warning',
    );
  }, [simulateLowLitter, notify]);

  const handleCleaned = useCallback(() => {
    notify(
      markTrayCleaned(),
      'Litter topped up and the cleaning alerts cleared.',
      'success',
    );
  }, [markTrayCleaned, notify]);

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
        <PageHeading eyebrow="Litter" title="Litter" />
        <Card className="mx-auto max-w-2xl">
          <EmptyState
            icon={PawPrint}
            title="We could not load litter data"
            description={error ?? 'Please try again.'}
            actionLabel="Retry"
            onAction={reload}
            className="border-0 bg-transparent"
          />
        </Card>
      </div>
    );
  }

  const applicable = Boolean(litterDevice && litterSummary);

  return (
    <div>
      {/* 1 — Page heading */}
      <PageHeading
        eyebrow={`Litter · Today, ${todayLabel()}`}
        title="Litter"
        description={
          loading
            ? 'Loading litter data…'
            : petName
              ? applicable
                ? `Tray activity, litter level and cleaning status for ${petName}.`
                : `Litter tracking is not set up for ${petName}.`
              : 'Select a pet to see their litter data.'
        }
        action={
          applicable && !loading ? (
            <div className="flex flex-col items-start gap-1.5 sm:items-end">
              <span
                className={cn(
                  'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  BAND_TONE[litterSummary!.band],
                )}
              >
                <span className="truncate">{petName}</span>
                <span className="shrink-0">
                  · {BAND_LABELS[litterSummary!.band]}
                </span>
              </span>
              <span className="text-xs text-charcoal-400">
                Updated{' '}
                {formatMinutesAgo(litterDevice!.lastSyncMinutesAgo).toLowerCase()}
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

      {loading ? (
        <div className="space-y-4">
          <LitterSummaryCard loading onSimulateUsage={handleUsage} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <LitterHistoryCard
              loading
              events={[]}
              series={[]}
              className="xl:col-span-2"
            />
            <LitterDeviceCard loading onMarkCleaned={handleCleaned} />
          </div>
        </div>
      ) : !applicable ? (
        selectedPet ? (
          /* 2 — Not-applicable state, with a working switch action */
          <LitterNotApplicableCard
            pet={selectedPet}
            suggestion={trayPet}
            onSelectSuggestion={selectPet}
          />
        ) : null
      ) : (
        <div className="space-y-4">
          {/* 3 — Today's summary, with the usage simulation */}
          <LitterSummaryCard
            petName={petName}
            summary={litterSummary}
            onSimulateUsage={handleUsage}
          />

          {/* 4 + 2/6 — Usage history beside the tray device and cleaning card */}
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
            <LitterHistoryCard
              petName={petName}
              events={litterEvents}
              series={litterSeries}
              summary={litterSummary}
              className="xl:col-span-2"
            />
            <LitterDeviceCard
              device={litterDevice}
              summary={litterSummary}
              onMarkCleaned={handleCleaned}
            />
          </div>

          {/* 5 + 8 — Baseline comparison and the litter insight */}
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
            <BaselineComparisonCard
              petName={petName}
              rows={litterBaselineRows}
            />
            <LitterInsightCard
              insight={litterInsight}
              demoModified={demoModified}
              onSimulateLowLitter={handleLowLitter}
              onResetDemo={handleReset}
              className="xl:col-span-2"
            />
          </div>

          {/* 9 — Litter-related alerts */}
          <RecentAlertsCard
            title="Litter alerts"
            description={
              petName
                ? `Tray and cleaning signals for ${possessive(petName)} litter box`
                : undefined
            }
            alerts={litterAlerts}
            petName={petName}
            unreadCount={litterAlerts.filter((alert) => !alert.read).length}
            onMarkRead={(id) => {
              markAlertRead(id);
              showToast({ tone: 'info', title: 'Alert marked as read' });
            }}
            onDismiss={(id) => {
              dismissAlert(id);
              showToast({ tone: 'info', title: 'Alert dismissed' });
            }}
            showViewAll={false}
            emptyTitle="No litter alerts"
            emptyDescription={
              petName
                ? `${petName} has no tray or cleaning alerts right now.`
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
