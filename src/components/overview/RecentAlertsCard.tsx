import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { AlertSeverity, PetAlert } from '@/types';

export interface RecentAlertsCardProps {
  alerts: PetAlert[];
  petName?: string;
  unreadCount: number;
  loading?: boolean;
  onMarkRead: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  /** Overridable so the card can be reused for a single alert category. */
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Omit to hide the "View all" link, e.g. on the Health screen itself. */
  showViewAll?: boolean;
  className?: string;
}

const SEVERITY_ICON: Record<AlertSeverity, LucideIcon> = {
  info: Info,
  warning: TriangleAlert,
  critical: TriangleAlert,
};

const SEVERITY_TONE: Record<AlertSeverity, string> = {
  info: 'bg-sage-50 text-sage-600',
  warning: 'bg-amber-50 text-amber-600',
  critical: 'bg-red-50 text-red-600',
};

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Urgent',
};

/** Recent alerts for the selected pet, with read and dismiss controls. */
export function RecentAlertsCard({
  alerts,
  petName,
  unreadCount,
  loading = false,
  onMarkRead,
  onDismiss,
  title = 'Recent alerts',
  description,
  emptyTitle = 'No recent alerts',
  emptyDescription,
  showViewAll = true,
  className,
}: RecentAlertsCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={cn('flex flex-col', className)}>
      <SectionHeader
        title={title}
        description={
          description ??
          (petName
            ? unreadCount > 0
              ? `${unreadCount} unread for ${petName}`
              : `Nothing unread for ${petName}`
            : undefined)
        }
        action={
          showViewAll ? (
            <button
              type="button"
              onClick={() => navigate('/health')}
              className="rounded-full px-2 py-1 text-sm font-medium text-sage-600 transition hover:bg-sage-50 hover:text-sage-700"
            >
              View all
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <ul className="space-y-3">
          {[0, 1, 2].map((key) => (
            <li key={key} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={emptyTitle}
          description={
            emptyDescription ??
            (petName
              ? `${petName} has nothing that needs your attention today. New signals appear here as they are detected.`
              : 'Nothing needs your attention today.')
          }
        />
      ) : (
        <ul className="-mx-1 divide-y divide-cream-200">
          {alerts.map((alert) => {
            const Icon = SEVERITY_ICON[alert.severity];
            return (
              <li
                key={alert.id}
                className={cn(
                  'flex gap-3 rounded-xl px-1 py-3 transition first:pt-0',
                  !alert.read && 'bg-sage-50/40',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    SEVERITY_TONE[alert.severity],
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p
                      className={cn(
                        'text-sm text-charcoal-800',
                        alert.read ? 'font-medium' : 'font-semibold',
                      )}
                    >
                      {alert.title}
                    </p>
                    <span className="rounded-full bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-charcoal-500">
                      {SEVERITY_LABEL[alert.severity]}
                    </span>
                    {!alert.read ? (
                      <span className="rounded-full bg-sage-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sage-700">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm leading-snug text-charcoal-500">
                    {alert.description}
                  </p>
                  <p className="mt-1 text-xs text-charcoal-400">
                    {petName ? `${petName} · ` : ''}
                    {alert.timestamp}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  {!alert.read ? (
                    <button
                      type="button"
                      onClick={() => onMarkRead(alert.id)}
                      aria-label={`Mark "${alert.title}" as read`}
                      title="Mark as read"
                      className="rounded-full p-1.5 text-charcoal-400 transition hover:bg-sage-50 hover:text-sage-700"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDismiss(alert.id)}
                    aria-label={`Dismiss "${alert.title}"`}
                    title="Dismiss"
                    className="rounded-full p-1.5 text-charcoal-400 transition hover:bg-cream-100 hover:text-charcoal-700"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
