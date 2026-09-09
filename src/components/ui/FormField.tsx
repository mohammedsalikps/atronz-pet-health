import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Shared input styling for every dialog form in the app. */
export function inputClass(hasError: boolean): string {
  return cn(
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-charcoal-800 transition placeholder:text-charcoal-400',
    hasError
      ? 'border-amber-300 bg-amber-50/40'
      : 'border-cream-300 hover:border-sage-200',
  );
}

export interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Receives the generated id and the error id to wire up ARIA. */
  children: (id: string, describedBy: string | undefined) => ReactNode;
}

/**
 * Label + control + inline error, with the `for`/`id` and `aria-describedby`
 * wiring handled once so every form field is announced correctly.
 */
export function FormField({
  label,
  hint,
  error,
  required = false,
  children,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium text-charcoal-700"
      >
        {label}
        {required ? (
          <span className="text-xs text-charcoal-400">
            required<span aria-hidden="true">*</span>
          </span>
        ) : null}
        {hint ? <span className="text-xs text-charcoal-400">{hint}</span> : null}
      </label>
      {children(id, error ? errorId : undefined)}
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-amber-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Summary banner shown at the top of a form when validation fails. */
export function FormErrorSummary({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
    >
      Please fix {count} field{count === 1 ? '' : 's'} below.
    </p>
  );
}
