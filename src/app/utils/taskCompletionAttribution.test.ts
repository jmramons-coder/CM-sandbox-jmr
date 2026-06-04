import { describe, expect, it } from 'vitest';
import { resolveTaskCompletionAttribution } from './taskCompletionAttribution';

describe('resolveTaskCompletionAttribution', () => {
  it('returns null for open tasks', () => {
    expect(
      resolveTaskCompletionAttribution({
        status: 'In Queue',
        assignedTo: 'Victor Ramon',
        taskType: 'Review letter',
        origin: 'Manual',
      }),
    ).toBeNull();
  });

  it('attributes AI-owned completed tasks to AI', () => {
    expect(
      resolveTaskCompletionAttribution({
        status: 'Completed',
        assignedTo: 'AI Agent',
        aiGenerated: true,
        taskType: 'AI: verify beneficiary & ownership',
        origin: 'Initial triage',
      }),
    ).toEqual({ actor: 'ai', label: 'AI', verb: 'Completed' });
  });

  it('attributes human completed tasks to the assignee', () => {
    expect(
      resolveTaskCompletionAttribution({
        status: 'Completed',
        assignedTo: 'Victor Ramon',
        aiGenerated: false,
        taskType: 'Order surgical report',
        origin: 'Req. gathering',
      }),
    ).toEqual({ actor: 'human', label: 'Victor Ramon', verb: 'Completed' });
  });

  it('uses Approved for completed semi-auto human tasks', () => {
    expect(
      resolveTaskCompletionAttribution({
        status: 'Completed',
        assignedTo: 'Victor Ramon',
        aiGenerated: true,
        taskType: 'Review address change',
        executionMode: 'semi_auto',
        origin: 'AI',
      }),
    ).toEqual({ actor: 'human', label: 'Victor Ramon', verb: 'Approved' });
  });
});
