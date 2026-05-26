import { describe, expect, it } from 'vitest';
import { resolveRequestPanelFooter } from './requestPanelFooter';
import type { ServiceRequest, Task } from '../types';

const baseRequest: ServiceRequest = {
  id: 'REQ-1',
  title: 'Address change',
  category: 'Address Change',
  status: 'In progress',
  priority: 'Normal',
  requester: 'Nora',
  received: 'May 14',
  due: 'May 17',
  aiSummary: 'Test',
  linkedTasks: ['task-1'],
};

const openTask: Task = {
  id: 'task-1',
  taskType: 'Review address',
  status: 'In progress',
  priority: 'Normal',
  assignee: 'Victor',
  caseType: 'Service',
  caseSubtype: 'address_change',
  dueDate: '2026-05-17',
  stage: 'policy_service',
  hasAI: true,
  linkedObjects: [],
};

describe('resolveRequestPanelFooter', () => {
  it('shows nav + complete task while service task is open', () => {
    const model = resolveRequestPanelFooter(
      baseRequest,
      [openTask],
      { documentId: 'doc-1', status: 'Received', summary: { label: 'Doc', status: 'Received', text: '' } } as never,
      { onOpenEvidence: () => undefined, taskPath: (id) => `/tasks#task=${id}`, folderPath: (id) => `/folders/${id}` },
    );
    expect(model.nav.some((item) => item.id.startsWith('nav-task'))).toBe(true);
    expect(model.completeTaskId).toBe('task-1');
    expect(model.workflow.some((item) => item.action === 'complete')).toBe(false);
    expect(model.markEvidenceReviewed).toBe(true);
  });

  it('shows complete request after task is done', () => {
    const model = resolveRequestPanelFooter(
      baseRequest,
      [{ ...openTask, status: 'Completed' }],
      null,
      { onOpenEvidence: () => undefined, taskPath: (id) => `/tasks#task=${id}`, folderPath: (id) => `/folders/${id}` },
    );
    expect(model.completeTaskId).toBeUndefined();
    expect(model.workflow[0]?.action).toBe('complete');
  });

  it('shows only nav when request is completed', () => {
    const model = resolveRequestPanelFooter(
      { ...baseRequest, status: 'Completed' },
      [openTask],
      null,
      { onOpenEvidence: () => undefined, taskPath: (id) => `/tasks#task=${id}`, folderPath: (id) => `/folders/${id}` },
    );
    expect(model.workflow).toHaveLength(0);
    expect(model.nav.length).toBeGreaterThan(0);
  });
});
