import { useEffect, useId, useState } from 'react';
import { Info } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { FormErrorSummary, FormField, inputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import type { PetDraft } from '@/context/AppDataContext';
import { cn } from '@/lib/utils';
import type { FoodProfile, Pet, PetSex, Species } from '@/types';

export interface PetFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Provide a pet to edit; omit to add a new one. */
  pet?: Pet | null;
  profile?: FoodProfile | null;
  onSubmit: (draft: PetDraft) => void;
}

interface FormState {
  name: string;
  species: Species;
  breed: string;
  ageYears: string;
  ageMonths: string;
  sex: PetSex;
  weightKg: string;
  photoUrl: string;
  vetClinic: string;
  preferredFood: string;
  allergies: string;
  restrictions: string;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const SPECIES: Species[] = ['dog', 'cat'];
const SEXES: PetSex[] = ['female', 'male'];

const SPECIES_LABELS: Record<Species, string> = { dog: 'Dog', cat: 'Cat' };
const SEX_LABELS: Record<PetSex, string> = { female: 'Female', male: 'Male' };

function emptyForm(): FormState {
  return {
    name: '',
    species: 'dog',
    breed: '',
    ageYears: '',
    ageMonths: '0',
    sex: 'female',
    weightKg: '',
    photoUrl: '',
    vetClinic: '',
    preferredFood: '',
    allergies: '',
    restrictions: '',
    notes: '',
  };
}

function formFor(pet: Pet, profile: FoodProfile | null | undefined): FormState {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    ageYears: String(pet.ageYears),
    ageMonths: String(pet.ageMonths),
    sex: pet.sex,
    weightKg: String(pet.weightKg),
    photoUrl: pet.photoUrl ?? '',
    vetClinic: pet.vetClinic,
    preferredFood: profile?.preferredFood ?? '',
    allergies: profile?.allergies.join(', ') ?? '',
    restrictions: profile?.restrictions.join(', ') ?? '',
    notes: profile?.notes ?? '',
  };
}

/**
 * One controlled form serving both "Add pet" and "Edit pet". Species is fixed
 * once a pet exists, because the whole telemetry model keys off it.
 */
