import { TimelineList } from '@/components/overview/ActivityTimelineCard';
import { Modal } from '@/components/ui/Modal';
import type { TimelineEvent } from '@/types';

export interface CareHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  events: TimelineEvent[];
  petName?: string;
}

/** Full care history for the selected pet, reusing the timeline renderer. */
export function CareHistoryDialog({
  open,
  onClose,
  events,
  petName,
}: CareHistoryDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Care history"
      description={
        petName
          ? `Everything Atronz has recorded for ${petName}.`
          : 'Everything Atronz has recorded.'
      }
    >
      <TimelineList events={events} />
    </Modal>
  );
}
