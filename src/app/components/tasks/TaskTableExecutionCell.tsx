import type { Task } from '../../types';
import { inferTaskExecutionModeFromTask, taskExecutionModeLabel } from '../../utils/taskReviewProjection';

const EXECUTION_BADGE_CLASS: Record<string, string> = {
  Human: 'bg-surface-muted text-text-secondary',
  Automated: 'bg-[#eef4ff] text-brand-blue',
  'AI-assisted': 'bg-brand-accent-light text-brand-accent',
  'Needs review': 'bg-[#fff4e6] text-[#8a5a00]',
};

export function TaskTableExecutionCell({ task }: { task: Task }) {
  const mode = inferTaskExecutionModeFromTask(task);
  const label = taskExecutionModeLabel(mode, task.assignedTo);
  if (!label) return <span className="text-text-muted">—</span>;

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${EXECUTION_BADGE_CLASS[label] ?? 'bg-surface-muted text-text-secondary'}`}
    >
      {label}
    </span>
  );
}
