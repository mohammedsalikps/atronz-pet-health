import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useAppData } from '@/context/AppDataContext';
import { cn, petSubtitle } from '@/lib/utils';

export interface PetPickerDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The "Add pet" quick action. Registering a new Atronz device is part of a
 * later onboarding step, so the dialog does the useful half now — switching
 * between the pets already on the account — and is explicit about the rest.
 */
export function PetPickerDialog({ open, onClose }: PetPickerDialogProps) {
  const { pets, selectedPetId, selectPet, scoreFor } = useAppData();
  const navigate = useNavigate();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Your pets"
      description="Switch the pet Atronz is tracking, or add another from My Pets."
      footer={
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/pets');
          }}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50"
        >
          Manage pets
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      }
    >
      <ul className="space-y-2">
        {pets.map((pet) => {
          const active = pet.id === selectedPetId;
          const score = scoreFor(pet.id);
          return (
            <li key={pet.id}>
              <button
                type="button"
                onClick={() => {
                  selectPet(pet.id);
                  onClose();
                }}
                aria-pressed={active}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                  active
                    ? 'border-sage-300 bg-sage-50'
                    : 'border-cream-300 bg-white hover:border-sage-200 hover:bg-cream-50',
                )}
              >
                <Avatar name={pet.name} src={pet.photoUrl} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-charcoal-800">
                    {pet.name}
                  </span>
                  <span className="block truncate text-xs text-charcoal-500">
                    {petSubtitle(pet)}
                  </span>
                </span>
                {score ? (
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-charcoal-700">
                    {score.score}
                  </span>
                ) : null}
                {active ? (
                  <Check
                    className="h-4 w-4 shrink-0 text-sage-600"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed border-cream-300 bg-cream-50 p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sage-600 ring-1 ring-cream-300">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-charcoal-800">
            Add another pet
          </p>
          <p className="mt-0.5 text-xs leading-snug text-charcoal-500">
            Set up a new pet profile from My Pets. Device pairing arrives with
            the Atronz hardware app.
          </p>
        </div>
      </div>
    </Modal>
  );
}
