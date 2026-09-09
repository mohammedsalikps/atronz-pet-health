import {
  Clock,
  Moon,
  RadioTower,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { TimelineEvent, TimelineEventType } from '@/types';

export interface ActivityTimelineCardProps {
  events: TimelineEvent[];
  petName?: string;
  loading?: boolean;
  /** How many events to show inline; the rest live in care history. */
  limit?: number;
  onViewAll?: () => void;
  className?: string;
}

const TYPE_ICON: Record<TimelineEventType, LucideIcon> = {
  meal: UtensilsCrossed,
  collar: RadioTower,
  rest: Moon,
  litter: Sparkles,
  score: ShieldCheck,
  alert: TriangleAlert,
};

const TYPE_TONE: Record<TimelineEventType, string> = {
  meal: 'bg-sage-50 text-sage-600',
  collar: 'bg-cream-200 text-charcoal-600',
  rest: 'bg-sage-50 text-sage-600',
  litter: 'bg-cream-200 text-charcoal-600',
  score: 'bg-sage-100 text-sage-700',
  alert: 'bg-amber-50 text-amber-600',
};

export interface TimelineListProps {
  events: TimelineEvent[];
  loading?: boolean;
  limit?: number;
  /** Ring colour behind each node — match the surface the list sits on. */
  ringClassName?: string;
}

/** The timeline itself, reused inside the card and the care-history dialog. */
export function TimelineList({
  events,
  loading = false,
  limit,
  ringClassName = 'ring-white',
}: TimelineListProps) {
  const visible = limit === undefined ? events : events.slice(0, limit);

  if (loading) {
    return (
      <ul className="space-y-4">
        {[0, 1, 2, 3].map((key) => (
          <li key={key} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Nothing recorded yet"
        description="Meals, collar syncs and rest periods will appear here as they happen."
      />
    );
  }

  return (
    <ol className="relative">
      {visible.map((event, index) => {
        const Icon = TYPE_ICON[event.type];
        const isLast = index === visible.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast ? (
              <span
                className="absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px bg-cream-300"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-4',
                ringClassName,
                TYPE_TONE[event.type],
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-medium text-charcoal-800">
                  {event.title}
                </p>
                <span className="shrink-0 text-xs text-charcoal-400">
                  {event.timestamp}
                </span>
              </div>
              <p className="mt-0.5 text-sm leading-snug text-charcoal-500">
                {event.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Compact chronological feed for the selected pet. */
export function ActivityTimelineCard({
  events,
  petName,
  loading = false,
  limit = 6,
  onViewAll,
  className,
}: ActivityTimelineCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title="Recent activity"
        description={petName ? `Today's timeline for ${petName}` : undefined}
        action={
          onViewAll && events.length > 0 ? (
            <button
              type="button"
              onClick={onViewAll}
              className="rounded-full px-2 py-1 text-sm font-medium text-sage-600 transition hover:bg-sage-50 hover:text-sage-700"
            >
              Care history
            </button>
          ) : undefined
        }
      />

      <TimelineList events={events} loading={loading} limit={limit} />
    </Card>
  );
}
