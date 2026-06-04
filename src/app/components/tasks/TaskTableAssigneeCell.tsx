import type { Task } from '../../types';
import { resolveTaskAssigneeRow } from '../../utils/task-assignees';
import { resolveTaskCompletionAttribution } from '../../utils/taskCompletionAttribution';
import { TaskAssigneeIdentity } from './TaskAssigneeIdentity';
import { TaskCompletionContributorAvatar } from './TaskCompletionContributorAvatar';

export function TaskTableAssigneeCell({
  task,
  queueTeamId,
}: {
  task: Task;
  queueTeamId?: string;
}) {
  const assignee = resolveTaskAssigneeRow(task, { queueTeamId });
  const completion = resolveTaskCompletionAttribution(task);
  const completionLine = completion ? `${completion.verb} by ${completion.label}` : null;

  return (
    <div className="group/assignee relative min-w-0 max-w-full">
      {assignee ? (
        <TaskAssigneeIdentity row={assignee} />
      ) : (
        <span className="text-[13px] font-medium text-text-muted">Unassigned</span>
      )}

      {completion && completionLine ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden min-w-[148px] items-center gap-2 rounded-lg border border-border-soft bg-white px-2.5 py-2 shadow-[0_4px_14px_rgba(27,28,30,0.12)] group-hover/assignee:flex"
        >
          <TaskCompletionContributorAvatar attribution={completion} />
          <span className="text-[11px] font-semibold leading-snug text-text-primary">{completionLine}</span>
        </div>
      ) : null}
    </div>
  );
}
