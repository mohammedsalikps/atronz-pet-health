import {
  BatteryLow,
  BatteryMedium,
  Check,
  Clock,
  Layers,
  Plug,
  RadioTower,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatHoursAgo } from '@/lib/litter';
import { clampPercent, cn, formatMinutesAgo } from '@/lib/utils';
import type { LitterDevice, LitterSummary } from '@/types';

export interface LitterDeviceCardProps {
  device?: LitterDevice | null;
  summary?: LitterSummary | null;
  loading?: boolean;
  onMarkCleaned: () => void;
  className?: string;
}

interface Reading {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  warn?: boolean;
}

/** Smart tray connection, power, litter level and cleaning status. */
export function LitterDeviceCard({
  device,
  summary,
  loading = false,
  onMarkCleaned,
  className,
}: LitterDeviceCardProps) {
  if (loading || !device || !summary) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-full" />
      </Card>
    );
  }

  const level = clampPercent(device.litterLevelPercent);
  const BatteryIcon =
    device.batteryPercent !== null && device.batteryPercent <= 20
      ? BatteryLow
      : BatteryMedium;

  const readings: Reading[] = [
    {
      key: 'sync',
      icon: RadioTower,
      label: 'Last sync',
      value: formatMinutesAgo(device.lastSyncMinutesAgo),
    },
    {
      key: 'power',
      icon: device.powerSource === 'mains' ? Plug : BatteryIcon,
      label: 'Power',
      value:
        device.powerSource === 'mains'
          ? 'Mains powered'
          : `${device.batteryPercent ?? 0}% battery`,
      warn:
        device.powerSource === 'battery' &&
        (device.batteryPercent ?? 100) <= 20,
    },
    {
      key: 'cleaned',
      icon: Clock,
      label: 'Last cleaned',
      value: formatHoursAgo(device.lastCleanedHoursAgo),
      warn: summary.cleaningDue,
    },
    {
      key: 'status',
      icon: summary.cleaningDue ? Sparkles : Check,
      label: 'Cleaning',
      value: summary.cleaningDue ? 'Due now' : 'Up to date',
      warn: summary.cleaningDue,
    },
  ];

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Litter box"
        description={device.deviceName}
        action={
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
              device.connected
                ? 'border-sage-200 bg-sage-50 text-sage-700'
                : 'border-cream-300 bg-cream-100 text-charcoal-500',
            )}
          >
            {device.connected ? (
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {device.connected ? 'Online' : 'Offline'}
          </span>
        }
      />

      {/* Litter level */}
      <div
        className={cn(
          'rounded-xl border p-3',
          summary.isLowLitter
            ? 'border-amber-200 bg-amber-50'
            : 'border-cream-200 bg-cream-50',
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
            <Layers
              className={cn(
                'h-3.5 w-3.5',
                summary.isLowLitter ? 'text-amber-600' : 'text-charcoal-400',
              )}
              aria-hidden="true"
            />
            Litter level
          </span>
          <span className="text-lg font-semibold tabular-nums text-charcoal-900">
            {level}%
          </span>
        </div>

        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white"
          role="progressbar"
          aria-label="Litter level"
          aria-valuenow={level}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-500 ease-out',
              summary.isLowLitter ? 'bg-amber-500' : 'bg-sage-500',
            )}
            style={{ width: `${level}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-charcoal-500">
          {summary.isLowLitter
            ? `Below the ${device.lowLitterThreshold}% low-litter threshold — time to top up.`
            : `Low-litter warning starts at ${device.lowLitterThreshold}%.`}
        </p>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2.5">
        {readings.map((reading) => (
          <div
            key={reading.key}
            className={cn(
              'rounded-xl border p-3',
              reading.warn
                ? 'border-amber-200 bg-amber-50'
                : 'border-cream-200 bg-cream-50',
            )}
          >
            <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
              <reading.icon
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  reading.warn ? 'text-amber-600' : 'text-charcoal-400',
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

      <button
        type="button"
        onClick={onMarkCleaned}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Mark as cleaned
      </button>

      <p className="mt-2 text-center text-xs text-charcoal-400">
        Demo mode — tray readings on this screen are simulated, not live
        hardware data.
      </p>
    </Card>
  );
}
