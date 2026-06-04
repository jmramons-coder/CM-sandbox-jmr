import type { CaseOverview, CaseRequirement, HumanDecision } from '../types';
import { DEMO_CURRENT_PERSONA } from './demoPersonas';

export const WOP_RESTORATION_PLAN = [
  'Monthly physician follow-ups to monitor recovery progress',
  'Weekly physiotherapy sessions — focus on knee mobility and strength',
  'At-home exercises per physician statement — daily routine',
  'No full RTW for 2 months; potential half-time / limited duties when cleared',
] as const;

function postApprovalRequirement(
  id: number,
  name: string,
  category: string,
  rag: 'Green' | 'Amber' | 'Red',
  dueDate: string,
  followUpDate: string,
  source: string,
  trigger: string,
  notes?: string,
): CaseRequirement {
  return {
    id,
    name,
    category,
    rag,
    status: 'Pending',
    dueDate,
    followUpDate,
    source,
    trigger,
    phase: 'post-approval',
    notes,
    aiGenerated: source === 'ai_rule_engine' || /\bai\b/i.test(trigger),
  };
}

/** Post-approval restoration requirements for the Billy Bud WOP demo overlay. */
export const WOP_POST_APPROVAL_REQUIREMENTS: CaseRequirement[] = [
  postApprovalRequirement(1, 'Restoration Plan Interview', 'Documentation', 'Amber', 'Apr 1, 2026', 'Apr 3, 2026', 'ai_rule_engine', 'AI Restoration Plan', 'Initial meeting with claimant to review and agree on the restoration plan.'),
  postApprovalRequirement(2, 'Monthly Physician Follow-Up', 'Medical', 'Amber', 'Apr 15, 2026', 'Apr 20, 2026', 'ai_rule_engine', 'AI Restoration Plan'),
  postApprovalRequirement(3, 'Weekly PT Sessions', 'Rehabilitation', 'Amber', 'Apr 10, 2026', 'Apr 14, 2026', 'ai_rule_engine', 'AI Restoration Plan'),
  postApprovalRequirement(4, 'At-Home Exercise Compliance', 'Rehabilitation', 'Green', 'Apr 20, 2026', 'Apr 25, 2026', 'ai_rule_engine', 'AI Restoration Plan'),
  postApprovalRequirement(5, 'Orthopaedic Specialist Review', 'Medical', 'Amber', 'Apr 22, 2026', 'Apr 28, 2026', 'ai_rule_engine', 'AI Restoration Plan'),
  postApprovalRequirement(6, 'Medication Compliance Check', 'Pharmacy', 'Green', 'Apr 18, 2026', 'Apr 22, 2026', 'pharmacy_check', 'AI Monitoring'),
  postApprovalRequirement(7, 'Functional Capacity Re-assessment', 'Medical', 'Amber', 'May 5, 2026', 'May 10, 2026', 'ai_rule_engine', 'AI Restoration Plan'),
  postApprovalRequirement(8, 'Pain Management Progress Report', 'Medical', 'Amber', 'Apr 30, 2026', 'May 5, 2026', 'ai_rule_engine', 'AI Monitoring'),
  postApprovalRequirement(9, 'Employer RTW Accommodation Plan', 'Employment', 'Green', 'May 15, 2026', 'May 20, 2026', 'employer_portal', 'AI Restoration Plan'),
  postApprovalRequirement(10, 'Final Review Interview', 'Documentation', 'Green', 'Jun 15, 2026', 'Jun 20, 2026', 'ai_rule_engine', 'AI Case Completion'),
];

/** Requirements seeded after the post-approval AI activity toast (extended notes). */
export function wopPostApprovalRequirementsForRestore(): CaseRequirement[] {
  return WOP_POST_APPROVAL_REQUIREMENTS.map((req, index) => {
    if (index === 0) {
      return {
        ...req,
        notes: 'Initial meeting with claimant to review and agree on the restoration plan — physician cadence, PT schedule, RTW guardrails.',
      };
    }
    if (index === 9) {
      return {
        ...req,
        notes: 'Final meeting with claimant before case completion — review recovery outcomes, confirm RTW status, and close the restoration plan.',
      };
    }
    return req;
  });
}

export const WOP_APPROVED_DECISION: HumanDecision = {
  decisionType: 'approve',
  reasonCodes: ['ai_recommended'],
  notes: 'AI recommendation accepted. All 7 requirements fulfilled.',
  recordedBy: DEMO_CURRENT_PERSONA.name,
  recordedAt: new Date().toISOString(),
};

export type WopContextualTaskRow = {
  id: string;
  taskType: string;
  priority: string;
  status: string;
  dueDate: string;
  assignee: string;
};

