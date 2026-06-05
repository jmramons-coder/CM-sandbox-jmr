import type { CaseWorkflowSubwayStage } from '../domain/objectRefs';
import type { CaseOverview, HumanDecision } from '../types';

function stageIndex(stages: CaseWorkflowSubwayStage[], predicate: (stage: CaseWorkflowSubwayStage) => boolean) {
  return stages.findIndex(predicate);
}

function isDecisionStage(stage: CaseWorkflowSubwayStage) {
  return stage.slug === 'decision' || stage.name.toLowerCase().includes('decision');
}

function isUnderwritingStage(stage: CaseWorkflowSubwayStage) {
  return stage.slug.includes('underwriting') || stage.name.toLowerCase().includes('underwriting');
}

function isReqGatheringStage(stage: CaseWorkflowSubwayStage) {
  return stage.slug.includes('req') || stage.name.toLowerCase().includes('req');
}

function updateSubwayStagesForDecision(
  stages: CaseWorkflowSubwayStage[],
  options: {
    decision: HumanDecision;
    isNb: boolean;
    isDefer: boolean;
    isDecline: boolean;
    isIssuance: boolean;
  },
) {
  const decisionIdx = stageIndex(stages, isDecisionStage);
  if (decisionIdx < 0) return;

  const outcomeTitle = options.decision.decisionOutcome?.title ?? options.decision.decisionTitle ?? 'Recorded';
  stages[decisionIdx] = {
    ...stages[decisionIdx],
    state: 'done',
    subLabel: outcomeTitle,
  };

  const underwritingIdx = stageIndex(stages, isUnderwritingStage);
  const reqIdx = stageIndex(stages, isReqGatheringStage);

  if (options.isIssuance || options.isDefer) {
    if (underwritingIdx >= 0 && stages[underwritingIdx].state !== 'done') {
      stages[underwritingIdx] = {
        ...stages[underwritingIdx],
        state: 'next',
        subLabel: options.isIssuance ? 'Not started' : stages[underwritingIdx].subLabel,
      };
    }
    if (reqIdx >= 0 && options.isNb) {
      stages[reqIdx] = {
        ...stages[reqIdx],
        state: 'active',
        subLabel: stages[reqIdx].subLabel ?? 'In progress',
      };
    }
    return;
  }

  if (options.isDecline) {
    stages.forEach((stage, index) => {
      if (index <= decisionIdx) {
        stages[index] = { ...stage, state: 'done' };
      }
    });
    return;
  }

  for (let index = 0; index <= decisionIdx; index += 1) {
    if (stages[index].state !== 'done') {
      stages[index] = { ...stages[index], state: 'done' };
    }
  }
}

function resolveDecisionStatus(
  data: CaseOverview,
  decision: HumanDecision,
  optionId: string,
  isNb: boolean,
  isDefer: boolean,
  isDecline: boolean,
  isIssuance: boolean,
) {
  const outcomeTitle = decision.decisionOutcome?.title ?? decision.decisionTitle;

  if (isDecline) {
    return {
      status: `Closed: ${outcomeTitle ?? 'Declined'}`,
      statusClass: 'terminated',
    };
  }
  if (isDefer) {
    return {
      status: isNb ? 'Active: Awaiting requirements' : `Active: ${outcomeTitle ?? 'Decision deferred'}`,
      statusClass: isNb ? 'awaiting_requirements' : 'pending_decision',
    };
  }
  if (isIssuance) {
    return optionId === 'rated'
      ? { status: 'Active: Rated offer outstanding', statusClass: 'underwriting' }
      : { status: 'Active: Contract issuance', statusClass: 'contract_issuance' };
  }
  if (decision.decisionType === 'approve') {
    return {
      status: isNb ? `Active: ${outcomeTitle ?? 'Approved'}` : `Closed: ${outcomeTitle ?? 'Approved'}`,
      statusClass: isNb ? 'contract_issuance' : 'closed',
    };
  }
  return {
    status: `Closed: ${outcomeTitle ?? 'Decision recorded'}`,
    statusClass: 'closed',
  };
}

/** Sync case status, subway stages, and workflow pointers after a human decision is recorded. */
export function applyDecisionToCaseWorkflow(data: CaseOverview, decision: HumanDecision) {
  const optionId = decision.decisionOptionId ?? decision.decisionOutcome?.optionId ?? '';
  const isNb = data.caseKind === 'new_business';
  const isDefer = optionId.includes('defer');
  const isDecline = optionId.includes('decline');
  const isIssuance = isNb && (optionId === 'standard' || optionId === 'rated');

  const { status, statusClass } = resolveDecisionStatus(data, decision, optionId, isNb, isDefer, isDecline, isIssuance);
  data.caseStatus = status;

  if (data.workflowMeta) {
    const subwayStages = data.workflowMeta.subwayStages.map((stage) => ({ ...stage }));
    if (subwayStages.length) {
      updateSubwayStagesForDecision(subwayStages, {
        decision,
        isNb,
        isDefer,
        isDecline,
        isIssuance,
      });
    }

    data.workflowMeta = {
      ...data.workflowMeta,
      status,
      statusClass: statusClass as typeof data.workflowMeta.statusClass,
      subwayStages,
    };
  }

  if (data.workflowState?.steps?.length) {
    const decisionStep = data.workflowState.steps.find(
      (step) => step.id === 'decision' || step.label.toLowerCase().includes('decision'),
    );
    if (decisionStep) {
      decisionStep.status = 'completed';
      data.workflowState.activeStepId = decisionStep.id;
    }
  }

  const decisionOrder = data.workflowMeta?.subwayStages.find(isDecisionStage)?.order;
  if (decisionOrder) {
    data.activeStage = decisionOrder;
  } else if (data.phase === 'pre-approval' && data.preApprovalStages.length > 0) {
    data.activeStage = data.preApprovalStages.length;
  }
}
