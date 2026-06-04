import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_DATASET_ID } from '../domain/objectRefs';
import { DEMO_ENV_EQUISOFT_ID, DEMO_ENV_SBLI_ID } from './demo-environment-deploy';
import { applyNb66SuggestedRequirements } from './datasetMutations';
import { setActiveDemoConfigurationId } from './datasetResolutionContext';
import {
  getNb66LinkedTasksByRequirement,
  getNb66RequirementTemplates,
  NB66_CASE_ID,
  NB66_GATHERING_PROPOSAL_IDS,
  TASK_NB4025_ID,
} from './equisoftNb66ReqGatheringOverlay';
import { datasetRegistry } from './datasetRegistry';
import { getSystemDataset } from './objectRepository';
import { approveNb66RequirementGatheringPackage } from './nb66RequirementGatheringActions';
import { isTaskCompleteActionSuccess, runTaskWorkflowAction } from './workflowActions';
import { pickNextOpenCaseTask } from '../domain/caseCopilotFollowUpArtifacts';
import { resolveCaseCopilotContext } from '../domain/caseCopilotContext';
import type { Task } from '../types';

function nb66Requirements(dataset: ReturnType<typeof getSystemDataset>) {
  return dataset.requirements.filter(
    (row) => row.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === NB66_CASE_ID),
  );
}

describe('equisoftNb66ReqGatheringOverlay', () => {
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

  afterEach(() => {
    setActiveDemoConfigurationId(DEMO_ENV_EQUISOFT_ID);
  });

  it('leaves four fulfilled NB66 requirements and injects task_nb4025 for Equisoft default', () => {
    setActiveDemoConfigurationId(DEMO_ENV_EQUISOFT_ID);
    const dataset = getSystemDataset(DEFAULT_DATASET_ID);
    const reqs = nb66Requirements(dataset);
    expect(reqs).toHaveLength(4);
    expect(reqs.every((row) => row.status.toLowerCase() === 'fulfilled')).toBe(true);
    expect(reqs.map((row) => row.id).sort()).toEqual(['req_mt_001', 'req_mt_002', 'req_mt_003', 'req_mt_004']);
    NB66_GATHERING_PROPOSAL_IDS.forEach((id) => {
      expect(reqs.some((row) => row.id === id)).toBe(false);
    });

    const recommendTask = dataset.tasks.find((row) => row.id === TASK_NB4025_ID);
    expect(recommendTask?.status).toBe('In Queue');
    expect(recommendTask?.review?.suggestedRequirements).toHaveLength(8);
    expect(recommendTask?.executionMode).toBe('semi_auto');
  });

  it('keeps seven NB66 requirements when SBLI-branded demo is active', () => {
    setActiveDemoConfigurationId(DEMO_ENV_SBLI_ID);
    const dataset = getSystemDataset(DEFAULT_DATASET_ID);
    expect(nb66Requirements(dataset).length).toBeGreaterThanOrEqual(7);
    expect(dataset.tasks.some((row) => row.id === TASK_NB4025_ID)).toBe(false);
  });

  it('adds selected requirements and activates linked tasks', () => {
    setActiveDemoConfigurationId(DEMO_ENV_EQUISOFT_ID);
    const result = applyNb66SuggestedRequirements(
      DEFAULT_DATASET_ID,
      NB66_CASE_ID,
      ['req_mt_005', 'req_mt_006', 'req_mt_007'],
      getNb66RequirementTemplates(),
      getNb66LinkedTasksByRequirement(),
    );

    expect(result.record.added).toHaveLength(3);
    const reqs = nb66Requirements(result.dataset);
    expect(reqs).toHaveLength(7);

    const apsTask = result.dataset.tasks.find((row) => row.id === 'task_nb4030');
    const paramedTask = result.dataset.tasks.find((row) => row.id === 'task_nb4031');
    const letterTask = result.dataset.tasks.find((row) => row.id === 'task_nb4032');
    expect(apsTask?.status).toBe('In Queue');
    expect(paramedTask?.status).toBe('In Queue');
    expect(letterTask?.status).toBe('In Queue');
  });

  it('completes task_nb4025 via workflow on Equisoft default dataset', () => {
    setActiveDemoConfigurationId(DEMO_ENV_EQUISOFT_ID);
    const result = runTaskWorkflowAction(DEFAULT_DATASET_ID, TASK_NB4025_ID, 'complete', {
      name: 'Test User',
    });
    expect(result).not.toBeNull();
    expect(isTaskCompleteActionSuccess(result!, TASK_NB4025_ID)).toBe(true);
  });

  it('approve package completes task and adds requirements on base dataset', () => {
    setActiveDemoConfigurationId(DEMO_ENV_EQUISOFT_ID);
    const result = approveNb66RequirementGatheringPackage(
      DEFAULT_DATASET_ID,
      NB66_CASE_ID,
      TASK_NB4025_ID,
      ['req_mt_005', 'req_mt_006'],
      { name: 'Test User' },
      DEMO_ENV_EQUISOFT_ID,
    );
    expect(result).not.toBeNull();
    expect(result!.addedCount).toBe(2);
    expect(result!.taskCompleted).toBe(true);
    const saved = datasetRegistry.getDataset(result!.datasetId);
    const reqs = saved.requirements.filter((row) =>
      row.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === NB66_CASE_ID),
    );
    expect(reqs.length).toBe(6);
  });

  it('approve package works on persisted workspace copy ids (browser session)', () => {
    setActiveDemoConfigurationId(DEMO_ENV_EQUISOFT_ID);
    const complete = runTaskWorkflowAction(DEFAULT_DATASET_ID, TASK_NB4025_ID, 'complete', {
      name: 'Test User',
    });
    expect(complete).not.toBeNull();
    expect(complete!.datasetId).toContain('workspace-copy');

    const result = approveNb66RequirementGatheringPackage(
      complete!.datasetId,
      NB66_CASE_ID,
      TASK_NB4025_ID,
      ['req_mt_008', 'req_mt_009', 'req_mt_010'],
      { name: 'Test User' },
      DEMO_ENV_EQUISOFT_ID,
    );
    expect(result).not.toBeNull();
    expect(result!.addedCount).toBe(3);
  });

  it('prioritizes task_nb4025 over rated-offer semi-auto task', () => {
    setActiveDemoConfigurationId(DEMO_ENV_EQUISOFT_ID);
    const dataset = getSystemDataset(DEFAULT_DATASET_ID);
    const next = pickNextOpenCaseTask(dataset, NB66_CASE_ID);
    expect(next?.id).toBe(TASK_NB4025_ID);

    const contextualTasks = dataset.tasks
      .filter((row) => row.linkedObjects.some((ref) => ref.kind === 'case' && ref.id === NB66_CASE_ID))
      .map((row) => ({ id: row.id, task: row as unknown as Task }));

    const ctx = resolveCaseCopilotContext({
      caseId: NB66_CASE_ID,
      requirements: [],
      tasks: [],
      contextualTasks,
      resolveContextTask: (row) => row.task!,
    });

    expect(ctx.focus.kind).toBe('task');
    if (ctx.focus.kind === 'task') {
      expect(ctx.focus.task.id).toBe(TASK_NB4025_ID);
    }
  });
});
