import { ArrowRight, Cat, Dog, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import type { Pet } from '@/types';

export interface LitterNotApplicableCardProps {
  pet: Pet;
  /** A pet on the account that does have a tray, if there is one. */
  suggestion: Pet | null;
  onSelectSuggestion: (petId: string) => void;
  className?: string;
}

/**
 * Shown for pets with no paired litter box. Litter tracking is not forced onto
 * dogs — the screen explains why and offers a route to a pet that has a tray.
 */
export function LitterNotApplicableCard({
  pet,
  suggestion,
  onSelectSuggestion,
  className,
}: LitterNotApplicableCardProps) {
  const SpeciesIcon = pet.species === 'cat' ? Cat : Dog;

  return (
    <Card className={cn('mx-auto max-w-2xl text-center', className)}>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-charcoal-500">
        <SpeciesIcon className="h-6 w-6" aria-hidden="true" />
      </span>

      <h2 className="mt-4 text-lg font-semibold tracking-tight text-charcoal-900">
        Litter tracking does not apply to {pet.name}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-charcoal-500">
        {pet.name} is a {pet.breed} with no connected litter box. Atronz tracks
        litter activity only for pets paired with a compatible smart tray, so
        there is nothing to show here rather than an empty chart.
      </p>

      <ul className="mx-auto mt-5 max-w-sm space-y-1.5 text-left">
        {[
          'Litter data needs a paired Atronz Smart Tray',
          'Cats on this account with a tray get the full dashboard',
          'Activity, rest and nutrition are tracked for every pet',
        ].map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm text-charcoal-600"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>

      {suggestion ? (
        <button
          type="button"
          onClick={() => onSelectSuggestion(suggestion.id)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700 sm:w-auto"
        >
          <Avatar
            name={suggestion.name}
            src={suggestion.photoUrl}
            size="sm"
            className="ring-white/30"
          />
          Switch to {suggestion.name}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed border-cream-300 bg-cream-50 px-4 py-2 text-sm text-charcoal-500">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          No pet on this account has a litter box paired yet.
        </p>
      )}
    </Card>
  );
}
