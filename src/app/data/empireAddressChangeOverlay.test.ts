import { describe, expect, it } from 'vitest';
import { EMPIRE_DATASET } from './empire-dataset';
import { EMPIRE_DATASET_ID } from './empireDemoCaseIds';
import {
  applyEmpireAddressChangeOverlay,
  TASK_EMP_ADDR_001_ID,
} from './empireAddressChangeOverlay';
import { getSystemDataset, listTasks } from './objectRepository';
import { pinAddressChangeReviewTaskFirst } from '../utils/sort-tasks';
import type { Task } from '../types';

describe('empireAddressChangeOverlay', () => {
  it('injects the address change task first on the Empire dataset', () => {
    const withoutTask = {
      ...EMPIRE_DATASET,
      tasks: EMPIRE_DATASET.tasks.filter((row) => row.id !== TASK_EMP_ADDR_001_ID),
    };
    const next = applyEmpireAddressChangeOverlay(withoutTask);
    expect(next.tasks[0]?.id).toBe(TASK_EMP_ADDR_001_ID);
    expect(next.tasks[0]?.caseId).toBeUndefined();
    expect(next.requests.some((row) => row.id === 'REQ-EMP-2026-007')).toBe(true);
  });

  it('preserves completed status on workspace copies', () => {
    const copyId = `${EMPIRE_DATASET_ID}-workspace-copy-test`;
    const completed = applyEmpireAddressChangeOverlay({
      ...EMPIRE_DATASET,
      id: copyId,
      tasks: EMPIRE_DATASET.tasks.map((row) =>
        row.id === TASK_EMP_ADDR_001_ID ? { ...row, status: 'Completed' } : row,
      ),
    });
    expect(completed.tasks.find((row) => row.id === TASK_EMP_ADDR_001_ID)?.status).toBe('Completed');
  });

  it('loads through getSystemDataset with the address task available for sorting', () => {
    const dataset = getSystemDataset(EMPIRE_DATASET_ID);
    const addressTask = listTasks(dataset).find((row) => row.id === TASK_EMP_ADDR_001_ID);
    expect(addressTask).toBeDefined();
    expect(addressTask?.caseSubtype).toBe('address_change');

    const sorted = pinAddressChangeReviewTaskFirst([
      { id: 'task_emp_di_003', caseId: 'CLM-DI-2026-0214', status: 'In Queue' } as Task,
      { id: TASK_EMP_ADDR_001_ID, status: 'In Queue', taskType: 'Review address change request' } as Task,
    ]);
    expect(sorted[0].id).toBe(TASK_EMP_ADDR_001_ID);
  });
});
