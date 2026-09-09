import type { ReactNode } from 'react';
import {
  Ban,
  ClipboardList,
  FileText,
  HeartPulse,
  Info,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Syringe,
  TriangleAlert,
  WifiOff,
} from 'lucide-react';
import { TimelineList } from '@/components/overview/ActivityTimelineCard';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatHoursAgo } from '@/lib/litter';
import {
  cn,
  formatMinutesAgo,
  healthStatusLabel,
  healthStatusTone,
  petAgeLabel,
  possessive,
} from '@/lib/utils';
import type {
  DeviceStatus,
  FoodProfile,
  HealthScore,
  LitterDevice,
  Pet,
  PetAlert,
  TimelineEvent,
  Vaccination,
  VaccinationStatus,
} from '@/types';

export interface PetProfileDialogProps {
  open: boolean;
  onClose: () => void;
  pet: Pet | null;
  score: HealthScore | null;
  profile: FoodProfile | null;
  vaccinations: Vaccination[];
  device: DeviceStatus | null;
  litterDevice: LitterDevice | null;
  timeline: TimelineEvent[];
  alerts: PetAlert[];
  onConnectDevice: () => void;
}

const VACCINATION_TONE: Record<VaccinationStatus, string> = {
  'up-to-date': 'border-sage-200 bg-sage-50 text-sage-700',
  'due-soon': 'border-amber-200 bg-amber-50 text-amber-700',
  overdue: 'border-red-200 bg-red-50 text-red-700',
};

const VACCINATION_LABEL: Record<VaccinationStatus, string> = {
  'up-to-date': 'Up to date',
  'due-soon': 'Due soon',
  overdue: 'Overdue',
};

