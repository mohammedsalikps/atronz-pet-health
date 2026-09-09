import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Shared empty / not-applicable state so no panel ever renders blank. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-cream-300 bg-cream-50 px-4 py-8 text-center',
        className,
      )}
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-charcoal-400 ring-1 ring-cream-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-charcoal-700">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-sm text-charcoal-500">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-full border border-sage-200 bg-white px-4 py-1.5 text-sm font-medium text-sage-700 transition hover:bg-sage-50"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
