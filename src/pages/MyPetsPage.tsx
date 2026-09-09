import { useCallback, useMemo, useState } from 'react';
import { ArchiveRestore, PawPrint, Plus } from 'lucide-react';
import { PageHeading } from '@/components/layout/PageHeading';
import { PetCard } from '@/components/pets/PetCard';
import { PetFormDialog } from '@/components/pets/PetFormDialog';
import { PetProfileDialog } from '@/components/pets/PetProfileDialog';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/AppDataContext';
import type { PetDraft } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import { petSubtitle } from '@/lib/utils';
import type { Pet } from '@/types';

type DialogState =
  | { kind: 'none' }
  | { kind: 'add' }
  | { kind: 'edit'; pet: Pet }
  | { kind: 'profile'; pet: Pet }
  | { kind: 'archive'; pet: Pet };

/**
 * The household screen. Adding a pet creates a genuinely empty record — no
 * collar, no tray, no meals, no alerts — so every other screen falls into its
 * own "no data yet" state rather than inventing readings.
 */
export function MyPetsPage() {
  const {
    status,
    error,
    reload,
    pets,
    archivedPets,
    selectedPetId,
    selectPet,
    scoreFor,
    petDetail,
    addPet,
    updatePet,
    archivePet,
    restorePet,
  } = useAppData();
  const { showToast } = useToast();

  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const close = useCallback(() => setDialog({ kind: 'none' }), []);

  const loading = status === 'loading';
  const canArchive = pets.length > 1;

  const activeDetail = useMemo(
    () =>
      dialog.kind === 'profile' || dialog.kind === 'edit'
        ? petDetail(dialog.pet.id)
        : null,
    [dialog, petDetail],
  );

  const handleSelect = useCallback(
    (pet: Pet) => {
      selectPet(pet.id);
      showToast({
        tone: 'success',
        title: `${pet.name} selected`,
        description: 'Every screen now shows this pet.',
      });
    },
    [selectPet, showToast],
  );

  const handleAdd = useCallback(
    (draft: PetDraft) => {
      const message = addPet(draft);
      close();
      if (!message) return;
      showToast({
        tone: 'success',
        title: message,
        description:
          'Readings appear once a device is paired or food is logged.',
      });
    },
    [addPet, close, showToast],
  );

  const handleEdit = useCallback(
    (petId: string, draft: PetDraft) => {
      const message = updatePet(petId, draft);
      close();
      if (!message) return;
      showToast({
        tone: 'success',
        title: message,
        description: 'Recorded activity, meals and litter data were kept.',
      });
    },
    [updatePet, close, showToast],
  );

  const handleArchive = useCallback(
    (pet: Pet) => {
      const message = archivePet(pet.id);
      close();
      if (!message) return;
      showToast({
        tone: 'info',
        title: message,
        description: 'Their data is kept — restore them from Archived pets.',
      });
    },
    [archivePet, close, showToast],
  );

  const handleRestore = useCallback(
    (pet: Pet) => {
      const message = restorePet(pet.id);
      if (!message) return;
      showToast({ tone: 'success', title: message });
    },
    [restorePet, showToast],
  );

  const handleConnectDevice = useCallback(() => {
    showToast({
      tone: 'info',
      title: 'Device pairing is not available yet',
      description:
        'Collar and tray pairing arrives with the Atronz hardware app.',
    });
  }, [showToast]);

  if (status === 'error') {
    return (
      <div>
        <PageHeading eyebrow="My Pets" title="My Pets" />
        <Card className="mx-auto max-w-2xl">
          <EmptyState
            icon={PawPrint}
            title="We could not load your pets"
            description={error ?? 'Please try again.'}
            actionLabel="Retry"
            onAction={reload}
            className="border-0 bg-transparent"
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* 1 — Page heading */}
      <PageHeading
        eyebrow="My Pets"
        title="Your household"
        description={
          loading
            ? 'Loading your household…'
            : `${pets.length} active pet${pets.length === 1 ? '' : 's'} on this account${
                archivedPets.length > 0
                  ? ` · ${archivedPets.length} archived`
                  : ''
              }.`
        }
        action={
          !loading ? (
            <button
              type="button"
              onClick={() => setDialog({ kind: 'add' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add pet
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <Card key={key} className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
            </Card>
          ))}
        </div>
      ) : pets.length === 0 ? (
        /* 9 — Empty state */
        <Card className="mx-auto max-w-2xl">
          <EmptyState
            icon={PawPrint}
            title="No active pets yet"
            description="Add a pet to track activity, rest, nutrition and litter in one place, with a daily wellness score and alerts when something changes."
            actionLabel="Add your first pet"
            onAction={() => setDialog({ kind: 'add' })}
            className="border-0 bg-transparent"
          />
        </Card>
      ) : (
        /* 2 — Pet cards */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pets.map((pet) => {
            const detail = petDetail(pet.id);
            return (
              <PetCard
                key={pet.id}
                pet={pet}
                score={scoreFor(pet.id)}
                device={detail.device}
                litterDevice={detail.litterDevice}
                selected={pet.id === selectedPetId}
                canArchive={canArchive}
                onSelect={() => handleSelect(pet)}
                onViewProfile={() => setDialog({ kind: 'profile', pet })}
                onEdit={() => setDialog({ kind: 'edit', pet })}
                onArchive={() => setDialog({ kind: 'archive', pet })}
              />
            );
          })}

          <Card
            tone="muted"
            padded={false}
            className="border-dashed transition hover:border-sage-300"
          >
            <button
              type="button"
              onClick={() => setDialog({ kind: 'add' })}
              className="flex h-full min-h-[12rem] w-full flex-col items-center justify-center gap-2 rounded-2xl p-5 text-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sage-600 ring-1 ring-cream-300">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-charcoal-700">
                Add a pet
              </span>
              <span className="max-w-[14rem] text-xs text-charcoal-500">
                Set up a profile now and pair a device later.
              </span>
            </button>
          </Card>
        </div>
      )}

      {/* 8 — Archived pets keep their data and can be restored */}
      {archivedPets.length > 0 ? (
        <section className="mt-8">
          <SectionHeader
            title="Archived pets"
            description="Hidden from the active list. All of their data is kept."
          />
          <ul className="space-y-2">
            {archivedPets.map((pet) => (
              <li key={pet.id}>
                <Card className="flex flex-wrap items-center gap-3">
                  <Avatar name={pet.name} src={pet.photoUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-charcoal-800">
                      {pet.name}
                    </p>
                    <p className="truncate text-xs text-charcoal-500">
                      {petSubtitle(pet)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestore(pet)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-charcoal-700 transition hover:border-sage-200 hover:bg-sage-50"
                  >
                    <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
                    Restore
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 4 + 5 — Add and edit share one controlled form */}
      <PetFormDialog
        open={dialog.kind === 'add'}
        onClose={close}
        onSubmit={handleAdd}
      />
      <PetFormDialog
        open={dialog.kind === 'edit'}
        onClose={close}
        pet={dialog.kind === 'edit' ? dialog.pet : null}
        profile={activeDetail?.foodProfile}
        onSubmit={(draft) => {
          if (dialog.kind === 'edit') handleEdit(dialog.pet.id, draft);
        }}
      />

      {/* 6 — Profile details */}
      <PetProfileDialog
        open={dialog.kind === 'profile'}
        onClose={close}
        pet={dialog.kind === 'profile' ? dialog.pet : null}
        score={dialog.kind === 'profile' ? scoreFor(dialog.pet.id) : null}
        profile={activeDetail?.foodProfile ?? null}
        vaccinations={activeDetail?.vaccinations ?? []}
        device={activeDetail?.device ?? null}
        litterDevice={activeDetail?.litterDevice ?? null}
        timeline={activeDetail?.timeline ?? []}
        alerts={activeDetail?.alerts ?? []}
        onConnectDevice={handleConnectDevice}
      />

      {/* 8 — Archive confirmation */}
      <ConfirmDialog
        open={dialog.kind === 'archive'}
        onClose={close}
        onConfirm={() => {
          if (dialog.kind === 'archive') handleArchive(dialog.pet);
        }}
        title={
          dialog.kind === 'archive'
            ? `Archive ${dialog.pet.name}?`
            : 'Archive pet'
        }
        confirmLabel="Archive pet"
        tone="caution"
      >
        <p className="text-sm leading-relaxed text-charcoal-600">
          {dialog.kind === 'archive' ? dialog.pet.name : 'This pet'} will be
          hidden from the active list and the pet selector. Nothing is deleted —
          activity, meals, litter events, alerts and history are all kept, and
          you can restore them at any time from the Archived pets section.
        </p>
      </ConfirmDialog>

      <p className="mt-8 text-xs leading-relaxed text-charcoal-400">
        Allergies, dietary restrictions, vaccination records and notes are
        information you provide. Atronz stores them as written and does not
        medically assess or verify them.
      </p>
    </div>
  );
}
