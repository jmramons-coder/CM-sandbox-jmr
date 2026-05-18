/**
 * Case Type registry — the single source of truth for what a "case type" means.
 *
 * The app keeps a single structural case view; only three things are allowed to
 * vary per type: progress steps, actions, and copy. Code never switches on a
 * hardcoded union — it always resolves the current type from this registry.
 */
import type { CaseKind, WorkObjectKind } from './objectRefs';
import type {
  WorkflowActionDefinition,
  WorkflowDecisionOption,
  WorkflowIntegrationDefinition,
  WorkflowRequirementCategory,
  WorkflowStatusDefinition,
  WorkflowTabDefinition,
} from './workflows';

export type CaseTypeCode = string;

export type ProgressPhase =
  | 'intake'
  | 'pre-approval'
  | 'post-approval'
  | 'closure';

export interface ProgressStepDef {
  id: string;
  label: string;
  phase: ProgressPhase;
  description?: string;
}

export interface CaseTypeAction {
  id: string;
  label: string;
  kind: 'primary' | 'secondary' | 'ghost';
  promptTemplate?: string;
  routeHint?: string;
}

export interface CaseTypeCopy {
  caseNoun: string;
  listTitle: string;
  stepperTitle?: string;
  detailTitlePattern?: string;
  primaryPartyLabel?: string;
  analysisLabel?: string;
}

export interface CaseTypeDefinition {
  id: string;
  code: CaseTypeCode;
  caseKind?: CaseKind;
  workflowTemplateId?: string;
  label: string;
  shortLabel: string;
  description: string;
  accentColor: string;
  enabled: boolean;
  progressSteps?: ProgressStepDef[];
  tabs?: WorkflowTabDefinition[];
  statuses?: WorkflowStatusDefinition[];
  requirementCategories?: WorkflowRequirementCategory[];
  decisions?: WorkflowDecisionOption[];
  actions?: CaseTypeAction[];
  workflowActions?: WorkflowActionDefinition[];
  participantLabels?: Record<string, string>;
  searchableObjectKinds?: WorkObjectKind[];
  integrations?: WorkflowIntegrationDefinition[];
  copy?: Partial<CaseTypeCopy>;
  isBuiltIn?: boolean;
}

/* ─── Shared defaults ─── */

export const DEFAULT_PROGRESS_STEPS: ProgressStepDef[] = [
  { id: 'fnol', label: 'FNOL Received', phase: 'pre-approval' },
  { id: 'triage', label: 'Initial Triage', phase: 'pre-approval' },
  { id: 'requirements', label: 'Requirement Gathering', phase: 'pre-approval' },
  { id: 'medical', label: 'Medical Review', phase: 'pre-approval' },
  { id: 'decision', label: 'Decision', phase: 'pre-approval' },
  { id: 'restoration', label: 'Restoration Plan', phase: 'post-approval' },
  { id: 'verification', label: 'Plan Verification', phase: 'post-approval' },
  { id: 'recovery', label: 'Recovery Underway', phase: 'post-approval' },
  { id: 'completion', label: 'Case Completion', phase: 'closure' },
];

export const DEFAULT_ACTIONS: CaseTypeAction[] = [
  { id: 'open-assistant', label: 'Open Assistant', kind: 'secondary' },
  { id: 'record-decision', label: 'Record Decision', kind: 'primary', routeHint: 'decision' },
];

export const DEFAULT_COPY: CaseTypeCopy = {
  caseNoun: 'Case',
  listTitle: 'Active cases',
  stepperTitle: 'Case progress',
  detailTitlePattern: '{caseNoun} {caseId}',
  primaryPartyLabel: 'Primary party',
  analysisLabel: 'Case analysis',
};

/* ─── Seed registry ─── */

/* Pastel accent colors — soft enough to read dark text on, distinct enough to
 * telegraph the case type at a glance. Dark variants of these colors still
 * render in the CaseView header chip as small dots, so no contrast concern. */
