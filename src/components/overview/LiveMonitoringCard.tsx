import {
  BatteryLow,
  BatteryMedium,
  Footprints,
  HeartPulse,
  Moon,
  RadioTower,
  RefreshCw,
  Signal,
  Thermometer,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ACTIVITY_STATE_LABELS,
  CONNECTION_QUALITY_LABELS,
  cn,
  formatDuration,
  formatMinutesAgo,
  formatNumber,
  possessive,
} from '@/lib/utils';
import type { DeviceStatus, PetVitals } from '@/types';

export interface LiveMonitoringCardProps {
  petName?: string;
  device?: DeviceStatus | null;
  vitals?: PetVitals | null;
  loading?: boolean;
  onSimulate: () => void;
  /** Feedback for pets with no collar paired yet. */
  onConnectDevice?: () => void;
  className?: string;
}

interface Reading {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
}

/**
 * Collar telemetry panel. Optional sensors (heart rate, temperature) render
 * only when the pet's collar model reports support for them.
 */
export function LiveMonitoringCard({
  petName,
  device,
  vitals,
  loading = false,
  onSimulate,
  onConnectDevice,
  className,
}: LiveMonitoringCardProps) {
  if (loading || !vitals) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-full" />
      </Card>
    );
  }

  // A pet can exist without a collar — show why rather than an empty grid.
  if (!device) {
    return (
      <Card className={cn('flex flex-col', className)}>
        <SectionHeader title="Live monitoring" description="No collar paired" />
        <EmptyState
          icon={WifiOff}
          title="No collar connected"
          description={
            petName
              ? `${petName} has no Atronz collar paired yet, so there is no live activity, rest or vitals data to show.`
              : 'No Atronz collar is paired yet.'
          }
          actionLabel={onConnectDevice ? 'Connect device' : undefined}
          onAction={onConnectDevice}
        />
      </Card>
    );
  }

  const connected = device.collarConnected;
  const batteryLow = device.batteryPercent <= 20;
  const BatteryIcon = batteryLow ? BatteryLow : BatteryMedium;

  const readings: Reading[] = [
    {
      key: 'state',
      icon: Footprints,
      label: 'State',
      value: ACTIVITY_STATE_LABELS[device.activityState],
    },
    {
      key: 'movement',
      icon: RadioTower,
      label: 'Last seen',
      value: formatMinutesAgo(device.lastSeenMinutesAgo),
    },
    {
      key: 'rest',
      icon: Moon,
      label: 'Rest today',
      value: formatDuration(vitals.restMinutes),
    },
    {
      key: 'battery',
      icon: BatteryIcon,
      label: 'Battery',
      value: `${device.batteryPercent}%`,
    },
    {
      key: 'signal',
      icon: Signal,
      label: 'Signal',
      value: CONNECTION_QUALITY_LABELS[device.connectionQuality],
    },
  ];

  if (device.supportsHeartRate && device.heartRateBpm !== null) {
    readings.push({
      key: 'hr',
      icon: HeartPulse,
      label: 'Heart rate',
      value: `${device.heartRateBpm} bpm`,
    });
  }

  if (device.supportsTemperature && device.temperatureC !== null) {
    readings.push({
      key: 'temp',
      icon: Thermometer,
      label: 'Temp',
      value: `${device.temperatureC.toFixed(1)}°C`,
    });
  }

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Live monitoring"
        description={device.deviceName}
        action={
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
              connected
                ? 'border-sage-200 bg-sage-50 text-sage-700'
                : 'border-cream-300 bg-cream-100 text-charcoal-500',
            )}
          >
            {connected ? (
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {connected ? 'Connected' : 'Offline'}
          </span>
        }
      />

      <dl className="grid grid-cols-2 gap-2.5">
        {readings.map((reading) => (
          <div
            key={reading.key}
            className={cn(
              'rounded-xl border border-cream-200 bg-cream-50 p-3',
              reading.key === 'battery' && batteryLow && 'border-amber-200 bg-amber-50',
            )}
          >
            <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
              <reading.icon
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  reading.key === 'battery' && batteryLow
                    ? 'text-amber-600'
                    : 'text-charcoal-400',
                )}
                aria-hidden="true"
              />
              <span className="truncate">{reading.label}</span>
            </dt>
            <dd className="mt-1 truncate text-sm font-medium text-charcoal-800">
              {reading.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 rounded-xl bg-cream-50 px-3 py-2 text-xs text-charcoal-500">
        Steps today: {formatNumber(vitals.steps)} of{' '}
        {formatNumber(vitals.stepGoal)}
        {petName ? ` · ${possessive(petName)} collar reports every few minutes.` : ''}
      </div>

      <button
        type="button"
        onClick={onSimulate}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Simulate live update
      </button>

      <p className="mt-2 text-center text-xs text-charcoal-400">
        Demo mode — readings on this screen are simulated, not live hardware
        data.
      </p>
    </Card>
  );
}