const WOP_PRE_APPROVAL_TAIL: WopContextualTaskRow[] = [
  { id: 'TSK-6112-02', taskType: 'Validate PT appointment outcomes', priority: 'Normal', status: 'To Do', dueDate: 'Mar 30, 2026', assignee: DEMO_CURRENT_PERSONA.name },
  { id: 'TSK-6112-03', taskType: 'Confirm claimant adherence plan', priority: 'Normal', status: 'In Queue', dueDate: 'Apr 2, 2026', assignee: 'Marina Scott' },
];

const WOP_DECISION_ROW: WopContextualTaskRow = {
  id: 'TSK-BB-DEC-01',
  taskType: 'Decision — verify requirements & AI recommendation',
  priority: 'High',
  status: 'To Do',
  dueDate: 'Mar 26, 2026',
  assignee: DEMO_CURRENT_PERSONA.name,
};

const WOP_POST_APPROVAL_BASE: WopContextualTaskRow[] = [
  { id: 'TSK-BB-RP-02', taskType: 'Review restoration plan progress', priority: 'Normal', status: 'To Do', dueDate: 'Apr 5, 2026', assignee: DEMO_CURRENT_PERSONA.name },
  { id: 'TSK-BB-PT-01', taskType: 'Validate PT appointment outcomes', priority: 'Normal', status: 'To Do', dueDate: 'Apr 10, 2026', assignee: DEMO_CURRENT_PERSONA.name },
];

export function buildWopOverlayContextualTasks<T extends { id: string }>(params: {
  data: Pick<CaseOverview, 'phase' | 'decisionTabState'>;
  datasetRows: T[];
  overdueTaskReady: boolean;
  overdueTaskCompleted: boolean;
  newCaseTaskReady: boolean;
  prioritizeCreatedTask: (rows: T[]) => T[];
}): T[] {
  const { data, datasetRows, overdueTaskReady, overdueTaskCompleted, newCaseTaskReady, prioritizeCreatedTask } = params;
  const decisionPending = data.phase === 'pre-approval' && data.decisionTabState !== 'completed';

  if (decisionPending) {
    return prioritizeCreatedTask([WOP_DECISION_ROW, ...WOP_PRE_APPROVAL_TAIL, ...datasetRows] as T[]);
  }

  if (data.phase === 'post-approval') {
    const overlay: WopContextualTaskRow[] = [];
    if (overdueTaskReady) {
      overlay.push({
        id: 'TSK-BB-OD-01',
        taskType: 'Follow up on overdue requirement — Weekly PT Sessions',
        priority: 'High',
        status: overdueTaskCompleted ? 'Completed' : 'Overdue',
        dueDate: 'Apr 12, 2026',
        assignee: DEMO_CURRENT_PERSONA.name,
      });
    }
    if (newCaseTaskReady) {
      overlay.push({
        id: 'TSK-BB-APPT-01',
        taskType: 'Review proposed appointment — validate meeting time with Billy Bud',
        priority: 'High',
        status: 'To Do',
        dueDate: 'Apr 1, 2026',
        assignee: DEMO_CURRENT_PERSONA.name,
      });
    }
    return prioritizeCreatedTask([...overlay, ...WOP_POST_APPROVAL_BASE, ...datasetRows] as T[]);
  }

  return prioritizeCreatedTask([...WOP_PRE_APPROVAL_TAIL, ...datasetRows] as T[]);
}

export const WOP_APPOINTMENT_TASK_ROW: WopContextualTaskRow = {
  id: 'TSK-BB-APPT-01',
  taskType: 'Review proposed appointment — validate meeting time with Billy Bud',
  priority: 'High',
  status: 'To Do',
  dueDate: 'Apr 1, 2026',
  assignee: DEMO_CURRENT_PERSONA.name,
};

export function applyWopPostApprovalRestore(data: CaseOverview) {
  data.restorationPlan = [...WOP_RESTORATION_PLAN];
  data.requirements = wopPostApprovalRequirementsForRestore();
  data.activeStage = 2;
}

export const WOP_FALLBACK_COMMUNICATIONS = [
  { date: 'Mar 18, 2026', channel: 'Phone', direction: 'Outbound', contact: '', summary: 'Discussed PT adherence and medication compliance.', owner: DEMO_CURRENT_PERSONA.name },
  { date: 'Mar 15, 2026', channel: 'Email', direction: 'Inbound', contact: 'Dr. Harding', summary: 'Uploaded updated orthopaedic review notes.', owner: 'Case Intake Bot' },
  { date: 'Mar 11, 2026', channel: 'Portal', direction: 'Inbound', contact: '', summary: 'Submitted pain-level update and mobility log.', owner: DEMO_CURRENT_PERSONA.name },
] as const;
