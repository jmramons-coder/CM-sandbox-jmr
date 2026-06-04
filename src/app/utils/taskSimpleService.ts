import type { DatasetTaskRecord } from '../data/multi-case-dataset';
import type { Task } from '../types';

export function isSimpleServiceTask(
  task: Pick<Task, 'caseType' | 'caseSubtype'> | Pick<DatasetTaskRecord, 'caseType' | 'caseSubtype'>,
): boolean {
  return (
    task.caseType === 'Service'
    || task.caseSubtype === 'address_change'
    || task.caseSubtype === 'beneficiary_change'
  );
}

export function isAddressChangeServiceTask(
  task: Pick<Task, 'caseSubtype' | 'taskType' | 'id' | 'taskId'>,
): boolean {
  const id = task.taskId ?? task.id;
  if (id === 'task_ps_addr_001' || id === 'task_emp_addr_001') return true;
  return task.caseSubtype === 'address_change' || /\baddress change\b/i.test(task.taskType ?? '');
}
