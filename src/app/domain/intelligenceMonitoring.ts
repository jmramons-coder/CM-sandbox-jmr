import {
  listActivityEvents,
  listAiActions,
  listCaseSummaries,
  listCommunications,
  listRequirements,
  listTasks,
} from '../data/objectRepository';
import type { ActivityEventRecord, AiActionRecord, CommunicationRecord, SystemDataset } from '../data/multi-case-dataset';
import type { CaseRequirement, CaseSummary, Task } from '../types';

export type CaseIntelligenceStep = {
  id: string;
  label: string;
  detail: string;
  status: string;
  timestamp?: string;
  source: 'ai_action' | 'activity' | 'task' | 'requirement' | 'communication';
  objectId?: string;
};

export type CaseIntelligenceRecord = {
  caseId: string;
  summary: CaseSummary;
  aiActions: AiActionRecord[];
  tasks: Task[];
  requirements: CaseRequirement[];
  communications: CommunicationRecord[];
  activityEvents: ActivityEventRecord[];
  metrics: {
    aiActions: number;
    tasks: number;
    requirements: number;
    interactions: number;
    attention: number;
    completed: number;
  };
  aiSteps: CaseIntelligenceStep[];
  humanSteps: CaseIntelligenceStep[];
  latestSignal: string;
};

const reviewStatuses = new Set(['suggested', 'failed', 'rejected']);
const completeStatuses = new Set(['completed', 'accepted', 'done', 'fulfilled', 'waived', 'sent', 'archived']);
const openTaskStatuses = new Set(['to do', 'todo', 'in progress', 'pending', 'open', 'assigned']);

function normalize(value: string | undefined | null) {
  return (value ?? '').trim().toLowerCase();
}

function actionNeedsReview(action: AiActionRecord) {
  if (reviewStatuses.has(action.status)) return true;
  return action.steps?.some((step) => reviewStatuses.has(normalize(step.status)) || normalize(step.status) === 'blocked') ?? false;
}

function actionCompleted(action: AiActionRecord) {
  return completeStatuses.has(normalize(action.status));
}

function taskNeedsAttention(task: Task) {
  const status = normalize(task.status);
  return openTaskStatuses.has(status) || task.priority === 'HIGH' || task.priority === 'URGENT' || task.slaStatus === 'warning';
}

function requirementNeedsAttention(requirement: CaseRequirement) {
  return requirement.status === 'Overdue' || requirement.status === 'Pending';
}

function formatDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function actionToAiSteps(action: AiActionRecord): CaseIntelligenceStep[] {
  if (action.steps?.length) {
    return action.steps.map((step) => ({
      id: `${action.id}-${step.id}`,
      label: step.label,
      detail: action.summary,
      status: step.status,
      timestamp: step.completedAt ?? action.createdAt,
      source: 'ai_action',
      objectId: action.id,
    }));
  }

  return [{
    id: action.id,
    label: action.title,
    detail: action.rationale ?? action.summary,
    status: action.status,
    timestamp: action.createdAt,
    source: 'ai_action',
    objectId: action.id,
  }];
}

function buildAiSteps(aiActions: AiActionRecord[], activityEvents: ActivityEventRecord[], tasks: Task[], requirements: CaseRequirement[]) {
  const actionSteps = aiActions.flatMap(actionToAiSteps);
  const eventSteps = activityEvents
    .filter((event) => event.actor === 'ai' || event.actor === 'system')
    .map((event) => ({
      id: event.id,
      label: event.label,
      detail: `${event.actor === 'ai' ? 'AI agent' : 'System'} activity recorded on the case.`,
      status: 'completed',
      timestamp: event.timestamp,
      source: 'activity' as const,
      objectId: event.id,
    }));
  const taskSteps = tasks
    .filter((task) => task.hasAI || task.aiSummary || task.aiAction)
    .map((task) => ({
      id: `task-${task.id}`,
      label: task.aiAction ?? task.taskType,
      detail: task.aiSummary ?? task.description ?? `AI-assisted task ${task.taskType}.`,
      status: task.status,
      timestamp: task.createdDate,
      source: 'task' as const,
      objectId: task.id,
    }));
  const requirementSteps = requirements
    .filter((requirement) => requirement.source === 'ai_rule_engine' || normalize(requirement.source).includes('ai'))
    .map((requirement) => ({
      id: `requirement-${requirement.id}`,
      label: requirement.name,
      detail: requirement.trigger || `AI-originated ${requirement.category} requirement.`,
      status: requirement.status,
      timestamp: requirement.followUpDate || requirement.dueDate,
      source: 'requirement' as const,
      objectId: String(requirement.id),
    }));

  return [...actionSteps, ...eventSteps, ...taskSteps, ...requirementSteps]
    .sort((a, b) => String(b.timestamp ?? '').localeCompare(String(a.timestamp ?? '')))
    .slice(0, 12);
}