export function PetFormDialog({
  open,
  onClose,
  pet,
  profile,
  onSubmit,
}: PetFormDialogProps) {
  const formId = useId();
  const isEdit = Boolean(pet);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;
    setForm(pet ? formFor(pet, profile) : emptyForm());
    setErrors({});
  }, [open, pet, profile]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = 'Enter a name.';
    if (!form.species) next.species = 'Choose a species.';
    if (!form.breed.trim()) next.breed = 'Enter a breed.';

    const years = Number(form.ageYears);
    if (!form.ageYears.trim()) {
      next.ageYears = 'Enter an age in years.';
    } else if (!Number.isFinite(years) || years < 0 || years > 40) {
      next.ageYears = 'Age must be between 0 and 40 years.';
    }

    const months = Number(form.ageMonths);
    if (
      form.ageMonths.trim() &&
      (!Number.isFinite(months) || months < 0 || months > 11)
    ) {
      next.ageMonths = 'Months must be between 0 and 11.';
    }

    const weight = Number(form.weightKg);
    if (!form.weightKg.trim()) {
      next.weightKg = 'Enter a weight in kg.';
    } else if (!Number.isFinite(weight) || weight <= 0) {
      next.weightKg = 'Weight must be greater than zero.';
    }
    return next;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim(),
      ageYears: Number(form.ageYears),
      ageMonths: form.ageMonths.trim() ? Number(form.ageMonths) : 0,
      sex: form.sex,
      weightKg: Number(form.weightKg),
      photoUrl: form.photoUrl,
      vetClinic: form.vetClinic,
      preferredFood: form.preferredFood,
      allergies: form.allergies,
      restrictions: form.restrictions,
      notes: form.notes,
    });
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${pet!.name}` : 'Add a pet'}
      description={
        isEdit
          ? 'Update the profile. Recorded activity, meals and litter data are kept.'
          : 'New pets start with no readings until a device is paired or food is logged.'
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="submit"
            form={formId}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700"
          >
            {isEdit ? 'Save changes' : 'Add pet'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-cream-50"
          >
            Cancel
          </button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormErrorSummary count={errorCount} />

        <div className="flex items-center gap-3 rounded-xl border border-cream-300 bg-cream-50 p-3">
          <Avatar
            name={form.name || 'New pet'}
            src={form.photoUrl.trim() || undefined}
            size="lg"
            shape="rounded"
          />
          <p className="min-w-0 text-xs leading-snug text-charcoal-500">
            Paste a photo URL below, or leave it blank to use an initials
            placeholder.
          </p>
        </div>

        <FormField label="Name" error={errors.name} required>
          {(id, describedBy) => (
            <input
              id={id}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Buddy"
              aria-describedby={describedBy}
              aria-invalid={Boolean(errors.name)}
              className={inputClass(Boolean(errors.name))}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Species"
            error={errors.species}
            required
            hint={isEdit ? 'fixed after creation' : undefined}
          >
            {(id, describedBy) => (
              <select
                id={id}
                value={form.species}
                disabled={isEdit}
                onChange={(e) => set('species', e.target.value as Species)}
                aria-describedby={describedBy}
                className={cn(
                  inputClass(Boolean(errors.species)),
                  isEdit && 'cursor-not-allowed opacity-60',
                )}
              >
                {SPECIES.map((value) => (
                  <option key={value} value={value}>
                    {SPECIES_LABELS[value]}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField label="Breed" error={errors.breed} required>
            {(id, describedBy) => (
              <input
                id={id}
                value={form.breed}
                onChange={(e) => set('breed', e.target.value)}
                placeholder="Golden Retriever"
                aria-describedby={describedBy}
                aria-invalid={Boolean(errors.breed)}
                className={inputClass(Boolean(errors.breed))}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FormField label="Age (yrs)" error={errors.ageYears} required>
            {(id, describedBy) => (
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min="0"
                max="40"
                value={form.ageYears}
                onChange={(e) => set('ageYears', e.target.value)}
                placeholder="4"
                aria-describedby={describedBy}
                aria-invalid={Boolean(errors.ageYears)}
                className={inputClass(Boolean(errors.ageYears))}
              />
            )}
          </FormField>

          <FormField label="Months" error={errors.ageMonths}>
            {(id, describedBy) => (
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min="0"
                max="11"
                value={form.ageMonths}
                onChange={(e) => set('ageMonths', e.target.value)}
                aria-describedby={describedBy}
                aria-invalid={Boolean(errors.ageMonths)}
                className={inputClass(Boolean(errors.ageMonths))}
              />
            )}
          </FormField>

          <FormField label="Gender">
            {(id) => (
              <select
                id={id}
                value={form.sex}
                onChange={(e) => set('sex', e.target.value as PetSex)}
                className={inputClass(false)}
              >
                {SEXES.map((value) => (
                  <option key={value} value={value}>
                    {SEX_LABELS[value]}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField label="Weight (kg)" error={errors.weightKg} required>
            {(id, describedBy) => (
              <input
                id={id}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={form.weightKg}
                onChange={(e) => set('weightKg', e.target.value)}
                placeholder="31.2"
                aria-describedby={describedBy}
                aria-invalid={Boolean(errors.weightKg)}
                className={inputClass(Boolean(errors.weightKg))}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Photo URL" hint="optional">
            {(id) => (
              <input
                id={id}
                type="url"
                value={form.photoUrl}
                onChange={(e) => set('photoUrl', e.target.value)}
                placeholder="https://…"
                className={inputClass(false)}
              />
            )}
          </FormField>

          <FormField label="Veterinary clinic" hint="optional">
            {(id) => (
              <input
                id={id}
                value={form.vetClinic}
                onChange={(e) => set('vetClinic', e.target.value)}
                placeholder="Northside Veterinary Clinic"
                className={inputClass(false)}
              />
            )}
          </FormField>
        </div>

        <fieldset className="rounded-xl border border-cream-300 bg-cream-50 p-3">
          <legend className="px-1 text-sm font-medium text-charcoal-700">
            Food and owner notes
          </legend>

          <p className="mb-3 flex items-start gap-2 text-xs leading-snug text-charcoal-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Everything in this section is information you provide. Atronz stores
            it as written and does not assess or diagnose food sensitivities.
          </p>

          <div className="space-y-3">
            <FormField label="Preferred food" hint="optional">
              {(id) => (
                <input
                  id={id}
                  value={form.preferredFood}
                  onChange={(e) => set('preferredFood', e.target.value)}
                  placeholder="Atronz Adult Dry — Chicken & Rice"
                  className={inputClass(false)}
                />
              )}
            </FormField>

            <FormField
              label="Allergies you have recorded"
              hint="optional, comma separated"
            >
              {(id) => (
                <input
                  id={id}
                  value={form.allergies}
                  onChange={(e) => set('allergies', e.target.value)}
                  placeholder="Beef, wheat"
                  className={inputClass(false)}
                />
              )}
            </FormField>

            <FormField
              label="Dietary restrictions you have set"
              hint="optional, comma separated"
            >
              {(id) => (
                <input
                  id={id}
                  value={form.restrictions}
                  onChange={(e) => set('restrictions', e.target.value)}
                  placeholder="Grain-free food only"
                  className={inputClass(false)}
                />
              )}
            </FormField>

            <FormField label="Notes" hint="optional">
              {(id) => (
                <textarea
                  id={id}
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Eats faster when fed after a walk."
                  className={cn(inputClass(false), 'resize-y')}
                />
              )}
            </FormField>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
