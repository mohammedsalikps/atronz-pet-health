import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  Cat,
  Dog,
  Scale,
  Stethoscope,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ACTIVITY_STATE_LABELS,
  cn,
  formatMinutesAgo,
  healthStatusLabel,
  healthStatusTone,
  petAgeLabel,
} from '@/lib/utils';
import type { DeviceStatus, HealthScore, Pet } from '@/types';

export interface PetSummaryCardProps {
  pet?: Pet | null;
  device?: DeviceStatus | null;
  healthScore?: HealthScore | null;
  loading?: boolean;
  className?: string;
}

/** Hero identity card for the currently selected pet. */
export function PetSummaryCard({
  pet,
  device,
  healthScore,
  loading = false,
  className,
}: PetSummaryCardProps) {
  const navigate = useNavigate();

  if (loading || !pet) {
    return (
      <Card className={cn('flex items-center gap-5', className)}>
        <Skeleton className="h-20 w-20 shrink-0 rounded-2xl sm:h-28 sm:w-28" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Card>
    );
  }

  const SpeciesIcon = pet.species === 'cat' ? Cat : Dog;
  const hasCollar = Boolean(device);
  const connected = device?.collarConnected ?? false;

  return (
    <Card
      padded={false}
      className={cn('overflow-hidden', className)}
    >
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:p-5">
        <Avatar
          name={pet.name}
          src={pet.photoUrl}
          size="2xl"
          shape="rounded"
          className="sm:h-28 sm:w-28"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-charcoal-900 sm:text-2xl">
              {pet.name}
            </h2>
            {healthScore ? (
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  healthStatusTone(healthScore.status),
                )}
              >
                {healthStatusLabel(healthScore.status)}
              </span>
            ) : null}
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-charcoal-500">
            <SpeciesIcon
              className="h-4 w-4 shrink-0 text-charcoal-400"
              aria-hidden="true"
            />
            <span className="truncate">
              {pet.species === 'cat' ? 'Cat' : 'Dog'} · {pet.breed}
            </span>
          </p>

          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <CalendarClock
                className="h-4 w-4 shrink-0 text-charcoal-400"
                aria-hidden="true"
              />
              <dt className="sr-only">Age</dt>
              <dd className="text-charcoal-700">{petAgeLabel(pet)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale
                className="h-4 w-4 shrink-0 text-charcoal-400"
                aria-hidden="true"
              />
              <dt className="sr-only">Weight</dt>
              <dd className="text-charcoal-700">{pet.weightKg} kg</dd>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <Stethoscope
                className="h-4 w-4 shrink-0 text-charcoal-400"
                aria-hidden="true"
              />
              <dt className="sr-only">Veterinary clinic</dt>
              <dd className="truncate text-charcoal-700">{pet.vetClinic}</dd>
            </div>
          </dl>
        </div>

        <div className="shrink-0 sm:w-52 sm:border-l sm:border-cream-200 sm:pl-5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
              connected
                ? 'border-sage-200 bg-sage-50 text-sage-700'
                : 'border-cream-300 bg-cream-100 text-charcoal-500',
            )}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              {connected ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage-400 opacity-60" />
              ) : null}
              <span
                className={cn(
                  'relative inline-flex h-2 w-2 rounded-full',
                  connected ? 'bg-sage-500' : 'bg-charcoal-400',
                )}
              />
            </span>
            {connected ? (
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {!hasCollar
              ? 'No collar paired'
              : connected
                ? 'Collar connected'
                : 'Collar offline'}
          </span>

          {device ? (
            <p className="mt-2 text-sm text-charcoal-500">
              {ACTIVITY_STATE_LABELS[device.activityState]} ·{' '}
              {formatMinutesAgo(device.lastSeenMinutesAgo)}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => navigate('/pets')}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50 hover:text-charcoal-900"
          >
            Open pet profile
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Card>
  );
}
