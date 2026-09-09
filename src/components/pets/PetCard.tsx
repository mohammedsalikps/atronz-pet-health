import {
  Archive,
  Cat,
  Check,
  Dog,
  Pencil,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { formatHoursAgo } from '@/lib/litter';
import {
  cn,
  formatMinutesAgo,
  healthStatusLabel,
  healthStatusTone,
  petAgeLabel,
} from '@/lib/utils';
import type { DeviceStatus, HealthScore, LitterDevice, Pet } from '@/types';

export interface PetCardProps {
  pet: Pet;
  score: HealthScore | null;
  device: DeviceStatus | null;
  litterDevice: LitterDevice | null;
  selected: boolean;
  /** Hidden when this is the only active pet left. */
  canArchive: boolean;
  onSelect: () => void;
  onViewProfile: () => void;
  onEdit: () => void;
  onArchive: () => void;
  className?: string;
}

const SEX_LABELS = { female: 'Female', male: 'Male' } as const;

/** One pet in the household grid. */
export function PetCard({
  pet,
  score,
  device,
  litterDevice,
  selected,
  canArchive,
  onSelect,
  onViewProfile,
  onEdit,
  onArchive,
  className,
}: PetCardProps) {
  const SpeciesIcon = pet.species === 'cat' ? Cat : Dog;

  return (
    <Card
      className={cn(
        'flex flex-col transition',
        selected
          ? 'border-sage-300 ring-1 ring-sage-200'
          : 'hover:border-sage-200 hover:shadow-pop',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar name={pet.name} src={pet.photoUrl} size="xl" shape="rounded" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-charcoal-900">
              {pet.name}
            </h2>
            {selected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2 py-0.5 text-[11px] font-medium text-sage-700">
                <Check className="h-3 w-3" aria-hidden="true" />
                Selected
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-charcoal-500">
            <SpeciesIcon
              className="h-4 w-4 shrink-0 text-charcoal-400"
              aria-hidden="true"
            />
            <span className="truncate">
              {pet.species === 'cat' ? 'Cat' : 'Dog'} · {pet.breed}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-charcoal-400">
            {petAgeLabel(pet)} · {SEX_LABELS[pet.sex]} · {pet.weightKg} kg
          </p>

          {score ? (
            <span
              className={cn(
                'mt-2 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium',
                healthStatusTone(score.status),
              )}
            >
              {healthStatusLabel(score.status)}
              {score.status === 'pending' ? '' : ` · ${score.score}`}
            </span>
          ) : null}
        </div>
      </div>

      {/* Devices */}
      <dl className="mt-4 space-y-2 border-t border-cream-200 pt-3 text-xs">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Collar</dt>
          <dd
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium',
              device?.collarConnected
                ? 'border-sage-200 bg-sage-50 text-sage-700'
                : 'border-cream-300 bg-cream-50 text-charcoal-500',
            )}
          >
            {device?.collarConnected ? (
              <Wifi className="h-3 w-3" aria-hidden="true" />
            ) : (
              <WifiOff className="h-3 w-3" aria-hidden="true" />
            )}
            {!device
              ? 'No collar'
              : device.collarConnected
                ? 'Collar online'
                : 'Collar offline'}
          </dd>

          {litterDevice ? (
            <dd className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 px-2 py-0.5 font-medium text-charcoal-600">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Tray {litterDevice.litterLevelPercent}%
            </dd>
          ) : pet.species === 'cat' ? (
            <dd className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-cream-300 px-2 py-0.5 font-medium text-charcoal-500">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              No tray
            </dd>
          ) : null}
        </div>

        <div className="text-charcoal-400">
          <dt className="sr-only">Last updated</dt>
          <dd>
            {device
              ? `Collar synced ${formatMinutesAgo(device.lastSeenMinutesAgo).toLowerCase()}`
              : litterDevice
                ? `Tray cleaned ${formatHoursAgo(litterDevice.lastCleanedHoursAgo).toLowerCase()}`
                : 'No device readings yet'}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onViewProfile}
          className="flex-1 rounded-full border border-cream-300 bg-cream-50 px-3 py-2 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50"
        >
          View profile
        </button>
        <button
          type="button"
          onClick={onSelect}
          disabled={selected}
          className={cn(
            'flex-1 rounded-full px-3 py-2 text-sm font-medium transition',
            selected
              ? 'cursor-default border border-cream-300 bg-white text-charcoal-400'
              : 'bg-sage-600 text-white hover:bg-sage-700',
          )}
        >
          {selected ? 'Selected' : 'Select pet'}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-charcoal-500 transition hover:bg-cream-100 hover:text-charcoal-800"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit pet
        </button>
        {canArchive ? (
          <button
            type="button"
            onClick={onArchive}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-charcoal-500 transition hover:bg-cream-100 hover:text-charcoal-800"
          >
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            Archive
          </button>
        ) : null}
      </div>
    </Card>
  );
}
