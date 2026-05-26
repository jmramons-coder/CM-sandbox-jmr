import { describe, expect, it } from 'vitest';
import { buildRequestActionContext } from './buildContext';
import { resolveWorkflowProfile } from './workflowProfile';
import { resolveRequestPanelActions } from './resolvePanelActions';
import type { ServiceRequest, Task } from '../../types';

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
  templateId: 'address_change',
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

describe('objectWorkflow', () => {
  it('resolves simple service profile from template and category', () => {
    const profile = resolveWorkflowProfile({
      category: 'Address Change',
      templateId: 'address_change',
    });
    expect(profile.scope).toBe('simple_service');
    expect(profile.pattern).toBe('task_then_request');
    expect(profile.outcomes.onTaskComplete).toContain('apply_mailing_address');
  });

  it('shows complete task while service task is open', () => {
    const ctx = buildRequestActionContext(
      baseRequest,
      [openTask],
      { documentId: 'doc-1', status: 'Received', summary: { label: 'Doc', status: 'Received', text: '' } } as never,
    );
    const panel = resolveRequestPanelActions(ctx);
    expect(panel.navigation.some((item) => item.id.startsWith('nav-task'))).toBe(true);
    expect(panel.actions.some((item) => item.execution.type === 'mutation' && item.execution.action === 'complete_task')).toBe(true);
    expect(panel.actions.some((item) => item.execution.type === 'workflow' && item.execution.action === 'complete')).toBe(false);
  });

  it('shows one task nav chip when many tasks are linked', () => {
    const ctx = buildRequestActionContext(
      { ...baseRequest, linkedTasks: ['task-1', 'task-2', 'task-3'] },
      [
        openTask,
        { ...openTask, id: 'task-2', taskType: 'Follow up', status: 'To do' },
        { ...openTask, id: 'task-3', taskType: 'Archive', status: 'Completed' },
      ],
      null,
    );
    const panel = resolveRequestPanelActions(ctx);
    const taskNav = panel.navigation.filter((item) => item.id.startsWith('nav-task'));
    expect(taskNav).toHaveLength(1);
    expect(taskNav[0]?.id).toBe('nav-task-task-2');
  });

  it('shows complete request after task is done', () => {
    const ctx = buildRequestActionContext(baseRequest, [{ ...openTask, status: 'Completed' }], null);
    const panel = resolveRequestPanelActions(ctx);
    expect(panel.actions.find((item) => item.execution.type === 'workflow' && item.execution.action === 'complete')?.label).toBe(
      'Complete request',
    );
  });

  it('shows only navigation when request is completed', () => {
    const ctx = buildRequestActionContext({ ...baseRequest, status: 'Completed' }, [openTask], null);
    const panel = resolveRequestPanelActions(ctx);
    expect(panel.actions).toHaveLength(0);
    expect(panel.navigation.length).toBeGreaterThan(0);
  });
});
