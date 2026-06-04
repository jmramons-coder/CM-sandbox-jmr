import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SYSTEM_DATASETS } from './multi-case-dataset';
import { createSimpleServiceRequest } from './datasetMutations';
import {
  executeTaskAction,
  executeRequestAction,
  isTaskCompleteActionSuccess,
  runTaskWorkflowAction,
} from './workflowActions';
import { listTasks, listRequests } from './objectRepository';
import { datasetRegistry } from './datasetRegistry';

describe('workflowActions — address change', () => {
  const source = SYSTEM_DATASETS[0];

  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });
  });

  it('creates a simple-service request with linked service task', () => {
    const result = createSimpleServiceRequest(source.id, {
      title: 'Mailing address change — Test Client',
      workflowId: 'address_change',
      clientId: 'CLI-SBLI-006',
      policyNumber: 'SBLI-TL-2022-007316',
      requester: 'Nora Whitfield',
      newAddress: '9 Willow Court, Cambridge MA 02139',
      currentAddress: '42 Brookline Ave, Boston MA 02215',
      assignedTo: 'Victor Ramon',
    });

    const { request, task } = result.record;
    expect(request.status).toBe('In progress');
    expect(request.templateId).toBe('address_change');
    expect(request.linkedTasks).toContain(task.id);
    expect(task.caseType).toBe('Service');
    expect(task.caseSubtype).toBe('address_change');
    expect(task.linkedObjects.some((ref) => ref.kind === 'request' && ref.id === request.id)).toBe(true);
    expect(task.linkedObjects.some((ref) => ref.kind === 'client')).toBe(true);
    expect(task.linkedObjects.some((ref) => ref.kind === 'policy')).toBe(true);
  });

  it('completes address change task and cascades to request + client address', () => {
    const created = createSimpleServiceRequest(source.id, {
      title: 'Mailing address change — Cascade Test',
      workflowId: 'address_change',
      clientId: 'CLI-SBLI-007',
      policyNumber: 'SBLI-TL-2020-008905',
      newAddress: '100 New Lane, Boston MA 02110',
      currentAddress: '18 Oak Ridge Ln',
      assignedTo: 'Victor Ramon',
    });

    const taskId = created.record.task.id;
    const requestId = created.record.request.id;
    const datasetId = created.datasetId;

    const actionResult = executeTaskAction(datasetId, taskId, 'complete', { name: 'Victor Ramon' });
    const dataset = datasetRegistry.getDataset(actionResult.datasetId);

    expect(actionResult.record.task?.status).toBe('Completed');
    expect(actionResult.record.request?.status).toBe('Completed');
    expect(dataset.clients.find((row) => row.id === 'CLI-SBLI-007')?.profile?.address).toBe(
      '100 New Lane, Boston MA 02110',
    );
    expect((actionResult.record.request?.humanActions ?? []).length).toBeGreaterThan(0);
  });

  it('sets request to pending info when task request_info action runs', () => {
    const created = createSimpleServiceRequest(source.id, {
      title: 'Mailing address change — Pending info',
      workflowId: 'address_change',
      clientId: 'CLI-SBLI-006',
      policyNumber: 'SBLI-TL-2022-007316',
      newAddress: '9 Willow Court, Cambridge MA 02139',
      assignedTo: 'Victor Ramon',
    });

    const result = executeTaskAction(created.datasetId, created.record.task.id, 'request_info', {
      name: 'Victor Ramon',
    });

    expect(result.record.request?.status).toBe('Pending info');
    expect(result.record.task?.status).toBe('In progress');
  });

  it('start_review advances request from manual create', () => {
    const created = createSimpleServiceRequest(source.id, {
      title: 'Review start test',
      workflowId: 'address_change',
      clientId: 'CLI-SBLI-006',
      policyNumber: 'SBLI-TL-2022-007316',
      newAddress: '1 Main St',
      assignedTo: 'Victor Ramon',
    });

    const review = executeRequestAction(created.datasetId, created.record.request.id, 'start_review', {
      name: 'Victor Ramon',
    });

    expect(review.record?.status).toBe('In progress');
    expect((review.record?.humanActions ?? []).length).toBeGreaterThan(0);
  });

  it('completes seed address change task from built-in dataset', () => {
    const datasetId = SYSTEM_DATASETS[0].id;
    const actionResult = executeTaskAction(datasetId, 'task_ps_addr_001', 'complete', { name: 'Victor Ramon' });
    expect(actionResult.record.task?.status).toBe('Completed');
    expect(isTaskCompleteActionSuccess(actionResult, 'task_ps_addr_001')).toBe(true);
    expect(actionResult.datasetId).not.toBe(datasetId);
    const persisted = listTasks(actionResult.dataset).find((row) => row.id === 'task_ps_addr_001');
    expect(persisted?.status).toMatch(/completed/i);
  });

  it('completes semi-auto underwriting task task_nb4041', () => {
    const actionResult = executeTaskAction(SYSTEM_DATASETS[0].id, 'task_nb4041', 'complete', { name: 'Sarah Chen' });
    expect(actionResult.record.task?.status).toBe('Completed');
    expect(isTaskCompleteActionSuccess(actionResult)).toBe(true);
  });

  it('re-completing address change on same workspace copy still succeeds', () => {
    const first = executeTaskAction(SYSTEM_DATASETS[0].id, 'task_ps_addr_001', 'complete', { name: 'Victor Ramon' });
    expect(isTaskCompleteActionSuccess(first)).toBe(true);
    const second = executeTaskAction(first.datasetId, 'task_ps_addr_001', 'complete', { name: 'Victor Ramon' });
    expect(isTaskCompleteActionSuccess(second)).toBe(true);
    expect(second.record.task?.status).toBe('Completed');
  });

  it('runTaskWorkflowAction resolves task by display taskId', () => {
    const actionResult = runTaskWorkflowAction(SYSTEM_DATASETS[0].id, 'task_ps_addr_001', 'complete', {
      name: 'Victor Ramon',
    });
    expect(actionResult).not.toBeNull();
    expect(isTaskCompleteActionSuccess(actionResult!)).toBe(true);
  });

  it('runTaskWorkflowAction completes when activeDatasetId no longer exists in registry', () => {
    const actionResult = runTaskWorkflowAction(
      'multi-case-demo-workspace-copy-deleted',
      'task_ps_addr_001',
      'complete',
      { name: 'Victor Ramon' },
    );
    expect(actionResult).not.toBeNull();
    expect(isTaskCompleteActionSuccess(actionResult!, 'task_ps_addr_001')).toBe(true);
  });

  it('seed address change task remains valid in repository', () => {
    const dataset = SYSTEM_DATASETS[0];
    const task = listTasks(dataset).find((row) => row.id === 'task_ps_addr_001');
    const request = listRequests(dataset).find((row) => row.id === 'REQ-2026-005');
    expect(task?.caseSubtype).toBe('address_change');
    expect(request?.category).toBe('Address Change');
    expect(request?.linkedTasks).toContain('task_ps_addr_001');
  });
});
