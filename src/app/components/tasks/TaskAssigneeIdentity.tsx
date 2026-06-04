import { CircularAiAvatar, TABLE_SUBTEXT_CLASS } from '../ModuleCellHelpers';
import type { TaskAssigneeRowModel } from '../../utils/task-assignees';
import { cn } from '../ui/utils';

function assigneeInitials(name: string, initials?: string) {
  if (initials?.trim()) return initials.trim().slice(0, 2).toUpperCase();
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Matches Requests module requester column: avatar + name + role subtitle. */
export function TaskAssigneeIdentity({
  row,
  className,
}: {
  row: TaskAssigneeRowModel;
  className?: string;
}) {
  return (
    <span className={cn('flex min-w-0 items-center gap-2', className)}>
      {row.kind === 'ai' ? (
        <CircularAiAvatar size="sm" className="!size-6 shrink-0" />
      ) : (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-selected text-[10px] font-semibold text-brand-blue">
          {assigneeInitials(row.name, row.initials)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-text-primary">{row.name}</span>
        <span className={`block truncate ${TABLE_SUBTEXT_CLASS}`}>{row.subtitle}</span>
      </span>
    </span>
  );
}
