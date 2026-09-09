import type { ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** `caution` styles the confirm button for a reversible but notable action. */
  tone?: 'default' | 'caution';
  children?: ReactNode;
}

/** Small confirmation modal, reusing the shared bottom-sheet Modal. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'inline-flex flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white transition',
              tone === 'caution'
                ? 'bg-clay hover:bg-clay/90'
                : 'bg-sage-600 hover:bg-sage-700',
            )}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-cream-50"
          >
            {cancelLabel}
          </button>
        </div>
      }
    >
      {children}
    </Modal>
  );
}
