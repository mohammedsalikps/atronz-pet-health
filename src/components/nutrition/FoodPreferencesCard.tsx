import { useNavigate } from 'react-router-dom';
import { Ban, ClipboardList, Cookie, Heart, NotebookPen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { FoodProfile } from '@/types';

export interface FoodPreferencesCardProps {
  petName?: string;
  profile?: FoodProfile | null;
  loading?: boolean;
  className?: string;
}

/**
 * Owner-recorded food profile. Atronz displays exactly what was entered and
 * never infers or assesses food sensitivities.
 */
export function FoodPreferencesCard({
  petName,
  profile,
  loading = false,
  className,
}: FoodPreferencesCardProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className={cn('flex flex-col gap-3', className)}>
        <Skeleton className="h-4 w-40" />
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-12 w-full rounded-xl" />
        ))}
      </Card>
    );
  }

  const hasAnything =
    Boolean(profile) &&
    (Boolean(profile!.preferredFood) ||
      profile!.allergies.length > 0 ||
      profile!.restrictions.length > 0 ||
      profile!.treatPreferences.length > 0 ||
      Boolean(profile!.notes));

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Preferences and restrictions"
        description="Recorded by you — Atronz does not assess food sensitivities"
      />

      {!hasAnything ? (
        <EmptyState
          icon={ClipboardList}
          title="Nothing recorded yet"
          description={
            petName
              ? `No food preferences or restrictions are on file for ${petName}.`
              : 'No food preferences or restrictions are on file.'
          }
          actionLabel="Open pet profile"
          onAction={() => navigate('/pets')}
        />
      ) : (
        <dl className="space-y-2.5">
          <Row
            icon={Heart}
            label="Preferred food"
            values={profile!.preferredFood ? [profile!.preferredFood] : []}
          />
          <Row icon={Ban} label="Allergies" values={profile!.allergies} />
          <Row
            icon={ClipboardList}
            label="Dietary restrictions"
            values={profile!.restrictions}
          />
          <Row
            icon={Cookie}
            label="Treat preferences"
            values={profile!.treatPreferences}
          />
          <Row
            icon={NotebookPen}
            label="Notes"
            values={profile!.notes ? [profile!.notes] : []}
          />
        </dl>
      )}
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  values,
}: {
  icon: LucideIcon;
  label: string;
  values: string[];
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-cream-200 bg-cream-50 p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-charcoal-500 ring-1 ring-cream-300">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-charcoal-400">
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
