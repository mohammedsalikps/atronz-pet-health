import { useCallback, useRef, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppData } from '@/context/AppDataContext';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn } from '@/lib/utils';
import type { AlertSeverity } from '@/types';

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  info: 'bg-sage-400',
  warning: 'bg-amber-400',
  critical: 'bg-red-500',
};

/** Bell in the top header plus the notification panel it opens. */
export function NotificationButton({ className }: { className?: string }) {
  const {
    notifications,
    unreadCount,
    markAllNotificationsRead,
    markNotificationRead,
  } = useAppData();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useOnClickOutside(containerRef, close, open);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-white text-charcoal-600 shadow-sm transition hover:border-sage-200 hover:text-charcoal-800"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-sage-600 px-1 text-[10px] font-semibold text-white ring-2 ring-cream-100">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          /* The panel is right-anchored to the bell, which itself sits ~5rem
             from the right edge on mobile (gutter + avatar + gap). Clamping to
             `100vw - 5rem` keeps its left edge on screen at 320px. */
          className="absolute right-0 z-40 mt-2 w-[min(20rem,calc(100vw-5rem))] animate-fade-in overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-pop sm:w-80"
        >
          <div className="flex items-center justify-between gap-3 border-b border-cream-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-charcoal-800">
              Notifications
            </h3>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-xs font-medium text-sage-600 transition hover:text-sage-700"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto app-scrollbar">
            {notifications.length === 0 ? (
              <EmptyState
                icon={BellOff}
                title="You are all caught up"
                description="New health signals will show up here."
                className="m-3 border-0 bg-transparent"
              />
            ) : (
              <ul className="divide-y divide-cream-200">
                {notifications.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => markNotificationRead(note.id)}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition hover:bg-cream-50',
                        !note.read && 'bg-sage-50/60',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          note.read
                            ? 'bg-cream-300'
                            : SEVERITY_DOT[note.severity],
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-charcoal-800">
                          {note.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-charcoal-500">
                          {note.description}
                        </span>
                        <span className="mt-1 block text-xs text-charcoal-400">
                          {note.timestamp}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
