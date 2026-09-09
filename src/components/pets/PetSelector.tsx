import { useCallback, useRef, useState } from 'react';
import { Check, ChevronDown, PawPrint } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/AppDataContext';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn, petSubtitle } from '@/lib/utils';

export interface PetSelectorProps {
  className?: string;
}

/** Dropdown that switches the pet every screen in the app is scoped to. */
export function PetSelector({ className }: PetSelectorProps) {
  const { pets, selectedPet, selectPet, status } = useAppData();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useOnClickOutside(containerRef, close, open);

  if (status === 'loading') {
    return <Skeleton className={cn('h-11 w-40 rounded-full', className)} />;
  }

  if (!selectedPet) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-dashed border-cream-300 px-3 py-2 text-sm text-charcoal-500',
          className,
        )}
      >
        <PawPrint className="h-4 w-4" aria-hidden="true" />
        No pets yet
      </span>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-full border border-cream-300 bg-white py-1.5 pl-1.5 pr-2.5 text-left shadow-sm transition hover:border-sage-200 sm:pr-3"
      >
        <Avatar name={selectedPet.name} src={selectedPet.photoUrl} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight text-charcoal-800">
            {selectedPet.name}
          </span>
          <span className="block truncate text-xs leading-tight text-charcoal-400">
            {selectedPet.breed}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-charcoal-400 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Select a pet"
          className="absolute right-0 z-40 mt-2 w-[min(17rem,calc(100vw-2rem))] animate-fade-in overflow-hidden rounded-2xl border border-cream-300 bg-white p-1.5 shadow-pop"
        >
          <p className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal-400">
            Your pets
          </p>
          {pets.map((pet) => {
            const active = pet.id === selectedPet.id;
            return (
              <button
                key={pet.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  selectPet(pet.id);
                  close();
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition',
                  active ? 'bg-sage-50' : 'hover:bg-cream-100',
                )}
              >
                <Avatar name={pet.name} src={pet.photoUrl} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-charcoal-800">
                    {pet.name}
                  </span>
                  <span className="block truncate text-xs text-charcoal-400">
                    {petSubtitle(pet)}
                  </span>
                </span>
                {active ? (
                  <Check
                    className="h-4 w-4 shrink-0 text-sage-600"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
