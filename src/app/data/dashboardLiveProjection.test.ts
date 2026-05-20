import { describe, expect, it } from 'vitest';
import { SBLI_DATASET } from './sbli-dataset';
import {
  buildLiveBlockerData,
  getCaseStagesFromRecord,
  HOME_DASHBOARD_CASE_IDS,
  selectTopFocusTask,
} from './dashboardLiveProjection';
import { listTasks } from './objectRepository';
import { DEMO_CASE_IDS } from './demoCaseIds';

describe('dashboardLiveProjection', () => {
  it('derives subway stage counts from workflow meta', () => {
    const wopCase = SBLI_DATASET.cases.find((row) => row.id === DEMO_CASE_IDS.wopClaim);
    const stages = getCaseStagesFromRecord(wopCase);
    expect(stages.total).toBeGreaterThan(0);
    expect(stages.done).toBeGreaterThan(0);
    expect(stages.active).toBe(1);
  });

  it('computes blocker data from overdue requirements', () => {
    const blocker = buildLiveBlockerData(SBLI_DATASET, [...HOME_DASHBOARD_CASE_IDS], false);
    expect(blocker.count).toBeGreaterThan(0);
    expect(blocker.val).toMatch(/^\$/);
    expect(blocker.items.length).toBeGreaterThan(0);
  });

  it('selects highest-priority in-queue task for Victor', () => {
    const tasks = listTasks(SBLI_DATASET);
    const focus = selectTopFocusTask(tasks, 'Victor Ramon', {
      name: 'Victor Ramon',
      initials: 'VR',
      email: 'victor.ramon@sbli.com',
      role: 'assessor',
      band: 3,
      team: 'Life Claims',
      maxAuthority: 300_000,
    });
    expect(focus).toBeDefined();
    expect(['Me', 'Victor Ramon']).toContain(focus?.assignedTo);
  });

});
