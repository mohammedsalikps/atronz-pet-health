import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Centred dialog on desktop, bottom sheet on mobile — the pattern Android
 * users expect, and it keeps the close control inside thumb reach.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-charcoal-900/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'safe-bottom relative z-10 flex max-h-[85vh] w-full flex-col animate-fade-in',
          'rounded-t-3xl border border-cream-300 bg-white shadow-pop',
          'sm:max-w-lg sm:rounded-3xl',
        )}
      >
        <div className="flex items-start gap-3 border-b border-cream-200 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight text-charcoal-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-charcoal-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-m-1 shrink-0 rounded-full p-1.5 text-charcoal-400 transition hover:bg-cream-100 hover:text-charcoal-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-cream-200 p-4 sm:p-5">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
