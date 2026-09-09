import { useEffect, useId, useState } from 'react';
import {
  FormErrorSummary,
  FormField,
  inputClass,
} from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import type { NewMealDraft } from '@/context/AppDataContext';
import { cn } from '@/lib/utils';
import type { MealCategory } from '@/types';

export interface LogFoodDialogProps {
  open: boolean;
  onClose: () => void;
  petName?: string;
  onSubmit: (draft: NewMealDraft) => void;
}

interface FormState {
  name: string;
  foodType: string;
  quantity: string;
  unit: string;
  calories: string;
  category: MealCategory;
  time: string;
  isTreat: boolean;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const FOOD_TYPES = ['Dry food', 'Wet food', 'Raw', 'Home cooked', 'Treat'];
const UNITS = ['g', 'ml', 'cup', 'piece', 'pieces'];
const CATEGORIES: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'treat'];

const CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  treat: 'Treat',
};

function currentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function emptyForm(): FormState {
  return {
    name: '',
    foodType: FOOD_TYPES[0],
    quantity: '',
    unit: 'g',
    calories: '',
    category: 'breakfast',
    time: currentTime(),
    isTreat: false,
    notes: '',
  };
}

/**
 * Fully controlled log-food form. Every field lives in React state because the
 * submitted values become application data, and validation runs on submit.
 */
export function LogFoodDialog({
  open,
  onClose,
  petName,
  onSubmit,
}: LogFoodDialogProps) {
  const formId = useId();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Start from a clean form each time the dialog opens.
  useEffect(() => {
    if (open) {
      setForm(emptyForm());
      setErrors({});
    }
  }, [open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = 'Enter a food name.';
    if (!form.foodType) next.foodType = 'Choose a food type.';

    const quantity = Number(form.quantity);
    if (!form.quantity.trim()) {
      next.quantity = 'Enter a quantity.';
    } else if (!Number.isFinite(quantity) || quantity <= 0) {
      next.quantity = 'Quantity must be greater than zero.';
    }

    if (!form.unit) next.unit = 'Choose a unit.';
    if (!form.time) next.time = 'Enter a time.';

    if (form.calories.trim()) {
      const calories = Number(form.calories);
      if (!Number.isFinite(calories) || calories < 0) {
        next.calories = 'Calories must be a positive number.';
      }
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
      foodType: form.foodType,
      quantity: Number(form.quantity),
      unit: form.unit,
      calories: form.calories.trim() ? Number(form.calories) : null,
      category: form.isTreat ? 'treat' : form.category,
      time: form.time,
      isTreat: form.isTreat,
      notes: form.notes,
    });
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log food"
      description={
        petName
          ? `Record a meal or treat for ${petName}.`
          : 'Record a meal or treat.'
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="submit"
            form={formId}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700"
          >
            Log food
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

        <FormField label="Food name" error={errors.name} required>
          {(id, describedBy) => (
            <input
              id={id}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Morning kibble"
              aria-describedby={describedBy}
              aria-invalid={Boolean(errors.name)}
              className={inputClass(Boolean(errors.name))}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Food type" error={errors.foodType} required>
            {(id, describedBy) => (
              <select
                id={id}
                value={form.foodType}
                onChange={(e) => set('foodType', e.target.value)}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.foodType))}
              >
                {FOOD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField label="Meal time" error={errors.time} required>
            {(id, describedBy) => (
              <input
                id={id}
                type="time"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
                aria-describedby={describedBy}
                aria-invalid={Boolean(errors.time)}
                className={inputClass(Boolean(errors.time))}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Quantity" error={errors.quantity} required>
            {(id, describedBy) => (
              <input
                id={id}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                placeholder="310"
                aria-describedby={describedBy}
                aria-invalid={Boolean(errors.quantity)}
                className={inputClass(Boolean(errors.quantity))}
              />
            )}
          </FormField>

          <FormField label="Unit" error={errors.unit} required>
            {(id, describedBy) => (
              <select
                id={id}
                value={form.unit}
                onChange={(e) => set('unit', e.target.value)}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.unit))}
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField label="Calories" hint="optional" error={errors.calories}>
            {(id, describedBy) => (
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={form.calories}
                onChange={(e) => set('calories', e.target.value)}
                placeholder="590"
                aria-describedby={describedBy}
                aria-invalid={Boolean(errors.calories)}
                className={inputClass(Boolean(errors.calories))}
              />
            )}
          </FormField>
        </div>

        <FormField
          label="Meal category"
          hint={form.isTreat ? 'set to Treat' : undefined}
        >
          {(id, describedBy) => (
            <select
              id={id}
              value={form.isTreat ? 'treat' : form.category}
              disabled={form.isTreat}
              onChange={(e) => set('category', e.target.value as MealCategory)}
              aria-describedby={describedBy}
              className={cn(
                inputClass(false),
                form.isTreat && 'cursor-not-allowed opacity-60',
              )}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <label className="flex items-start gap-2.5 rounded-xl border border-cream-300 bg-cream-50 p-3">
          <input
            type="checkbox"
            checked={form.isTreat}
            onChange={(e) => set('isTreat', e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-cream-300 text-sage-600 accent-sage-600"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-charcoal-800">
              This is a treat
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-charcoal-500">
              Treats count towards calories but not towards the planned meal
              count.
            </span>
          </span>
        </label>

        <FormField label="Notes" hint="optional">
          {(id) => (
            <textarea
              id={id}
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Fed after the afternoon walk."
              className={cn(inputClass(false), 'resize-y')}
            />
          )}
        </FormField>
      </form>
    </Modal>
  );
}
