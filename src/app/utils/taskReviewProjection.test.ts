import { describe, expect, it } from 'vitest';
import type { DatasetTaskRecord } from '../data/multi-case-dataset';
import {
  inferTaskExecutionMode,
  resolveTaskPanelActions,
  resolveTaskReview,
  resolveTaskTableAiDigest,
} from './taskReviewProjection';

describe('taskReviewProjection', () => {
  it('classifies AI review tasks as semi_auto', () => {
    const mode = inferTaskExecutionMode({
      label: 'Validate specialist diagnosis letter',
      status: 'In Queue',
      alert: null,
      aiGenerated: true,
      assignee: 'Victor Ramon',
      hasAI: true,
      aiSummary: 'Recommend full payout.',
      executionMode: undefined,
    });
    expect(mode).toBe('semi_auto');
  });

  it('classifies chase tasks as manual even with aiSummary', () => {
    const mode = inferTaskExecutionMode({
      label: 'Chase employer physician statement',
      status: 'In Queue',
      alert: { type: 'sla', message: 'Overdue' },
      aiGenerated: false,
      assignee: 'Victor Ramon',
      hasAI: true,
      aiSummary: 'Contact HR.',
      executionMode: undefined,
    });
    expect(mode).toBe('exception');
  });

  it('dedupes verdict from legacy fields', () => {
    const row = {
      id: 't1',
      kind: 'task',
      label: 'AI narrative task',
      status: 'Completed',
      priority: 'Normal',
      assignee: 'AI Agent',
      aiSummary: 'Same verdict.',
      aiNarrative: { text: 'Same verdict.', confidence: 91 },
      summary: {
        contextLabel: 'Task context',
        title: 'AI narrative task',
        description: 'Same verdict.',
        checklist: ['Review linked entities', 'Confirm ownership'],
      },
      linkedObjects: [],
    } satisfies DatasetTaskRecord;

    const review = resolveTaskReview(row);
    expect(review.verdict).toBe('Same verdict.');
    expect(review.confidence).toBe(91);
    expect(review.reasoning).toBeUndefined();
  });

  it('returns Approve and Amend for open semi_auto tasks', () => {
    const actions = resolveTaskPanelActions(
      {
        id: 't1',
        priority: 'NORMAL',
        caseType: 'CLM',
        taskType: 'Prepare decision',
        hasAI: true,
        claimantName: 'Test',
        product: 'Test',
        slaRemaining: '1d',
        slaStatus: 'normal',
        status: 'In Queue',
        assignedTo: 'User',
        origin: 'AI',
        createdDate: '2026-01-01',
        queue: 'my_tasks',
        requiredAuthorityLevel: 1,
        executionMode: 'semi_auto',
      },
      { isCompleted: false, hasEvidence: true },
    );
    expect(actions.map((a) => a.label)).toEqual(['Approve', 'Amend']);
  });

  it('lists crew step categories for semi-auto tasks', () => {
    const digest = resolveTaskTableAiDigest({
      id: 'task_ps_addr_001',
      priority: 'NORMAL',
      caseType: 'PS',
      taskType: 'Review address change',
      hasAI: true,
      aiGenerated: true,
      claimantName: 'Test',
      product: 'Test',
      slaRemaining: '1d',
      slaStatus: 'normal',
      status: 'In Queue',
      assignedTo: 'Victor Ramon',
      origin: 'AI',
      createdDate: '2026-01-01',
      queue: 'my_tasks',
      requiredAuthorityLevel: 1,
      executionMode: 'semi_auto',
      aiSummary:
        'Address change package is largely complete. Recommend approving after clarifying Suite 2 vs Apt 2 on the lease agreement before updating policy admin.',
    });
    expect(digest.kind).toBe('ai');
    expect(digest.items).toEqual(['Portal request intake', 'Registry verification', 'Route for review']);
    expect(digest.display).toBe('Portal request intake · Registry verification · Route for review');
    expect(digest.recommendation).toContain('Recommend approving');
    expect(digest.full).toContain('Approve:');
  });

  it('uses crew findings when only generic AI crew analysis exists', () => {
    const digest = resolveTaskTableAiDigest({
      id: 'task_generic_ai',
      priority: 'NORMAL',
      caseType: 'CLM',
      taskType: 'Validate specialist diagnosis letter',
      hasAI: true,
      aiGenerated: true,
      claimantName: 'Test',
      product: 'Test',
      slaRemaining: '1d',
      slaStatus: 'normal',
      status: 'In Queue',
      assignedTo: 'Victor Ramon',
      origin: 'AI',
      createdDate: '2026-01-01',
      queue: 'my_tasks',
      requiredAuthorityLevel: 1,
      executionMode: 'semi_auto',
      aiSummary: 'Invasive ductal carcinoma confirmed — meets Empire Life CI definition. Recommend full payout.',
      summary: {
        contextLabel: 'Task context',
        title: 'Validate specialist diagnosis letter',
        description: 'Invasive ductal carcinoma confirmed — meets Empire Life CI definition. Recommend full payout.',
        checklist: ['Specialist letter matches CI definition', 'Pathology corroborates staging', 'No exclusion riders apply'],
      },
    });
    expect(digest.items.length).toBeGreaterThan(1);
    expect(digest.items[0]).not.toBe('AI crew analysis');
    expect(digest.recommendation).toMatch(/Recommend full payout/i);
  });

  it('uses alert message when exception tasks have no crew categories', () => {
    const digest = resolveTaskTableAiDigest({
      id: 't2',
      priority: 'HIGH',
      caseType: 'CLM',
      taskType: 'Chase employer statement',
      hasAI: true,
      claimantName: 'Test',
      product: 'Test',
      slaRemaining: 'Overdue',
      slaStatus: 'warning',
      status: 'In Queue',
      assignedTo: 'Victor Ramon',
      origin: 'Manual',
      createdDate: '2026-01-01',
      queue: 'my_tasks',
      requiredAuthorityLevel: 1,
      alert: { type: 'sla', message: 'Employer statement is 12 days overdue.' },
      aiSummary: 'Long background narrative that should not appear in the table cell.',
    });
    expect(digest.kind).toBe('exception');
    expect(digest.recommendation).toBe('Employer statement is 12 days overdue.');
  });

  it('shows em dash for manual tasks', () => {
    const digest = resolveTaskTableAiDigest({
      id: 't3',
      priority: 'NORMAL',
      caseType: 'CLM',
      taskType: 'Schedule claimant interview',
      hasAI: false,
      claimantName: 'Test',
      product: 'Test',
      slaRemaining: '2d',
      slaStatus: 'normal',
      status: 'In Queue',
      assignedTo: 'Victor Ramon',
      origin: 'Manual',
      createdDate: '2026-01-01',
      queue: 'my_tasks',
      requiredAuthorityLevel: 1,
    });
    expect(digest.kind).toBe('manual');
    expect(digest.display).toBe('—');
  });
});
