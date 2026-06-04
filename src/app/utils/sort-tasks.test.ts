import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { pinAddressChangeReviewTaskFirst, sortTasks } from './sort-tasks';

const baseTask = (overrides: Partial<Task> & Pick<Task, 'id' | 'status'>): Task => ({
  priority: 'NORMAL',
  caseType: 'CLM',
  taskType: 'Other task',
  hasAI: false,
  claimantName: 'Test',
  product: 'Life',
  slaRemaining: '2d',
  slaStatus: 'normal',
  assignedTo: 'User',
  origin: 'Manual',
  createdDate: '2026-01-01',
  queue: 'my_tasks',
  requiredAuthorityLevel: 1,
  caseId: 'CLM-001',
  ...overrides,
});

describe('sort-tasks', () => {
  it('pins the no-case address change review task first under default sort', () => {
    const addressChange = baseTask({
      id: 'task_ps_addr_001',
      taskType: 'Review address change request',
      status: 'In Queue',
      caseType: 'Service',
      caseSubtype: 'address_change',
      caseId: undefined,
      priority: 'HIGH',
    });
    const urgentQueued = baseTask({ id: 't-urgent', status: 'To Do', priority: 'URGENT' });
    const sorted = sortTasks([urgentQueued, addressChange], null, 'asc');
    expect(sorted[0].id).toBe('task_ps_addr_001');
  });

  it('pinAddressChangeReviewTaskFirst is a no-op when task is already first', () => {
    const addressChange = baseTask({
      id: 'task_ps_addr_001',
      taskType: 'Review address change request',
      status: 'In Queue',
      caseId: undefined,
    });
    const rows = pinAddressChangeReviewTaskFirst([addressChange, baseTask({ id: 't2', status: 'To Do' })]);
    expect(rows[0].id).toBe('task_ps_addr_001');
  });
});
