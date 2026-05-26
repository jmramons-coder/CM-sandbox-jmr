import { describe, expect, it } from 'vitest';
import {
  sortDocumentsByRelevance,
  sortRequestsByRelevance,
  sortTasksByRelevance,
  taskStatusRelevanceRank,
} from './module-relevance-sort';
import type { CaseDocument, ServiceRequest, Task } from '../types';

const baseTask = (status: string, priority: Task['priority'] = 'NORMAL'): Task => ({
  id: 't1',
  priority,
  caseType: 'Service',
  taskType: 'Review',
  hasAI: false,
  claimantName: 'Test',
  product: 'Life',
  slaRemaining: '2d',
  slaStatus: 'normal',
  status: status as Task['status'],
  assignedTo: 'User',
  origin: 'Manual',
  createdDate: '2026-01-01',
  queue: 'my_tasks',
  requiredAuthorityLevel: 1,
});

describe('module-relevance-sort', () => {
  it('ranks in-progress before completed tasks', () => {
    expect(taskStatusRelevanceRank('To Do')).toBeLessThan(taskStatusRelevanceRank('Completed'));
    expect(taskStatusRelevanceRank('In progress')).toBeLessThan(taskStatusRelevanceRank('Complete'));
  });

  it('sorts open tasks before completed', () => {
    const sorted = sortTasksByRelevance([
      baseTask('Completed'),
      baseTask('To Do', 'URGENT'),
      baseTask('In progress', 'HIGH'),
    ]);
    expect(sorted[0].status).toBe('To Do');
    expect(sorted[1].status).toBe('In progress');
    expect(sorted[2].status).toBe('Completed');
  });

  it('sorts active requests before completed', () => {
    const mk = (status: ServiceRequest['status']): ServiceRequest => ({
      id: 'r1',
      title: 'Test',
      category: 'Address Change',
      status,
      priority: 'Normal',
      requester: 'A',
      received: 'May 1',
      due: 'May 2',
      aiSummary: '',
    });
    const sorted = sortRequestsByRelevance([mk('Completed'), mk('In progress'), mk('New')]);
    expect(sorted.map((row) => row.status)).toEqual(['New', 'In progress', 'Completed']);
  });

  it('sorts pending documents before validated', () => {
    const mk = (status: CaseDocument['status']): CaseDocument => ({
      id: 'd1',
      name: 'Doc',
      category: 'Policy',
      status,
      uploaded: 'May 1',
      source: 'portal',
      aiSummary: '',
      linkedRequirement: '',
      linkedCase: 'C1',
    });
    const sorted = sortDocumentsByRelevance([mk('Validated'), mk('Pending Review')]);
    expect(sorted[0].status).toBe('Pending Review');
  });
});
