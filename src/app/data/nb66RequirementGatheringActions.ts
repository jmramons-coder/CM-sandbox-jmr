import { applyNb66SuggestedRequirements } from './datasetMutations';
import { getSystemDataset } from './objectRepository';
import {
  getNb66LinkedTasksByRequirement,
  getNb66RequirementTemplates,
  isEquisoftNb66GatheringDemo,
  NB66_CASE_ID,
  TASK_NB4025_ID,
} from './equisoftNb66ReqGatheringOverlay';
import {
  isTaskCompleteActionSuccess,
  resolveDatasetTaskForWorkflow,
  runTaskWorkflowAction,
} from './workflowActions';
import { isTaskStatusCompleted } from '../utils/taskReviewProjection';

export function isNb66RecommendRequirementsTask(taskId: string): boolean {
  return taskId === TASK_NB4025_ID;
}

export type Nb66RequirementGatheringApproveResult = {
  datasetId: string;
  addedCount: number;
  taskCompleted: boolean;
};

export function approveNb66RequirementGatheringPackage(
  datasetId: string,
  caseId: string,
  taskId: string,
  requirementIds: string[],
  actor: { name: string },
  demoEnvironmentId?: string | null,
): Nb66RequirementGatheringApproveResult | null {
  if (!isEquisoftNb66GatheringDemo(caseId, demoEnvironmentId) || !isNb66RecommendRequirementsTask(taskId)) {
    return null;
  }

  try {
    if (!resolveDatasetTaskForWorkflow(datasetId, taskId)) {
      return null;
    }

    const readDataset = getSystemDataset(datasetId);
    const sourceTask = readDataset.tasks.find((row) => row.id === taskId || row.taskId === taskId);
    let workingDatasetId = datasetId;
    let taskCompleted = isTaskStatusCompleted(sourceTask?.status);

    if (!taskCompleted) {
      const completeResult = runTaskWorkflowAction(datasetId, taskId, 'complete', actor);
      if (!completeResult || !isTaskCompleteActionSuccess(completeResult, taskId)) {
        return null;
      }
      workingDatasetId = completeResult.datasetId;
      taskCompleted = true;
    }

    if (!requirementIds.length) {
      return {
        datasetId: workingDatasetId,
        addedCount: 0,
        taskCompleted,
      };
    }

    const applyResult = applyNb66SuggestedRequirements(
      workingDatasetId,
      NB66_CASE_ID,
      requirementIds,
      getNb66RequirementTemplates(),
      getNb66LinkedTasksByRequirement(),
    );

    return {
      datasetId: applyResult.datasetId,
      addedCount: applyResult.record.added.length,
      taskCompleted,
    };
  } catch {
    return null;
  }
}
