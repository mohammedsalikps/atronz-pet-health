import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Moon,
  RotateCcw,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { ActivityTimelineCard } from '@/components/overview/ActivityTimelineCard';
import { AiInsightCard } from '@/components/overview/AiInsightCard';
import { CareHistoryDialog } from '@/components/overview/CareHistoryDialog';
import { LiveMonitoringCard } from '@/components/overview/LiveMonitoringCard';
import { PetPickerDialog } from '@/components/overview/PetPickerDialog';
import { PetSummaryCard } from '@/components/overview/PetSummaryCard';
import { QuickActionsCard } from '@/components/overview/QuickActionsCard';
import { RecentAlertsCard } from '@/components/overview/RecentAlertsCard';
import { HealthScoreCard } from '@/components/ui/HealthScoreCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import { greetingForNow, todayLabel } from '@/lib/utils';
import type { MetricSummary } from '@/types';

export function OverviewPage() {
  const {
    status,
    selectedPet,
    vitals,
    device,
    metrics,
    healthScore,
    insight,
    alerts,
    alertsUnreadCount,
    timeline,
    markAlertRead,
    dismissAlert,
    simulateLiveUpdate,
    simulateHealthChange,
    resetDemoData,
    demoModified,
  } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [petPickerOpen, setPetPickerOpen] = useState(false);
  const [careHistoryOpen, setCareHistoryOpen] = useState(false);

  const loading = status === 'loading';

  const goTo = useCallback(
    (to: string | null) => {
      if (to) navigate(to);
    },
    [navigate],
  );

  const handleLiveUpdate = useCallback(() => {
    const message = simulateLiveUpdate();
    if (!message) return;
    showToast({
      tone: 'success',
      title: message,
      description: 'Simulated collar sync — metrics and score refreshed.',
    });
  }, [simulateLiveUpdate, showToast]);

  const handleHealthChange = useCallback(() => {
    const message = simulateHealthChange();
    if (!message) return;
    showToast({
      tone: 'warning',
      title: message,
      description: 'New alerts added and the wellness score recalculated.',
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

  const handleMarkAlertRead = useCallback(
    (alertId: string) => {
      markAlertRead(alertId);
      showToast({ tone: 'info', title: 'Alert marked as read' });
    },
    [markAlertRead, showToast],
  );

  const handleDismissAlert = useCallback(
    (alertId: string) => {
      dismissAlert(alertId);
      showToast({ tone: 'info', title: 'Alert dismissed' });
    },
    [dismissAlert, showToast],
  );

  const metricCard = (
    metric: MetricSummary | undefined,
    icon: typeof Activity,
  ) => (
    <StatCard
      icon={icon}
      metric={metric}
      loading={loading}
      onClick={metric?.to ? () => goTo(metric.to) : undefined}
    />
  );

  return (
    <div className="space-y-6">
      {/* 1 — Page heading and context */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-charcoal-400">
          Today · {todayLabel()}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-charcoal-900 sm:text-3xl">
          {greetingForNow()}
        </h1>
        <p className="mt-1.5 text-sm text-charcoal-500 sm:text-base">
          {loading
            ? 'Loading your household…'
            : selectedPet
              ? `Here's how ${selectedPet.name} is doing today.`
              : 'Add a pet to start tracking their health.'}
        </p>

        {demoModified ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2">
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
      </div>

      {/* 2 — Pet summary hero */}
      <PetSummaryCard
        pet={selectedPet}
        device={device}
        healthScore={healthScore}
        loading={loading}
      />

      {/* 3 + 5 — Wellness score alongside live collar telemetry.
          `items-start` keeps the score card at its natural height instead of
          stretching it to match the taller telemetry panel. */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <HealthScoreCard
          pet={selectedPet}
          healthScore={healthScore}
          loading={loading}
          onViewDetails={() => navigate('/health')}
          className="xl:col-span-2"
        />
        <LiveMonitoringCard
          petName={selectedPet?.name}
          device={device}
          vitals={vitals}
          loading={loading}
          onSimulate={handleLiveUpdate}
        />
      </div>

      {/* 4 — Quick metric cards */}
      <section>
        <SectionHeader
          title="Today at a glance"
          description="Live signals from the Atronz collar, feeder and tray"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCard(metrics?.activity, Activity)}
          {metricCard(metrics?.rest, Moon)}
          {metricCard(metrics?.nutrition, UtensilsCrossed)}
          {metricCard(metrics?.litter, Sparkles)}
        </div>
      </section>

      {/* 6 + 7 — AI insight and alerts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AiInsightCard
          insight={insight}
          loading={loading}
          demoModified={demoModified}
          onSimulateHealthChange={handleHealthChange}
          onResetDemo={handleReset}
          onViewDetails={() => navigate('/health')}
          className="xl:col-span-2"
        />
        <RecentAlertsCard
          alerts={alerts}
          petName={selectedPet?.name}
          unreadCount={alertsUnreadCount}
          loading={loading}
          onMarkRead={handleMarkAlertRead}
          onDismiss={handleDismissAlert}
        />
      </div>

      {/* 8 + 9 — Timeline and quick actions */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ActivityTimelineCard
          events={timeline}
          petName={selectedPet?.name}
          loading={loading}
          onViewAll={() => setCareHistoryOpen(true)}
          className="xl:col-span-2"
        />
        <QuickActionsCard
          onAddPet={() => setPetPickerOpen(true)}
          onCareHistory={() => setCareHistoryOpen(true)}
        />
      </div>

      <PetPickerDialog
        open={petPickerOpen}
        onClose={() => setPetPickerOpen(false)}
      />
      <CareHistoryDialog
        open={careHistoryOpen}
        onClose={() => setCareHistoryOpen(false)}
        events={timeline}
        petName={selectedPet?.name}
      />
    </div>
  );
}
