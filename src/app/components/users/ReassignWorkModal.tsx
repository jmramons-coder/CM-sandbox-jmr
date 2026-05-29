import { useMemo, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { RadioButton } from '../ds';
import { ModuleModalShell } from '../ModuleModalShell';
import type { PlatformUser, UserDirectoryRow } from '../../domain/access/platformUser';
import type { Task } from '../../types';
import { isUserBlockedOnDate, listAvailabilityBlocks } from '../../data/userAvailabilityStore';

type ReassignScope = 'all' | 'work_type' | 'selected';

type ReassignWorkModalProps = {
  open: boolean;
  fromUser: UserDirectoryRow;
  tasks: Task[];
  candidates: UserDirectoryRow[];
  datasetId: string;
  onClose: () => void;
  onConfirm: (input: { toUser: PlatformUser; taskIds: string[]; reason: string }) => void;
};

export function ReassignWorkModal({
  open,
  fromUser,
  tasks,
  candidates,
  datasetId,
  onClose,
  onConfirm,
}: ReassignWorkModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [scope, setScope] = useState<ReassignScope>('all');
  const [workType, setWorkType] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [reason, setReason] = useState('');

  const workTypes = useMemo(() => {
    const types = new Set(tasks.map((task) => task.taskType).filter(Boolean));
    return Array.from(types).sort();
  }, [tasks]);

  const scopedTasks = useMemo(() => {
    if (scope === 'work_type' && workType) {
      return tasks.filter((task) => task.taskType === workType);
    }
    return tasks;
  }, [scope, tasks, workType]);

  const targetUser = candidates.find((row) => row.id === toUserId);

  const warnings = useMemo(() => {
    if (!targetUser) return [];
    const lines: string[] = [];
    if (targetUser.blockedToday) lines.push(`${targetUser.name} is blocked from new assignments today.`);
    if (targetUser.workload.capacityPct >= 100) {
      lines.push(`${targetUser.name} is at ${targetUser.workload.capacityPct}% capacity.`);
    }
    const authorityMismatches = scopedTasks.filter(
      (task) => task.requiredAuthorityLevel > targetUser.band,
    ).length;
    if (authorityMismatches > 0) {
      lines.push(
        `${authorityMismatches} task(s) require authority band ${Math.max(...scopedTasks.map((t) => t.requiredAuthorityLevel))} — target is band ${targetUser.band}.`,
      );
    }
    if (targetUser.trainingAlert) {
      lines.push('Target has training credentials expiring soon.');
    }
    return lines;
  }, [scopedTasks, targetUser]);

  const selectableCandidates = candidates.filter((row) => {
    if (row.id === fromUser.id) return false;
    const blocks = listAvailabilityBlocks(datasetId, row.id);
    return !isUserBlockedOnDate(blocks, today);
  });

  if (!open) return null;

  return (
    <ModuleModalShell
      open={open}
      onClose={onClose}
      panelClassName="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-border-default bg-white shadow-xl"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border-default px-5 py-4">
          <h2 className="text-base font-semibold text-text-heading">Reassign work — {fromUser.name}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-text-muted hover:bg-surface-muted" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <fieldset className="space-y-2" role="radiogroup" aria-label="Reassign scope">
            <legend className="text-xs font-semibold uppercase tracking-wide text-text-muted">Scope</legend>
            <button
              type="button"
              role="radio"
              aria-checked={scope === 'all'}
              onClick={() => setScope('all')}
              className="flex w-full items-center gap-2 text-left text-sm"
            >
              <RadioButton checked={scope === 'all'} aria-label="All open work" />
              All open work ({tasks.length} tasks)
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={scope === 'work_type'}
              onClick={() => setScope('work_type')}
              className="flex w-full items-center gap-2 text-left text-sm"
            >
              <RadioButton checked={scope === 'work_type'} aria-label="By task type" />
              By task type
            </button>
            {scope === 'work_type' ? (
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="ml-6 w-[calc(100%-1.5rem)] rounded-lg border border-border-default px-3 py-2 text-sm"
              >
                <option value="">Select task type…</option>
                {workTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            ) : null}
          </fieldset>

          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Reassign to
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-default px-3 py-2 text-sm font-normal normal-case"
              required
            >
              <option value="">Select teammate…</option>
              {selectableCandidates.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} — {row.workload.openTasks} open · {row.workload.capacityPct}% capacity
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Reason (optional)
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-default px-3 py-2 text-sm font-normal normal-case"
              placeholder="e.g. PTO coverage, workload rebalance"
            />
          </label>

          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{scopedTasks.length}</span> task(s) will move to{' '}
            {targetUser?.name ?? 'the selected user'}.
          </p>

          {warnings.length > 0 ? (
            <div className="rounded-lg border border-brand-orange/30 bg-[#fff8f0] px-3 py-2 text-sm text-text-primary">
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-brand-orange">
                <AlertTriangle className="size-4" aria-hidden />
                Review before confirming
              </div>
              <ul className="list-inside list-disc space-y-0.5 text-[13px]">
                {warnings.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-border-default px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border-default px-4 py-2 text-xs font-semibold uppercase text-text-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!toUserId || scopedTasks.length === 0}
            onClick={() => {
              const toUser = candidates.find((row) => row.id === toUserId);
              if (!toUser) return;
              onConfirm({
                toUser,
                taskIds: scopedTasks.map((task) => task.id),
                reason,
              });
            }}
            className="rounded-full bg-brand-blue px-4 py-2 text-xs font-bold uppercase text-white hover:bg-brand-blue-hover disabled:opacity-50"
          >
            Reassign {scopedTasks.length} task(s)
          </button>
        </div>
    </ModuleModalShell>
  );
}