/** Full profile drawer for one pet. */
export function PetProfileDialog({
  open,
  onClose,
  pet,
  score,
  profile,
  vaccinations,
  device,
  litterDevice,
  timeline,
  alerts,
  onConnectDevice,
}: PetProfileDialogProps) {
  if (!pet) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${possessive(pet.name)} profile`}
      description={`${pet.species === 'cat' ? 'Cat' : 'Dog'} · ${pet.breed}`}
    >
      <div className="space-y-5">
        {/* Basic information */}
        <div className="flex items-start gap-4">
          <Avatar name={pet.name} src={pet.photoUrl} size="xl" shape="rounded" />
          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Detail label="Age" value={petAgeLabel(pet)} />
            <Detail
              label="Gender"
              value={pet.sex === 'female' ? 'Female' : 'Male'}
            />
            <Detail label="Weight" value={`${pet.weightKg} kg`} />
            <Detail label="Microchip" value={pet.microchipId} />
            <div className="col-span-2 min-w-0">
              <Detail label="Veterinary clinic" value={pet.vetClinic} />
            </div>
          </dl>
        </div>

        {/* Wellness score */}
        <Section icon={ShieldCheck} title="Wellness score">
          {score ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-cream-200 bg-cream-50 p-3">
              <span className="text-2xl font-semibold tabular-nums text-charcoal-900">
                {score.status === 'pending' ? '—' : score.score}
              </span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-xs font-medium',
                  healthStatusTone(score.status),
                )}
              >
                {healthStatusLabel(score.status)}
              </span>
              <p className="w-full text-xs leading-snug text-charcoal-500">
                {score.summary}
              </p>
            </div>
          ) : null}
        </Section>

        {/* Connected devices */}
        <Section icon={RadioTower} title="Connected devices">
          {device || litterDevice ? (
            <ul className="space-y-2">
              {device ? (
                <li className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-charcoal-800">
                      {device.deviceName}
                    </p>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        device.collarConnected
                          ? 'border-sage-200 bg-sage-50 text-sage-700'
                          : 'border-cream-300 bg-white text-charcoal-500',
                      )}
                    >
                      {device.collarConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-charcoal-500">
                    Battery {device.batteryPercent}% · Signal{' '}
                    {device.connectionQuality} · Last seen{' '}
                    {formatMinutesAgo(device.lastSeenMinutesAgo).toLowerCase()}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-charcoal-400">
                    <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />
                    Sensors:{' '}
                    {[
                      device.supportsHeartRate ? 'heart rate' : null,
                      device.supportsTemperature ? 'temperature' : null,
                      'activity',
                      'rest',
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </li>
              ) : null}

              {litterDevice ? (
                <li className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-charcoal-800">
                      {litterDevice.deviceName}
                    </p>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        litterDevice.connected
                          ? 'border-sage-200 bg-sage-50 text-sage-700'
                          : 'border-cream-300 bg-white text-charcoal-500',
                      )}
                    >
                      {litterDevice.connected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-charcoal-500">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Litter {litterDevice.litterLevelPercent}% · cleaned{' '}
                    {formatHoursAgo(litterDevice.lastCleanedHoursAgo).toLowerCase()}
                  </p>
                </li>
              ) : null}
            </ul>
          ) : (
            <EmptyState
              icon={WifiOff}
              title="No devices connected"
              description={`${pet.name} has no Atronz collar or smart tray paired yet, so no telemetry is being recorded.`}
              actionLabel="Connect device"
              onAction={onConnectDevice}
            />
          )}
        </Section>

        {/* Vaccinations */}
        <Section icon={Syringe} title="Vaccinations">
          {vaccinations.length === 0 ? (
            <EmptyState
              icon={Syringe}
              title="No vaccination records"
              description="Records you add appear here. Atronz stores them exactly as entered."
            />
          ) : (
            <ul className="space-y-2">
              {vaccinations.map((record) => (
                <li
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cream-200 bg-cream-50 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal-800">
                      {record.name}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {record.dueLabel}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      VACCINATION_TONE[record.status],
                    )}
                  >
                    {VACCINATION_LABEL[record.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Medical history placeholder */}
        <Section icon={FileText} title="Medical history">
          <EmptyState
            icon={FileText}
            title="No medical records stored"
            description="Atronz does not hold clinical records. Ask your veterinary clinic for the full history."
          />
        </Section>

        {/* Owner-provided food information */}
        <Section icon={ClipboardList} title="Food and owner notes">
          {profile &&
          (profile.preferredFood ||
            profile.allergies.length > 0 ||
            profile.restrictions.length > 0 ||
            profile.notes) ? (
            <dl className="space-y-2">
              <Chips
                icon={ClipboardList}
                label="Preferred food"
                values={profile.preferredFood ? [profile.preferredFood] : []}
              />
              <Chips icon={Ban} label="Allergies" values={profile.allergies} />
              <Chips
                icon={ClipboardList}
                label="Restrictions"
                values={profile.restrictions}
              />
              <Chips
                icon={FileText}
                label="Notes"
                values={profile.notes ? [profile.notes] : []}
              />
            </dl>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Nothing recorded yet"
              description={`No food preferences or restrictions are on file for ${pet.name}.`}
            />
          )}
        </Section>

        {/* Recent alerts */}
        <Section icon={TriangleAlert} title="Recent alerts">
          {alerts.length === 0 ? (
            <EmptyState
              icon={TriangleAlert}
              title="No alerts"
              description={`${pet.name} has nothing flagged right now.`}
            />
          ) : (
            <ul className="space-y-2">
              {alerts.slice(0, 4).map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-xl border border-cream-200 bg-cream-50 p-3"
                >
                  <p className="text-sm font-medium text-charcoal-800">
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-xs text-charcoal-500">
                    {alert.description} · {alert.timestamp}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Recent care history */}
        <Section icon={ClipboardList} title="Recent care history">
          <TimelineList events={timeline} limit={5} />
        </Section>

        <p className="flex items-start gap-2 rounded-xl border border-cream-200 bg-cream-50 p-3 text-xs leading-relaxed text-charcoal-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Allergies, restrictions, vaccination records and notes are provided by
          you. Atronz stores them as written and does not medically assess or
          verify them. Contact your veterinarian for clinical advice.
        </p>
      </div>
    </Modal>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-charcoal-400">
        {label}
      </dt>
      <dd className="truncate text-charcoal-700">{value}</dd>
    </div>
  );
}

function Chips({
  icon: Icon,
  label,
  values,
}: {
  icon: typeof ShieldCheck;
  label: string;
  values: string[];
}) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-cream-200 bg-cream-50 p-2.5">
      <Icon
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal-400"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] uppercase tracking-wide text-charcoal-400">
          {label}
        </dt>
        <dd className="mt-1">
          {values.length === 0 ? (
            <span className="text-sm text-charcoal-400">None recorded</span>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {values.map((value) => (
                <li
                  key={value}
                  className="rounded-full border border-cream-300 bg-white px-2 py-0.5 text-xs text-charcoal-700"
                >
                  {value}
                </li>
              ))}
            </ul>
          )}
        </dd>
      </div>
    </div>
  );
}
