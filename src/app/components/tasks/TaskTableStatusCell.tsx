import type { Task } from '../../types';
import { getStatusLozengeType } from '../../utils/status-display';
import { LozengeTag } from '../LozengeTag';

/** Status column — lozenge only (assignee / completion live in Assignee column). */
export function TaskTableStatusCell({ task }: { task: Task }) {
  return (
    <LozengeTag label={task.status} type={getStatusLozengeType(task.status, 'task')} subtle />
  );
}