export const BUILTIN_CASE_TYPES: CaseTypeDefinition[] = [
  {
    id: 'ct-ip',
    code: 'IP',
    caseKind: 'claim',
    workflowTemplateId: 'claim-income-protection',
    label: 'Claim',
    shortLabel: 'Claim',
    description:
      'Disability and benefit claims where eligibility, evidence, and payments are tracked through intake to closure.',
    accentColor: '#bde0f2',
    enabled: true,
    isBuiltIn: true,
    copy: {
      caseNoun: 'Claim',
      listTitle: 'Claims',
      primaryPartyLabel: 'Claimant',
      analysisLabel: 'Claims analysis',
    },
  },
  {
    id: 'ct-wop',
    code: 'WOP',
    caseKind: 'claim',
    workflowTemplateId: 'claim-income-protection',
    label: 'Waiver of Premium',
    shortLabel: 'WOP',
    description:
      'Waives premium payments on an in-force policy when the insured is disabled.',
    accentColor: '#c2e4d3',
    enabled: true,
    isBuiltIn: true,
    copy: { caseNoun: 'Claim', listTitle: 'Claims', primaryPartyLabel: 'Claimant' },
  },
  {
    id: 'ct-wp',
    code: 'WP',
    caseKind: 'claim',
    workflowTemplateId: 'claim-income-protection',
    label: "Workers' Protection",
    shortLabel: 'WP',
    description:
      "Workers' compensation-style bridge coverage during recovery and return-to-work.",
    accentColor: '#f3d2b6',
    enabled: false,
    isBuiltIn: true,
    copy: { caseNoun: 'Claim', listTitle: "Workers' protection claims", primaryPartyLabel: 'Claimant' },
  },
  {
    id: 'ct-dth',
    code: 'DTH',
    caseKind: 'claim',
    workflowTemplateId: 'claim-death-benefit',
    label: 'Claim',
    shortLabel: 'Death',
    description:
      'Death benefit and beneficiary settlement from first notice through payout verification.',
    accentColor: '#e8d4f0',
    enabled: true,
    isBuiltIn: true,
    copy: {
      caseNoun: 'Claim',
      listTitle: 'Claims',
      primaryPartyLabel: 'Claimant',
      analysisLabel: 'Claims analysis',
    },
    progressSteps: [
      { id: 'fnol', label: 'FNOL Received', phase: 'intake' },
      { id: 'initial-review', label: 'Initial Review', phase: 'pre-approval' },
      { id: 'requirement-gathering', label: 'Requirement Gathering', phase: 'pre-approval' },
      { id: 'decision', label: 'Decision', phase: 'pre-approval' },
    ],
  },
  {
    id: 'ct-nb',
    code: 'NB',
    caseKind: 'new_business',
    workflowTemplateId: 'new-business-application',
    label: 'New Business',
    shortLabel: 'NB',
    description:
      'Application intake and completeness workflow before issue.',
    accentColor: '#c7d7ff',
    enabled: true,
    isBuiltIn: true,
    copy: {
      caseNoun: 'New Business',
      listTitle: 'New business',
      primaryPartyLabel: 'Applicant',
      analysisLabel: 'Application review',
    },
    progressSteps: [
      { id: 'application-received', label: 'Application Received', phase: 'intake' },
      { id: 'initial-review', label: 'Initial Review', phase: 'pre-approval' },
      { id: 'requirement-gathering', label: 'Requirement Gathering', phase: 'pre-approval' },
      { id: 'underwriting-review', label: 'Underwriting Review', phase: 'pre-approval' },
      { id: 'decision', label: 'Decision', phase: 'pre-approval' },
    ],
  },
  {
    id: 'ct-cs',
    code: 'CS',
    caseKind: 'customer_service',
    workflowTemplateId: 'customer-service-case',
    label: 'Customer Service',
    shortLabel: 'CS',
    description:
      'Service request, verification, update processing, and confirmation workflow.',
    accentColor: '#cfe9df',
    enabled: true,
    isBuiltIn: true,
    copy: {
      caseNoun: 'Customer Service',
      listTitle: 'Customer service',
      primaryPartyLabel: 'Customer',
      analysisLabel: 'Service review',
    },
  },
  {
    id: 'ct-agent',
    code: 'AG',
    caseKind: 'agent_onboarding',
    workflowTemplateId: 'agent-onboarding',
    label: 'Agent Onboarding',
    shortLabel: 'Agent',
    description:
      'Agent invitation, profile collection, licensing, contracting, and activation workflow.',
    accentColor: '#f0d3c7',
    enabled: true,
    isBuiltIn: true,
    copy: {
      caseNoun: 'Agent Onboarding',
      listTitle: 'Agent onboarding',
      primaryPartyLabel: 'Agent',
      analysisLabel: 'Onboarding review',
    },
  },
];

/* ─── Helpers ─── */

/**
 * Extracts the leading alpha code from a case id such as "IP44-6679812" → "IP".
 * Falls back to null if no alpha prefix is found.
 */
export function parseCaseTypeCodeFromId(caseId: string | undefined | null): CaseTypeCode | null {
  if (!caseId) return null;
  const match = /^([A-Za-z]+)/.exec(caseId.trim());
  return match ? match[1].toUpperCase() : null;
}

export function getCaseType(
  code: CaseTypeCode | null | undefined,
  registry: CaseTypeDefinition[],
): CaseTypeDefinition | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return registry.find((t) => t.code.toUpperCase() === upper);
}

export function getCaseTypeById(
  id: string | null | undefined,
  registry: CaseTypeDefinition[],
): CaseTypeDefinition | undefined {
  if (!id) return undefined;
  return registry.find((t) => t.id === id);
}

export function resolveProgressSteps(def: CaseTypeDefinition | undefined): ProgressStepDef[] {
  return def?.progressSteps ?? DEFAULT_PROGRESS_STEPS;
}

export function resolveActions(def: CaseTypeDefinition | undefined): CaseTypeAction[] {
  return def?.actions ?? DEFAULT_ACTIONS;
}

export function resolveCopy(def: CaseTypeDefinition | undefined): CaseTypeCopy {
  return {
    ...DEFAULT_COPY,
    ...(def?.copy ?? {}),
  };
}