function buildHumanSteps(activityEvents: ActivityEventRecord[], communications: CommunicationRecord[], tasks: Task[], requirements: CaseRequirement[]) {
  const eventSteps = activityEvents
    .filter((event) => event.actor === 'user' || event.actor === 'integration')
    .map((event) => ({
      id: event.id,
      label: event.label,
      detail: `${event.actor === 'user' ? 'Human' : 'Integration'} activity recorded on the case.`,
      status: 'completed',
      timestamp: event.timestamp,
      source: 'activity' as const,
      objectId: event.id,
    }));
  const communicationSteps = communications.map((communication) => ({
    id: communication.id,
    label: communication.subject,
    detail: `${communication.direction} ${communication.channel} · ${communication.status}`,
    status: communication.status,
    timestamp: undefined,
    source: 'communication' as const,
    objectId: communication.id,
  }));
  const taskSteps = tasks.map((task) => ({
    id: `human-task-${task.id}`,
    label: task.taskType,
    detail: `${task.assignedTo ?? 'Unassigned'} · ${task.slaRemaining ?? 'No SLA'}`,
    status: task.status,
    timestamp: task.createdDate,
    source: 'task' as const,
    objectId: task.id,
  }));
  const requirementSteps = requirements
    .filter((requirement) => ['Fulfilled', 'Waived', 'Completed', 'Overdue'].includes(requirement.status))
    .map((requirement) => ({
      id: `human-requirement-${requirement.id}`,
      label: requirement.name,
      detail: `${requirement.category} · follow-up ${requirement.followUpDate || '-'}`,
      status: requirement.status,
      timestamp: requirement.followUpDate || requirement.dueDate,
      source: 'requirement' as const,
      objectId: String(requirement.id),
    }));

  return [...eventSteps, ...communicationSteps, ...taskSteps, ...requirementSteps]
    .sort((a, b) => String(b.timestamp ?? '').localeCompare(String(a.timestamp ?? '')))
    .slice(0, 12);
}

function latestSignal(aiActions: AiActionRecord[], tasks: Task[], requirements: CaseRequirement[], summary: CaseSummary) {
  const reviewAction = aiActions.find(actionNeedsReview);
  if (reviewAction) return reviewAction.title;
  const urgentTask = tasks.find(taskNeedsAttention);
  if (urgentTask) return urgentTask.aiAction ?? urgentTask.taskType;
  const requirement = requirements.find(requirementNeedsAttention);
  if (requirement) return requirement.name;
  return summary.aiSummary || summary.status;
}

export function listCaseIntelligence(dataset: SystemDataset): CaseIntelligenceRecord[] {
  return listCaseSummaries(dataset).map((summary) => {
    const caseId = summary.id;
    const aiActions = listAiActions(dataset, { caseId });
    const tasks = listTasks(dataset, { caseId });
    const requirements = listRequirements(dataset, caseId);
    const communications = listCommunications(dataset, caseId);
    const activityEvents = listActivityEvents(dataset, caseId);
    const attention =
      aiActions.filter(actionNeedsReview).length +
      tasks.filter(taskNeedsAttention).length +
      requirements.filter(requirementNeedsAttention).length;
    const completed =
      aiActions.filter(actionCompleted).length +
      tasks.filter((task) => completeStatuses.has(normalize(task.status))).length +
      requirements.filter((requirement) => completeStatuses.has(normalize(requirement.status))).length +
      communications.filter((communication) => completeStatuses.has(normalize(communication.status))).length;

    return {
      caseId,
      summary,
      aiActions,
      tasks,
      requirements,
      communications,
      activityEvents,
      metrics: {
        aiActions: aiActions.length,
        tasks: tasks.length,
        requirements: requirements.length,
        interactions: communications.length + activityEvents.length,
        attention,
        completed,
      },
      aiSteps: buildAiSteps(aiActions, activityEvents, tasks, requirements),
      humanSteps: buildHumanSteps(activityEvents, communications, tasks, requirements),
      latestSignal: latestSignal(aiActions, tasks, requirements, summary),
    };
  }).sort((a, b) => b.metrics.attention - a.metrics.attention || b.metrics.aiActions - a.metrics.aiActions);
}

export function formatCaseIntelligenceTimestamp(value?: string) {
  return formatDate(value);
}
