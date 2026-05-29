import { useState } from 'react';
import { X } from 'lucide-react';
import { ModuleModalShell } from '../ModuleModalShell';
import { Checkbox } from '../ui/checkbox';
import type { AvailabilityBlockReason } from '../../domain/access/platformUser';

type AvailabilityBlockModalProps = {
  open: boolean;
  userName: string;
  onClose: () => void;
  onSubmit: (input: {
    startDate: string;
    endDate: string;
    reason: AvailabilityBlockReason;
    notes: string;
    blocksAssignment: boolean;
  }) => void;
};

const REASONS: { value: AvailabilityBlockReason; label: string }[] = [
  { value: 'pto', label: 'PTO / vacation' },
  { value: 'sick', label: 'Sick leave' },
  { value: 'training', label: 'Training' },
  { value: 'meeting', label: 'Meetings / off desk' },
  { value: 'reduced_capacity', label: 'Reduced capacity' },
  { value: 'other', label: 'Other' },
];

export function AvailabilityBlockModal({ open, userName, onClose, onSubmit }: AvailabilityBlockModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState<AvailabilityBlockReason>('pto');
  const [notes, setNotes] = useState('');
  const [blocksAssignment, setBlocksAssignment] = useState(true);

  if (!open) return null;

  return (
    <ModuleModalShell
      open={open}
      onClose={onClose}
      labelledBy="availability-block-title"
      panelClassName="w-full max-w-md rounded-xl border border-border-default bg-white shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <h2 id="availability-block-title" className="text-base font-semibold text-text-heading">
            Block availability — {userName}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-text-muted hover:bg-surface-muted" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <form
          className="space-y-4 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ startDate, endDate, reason, notes, blocksAssignment });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-text-secondary">
              Start
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-default px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block text-xs font-medium text-text-secondary">
              End
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-default px-3 py-2 text-sm"
                required
              />
            </label>
          </div>
          <label className="block text-xs font-medium text-text-secondary">
            Reason
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as AvailabilityBlockReason)}
              className="mt-1 w-full rounded-lg border border-border-default px-3 py-2 text-sm"
            >
              {REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-text-secondary">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border-default px-3 py-2 text-sm"
              placeholder="Optional context for the team"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
            <Checkbox
              checked={blocksAssignment}
              onCheckedChange={(checked) => setBlocksAssignment(checked === true)}
            />
            Prevent new task assignments during this period
          </label>
          <div className="flex justify-end gap-2 border-t border-border-default pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border-default px-4 py-2 text-xs font-semibold uppercase text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-brand-blue px-4 py-2 text-xs font-bold uppercase text-white hover:bg-brand-blue-hover"
            >
              Save block
            </button>
          </div>
        </form>
    </ModuleModalShell>
  );
}
