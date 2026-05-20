import type { ReactNode } from 'react';
import { Briefcase, Scale, Stamp, type LucideIcon } from 'lucide-react';
import type { CaseDocument, CaseOverview, CasePhase } from '../../types';
import type { EffectiveCaseTypeAnatomy } from '../../domain/entityAnatomy';

export type CaseTab =
  | 'overview'
  | 'tasks'
  | 'requirements'
  | 'decision'
  | 'communications'
  | 'documents'
  | 'requests'
  | 'related_cases'
  | 'history'
  | 'scoring'
  | 'licensing'
  | 'contracts'
  | 'activation';

export type CaseDocumentContextRow = {
  id?: string;
  name: string;
  category: string;
  status: string;
  uploaded: string;
  source: string;
  aiSummary: string;
  linkedRequirement: string;
  linkedRequirementId?: string;
  fileSize?: string;
  fileType?: string;
};

export type CaseRelationshipRow = {
  id: string;
  kind: 'case' | 'client' | 'policy' | 'agent' | 'application';
  label: string;
  relationship: string;
  status?: string;
  details?: string;
  href?: string;
};

export const CASE_TAB_LABELS: Record<CaseTab, string> = {
  overview: 'General information',
  tasks: 'Tasks',
  requirements: 'Requirements',
  decision: 'Decision',
  communications: 'Communications',
  documents: 'Documents',
  requests: 'Requests',
  related_cases: 'Relationships',
  history: 'Activities',
  scoring: 'Scoring',
  licensing: 'Licensing',
  contracts: 'Contracts',
  activation: 'Activation',
};

export const CASE_TAB_ORDER: CaseTab[] = [
  'overview',
  'requirements',
  'tasks',
  'decision',
  'communications',
  'documents',
  'requests',
  'related_cases',
  'history',
];

/** Tabs restorable from `#tab=` hashes (includes anatomy-specific routes). */
export const RESTORABLE_CASE_TABS: CaseTab[] = [...CASE_TAB_ORDER, 'scoring'];

export function caseTabFromWorkflowLabel(label: string): CaseTab | null {
  const normalized = label.toLowerCase();
  if (normalized === 'general information') return 'overview';
  if (normalized === 'requirements') return 'requirements';
  if (normalized === 'tasks') return 'tasks';
  if (normalized === 'documents') return 'documents';
  if (normalized === 'communications') return 'communications';
  if (normalized === 'relationships') return 'related_cases';
  if (normalized === 'activities') return 'history';
  if (normalized === 'scoring') return 'scoring';
  if (normalized === 'application') return 'activation';
  return null;
}

export function documentToCaseContextRow(document: CaseDocument): CaseDocumentContextRow {
  return {
    id: document.id,
    name: document.name,
    category: document.category,
    status: document.status,
    uploaded: document.uploaded,
    source: document.source,
    aiSummary: document.aiSummary,
    linkedRequirement: document.linkedRequirement,
    linkedRequirementId: document.linkedRequirementId,
    fileSize: document.fileSize,
    fileType: document.fileType,
  };
}

function caseTabMilestoneIcon(Icon: LucideIcon) {
  return <Icon className="size-[17px] shrink-0" strokeWidth={2.25} aria-hidden />;
}

/** Icons for final-action milestone tabs (submission, decision, etc.). */
export function resolveCaseWorkspaceTabIcon(
  tab: CaseTab,
  label: string,
  caseKind: CaseOverview['caseKind'] | undefined,
  anatomy: EffectiveCaseTypeAnatomy | undefined,
): ReactNode | undefined {
  if (tab !== 'decision') return undefined;

  const anatomyRow = anatomy?.tabs.find((row) => (row.caseTabId ?? row.id) === tab);
  const anatomyId = anatomyRow?.id;
  const normalizedLabel = label.trim().toLowerCase();

  if (anatomyId === 'submission' || normalizedLabel === 'submission') {
    return caseTabMilestoneIcon(Stamp);
  }

  if (caseKind === 'new_business') {
    return caseTabMilestoneIcon(Briefcase);
  }

  if (normalizedLabel === 'decision' || anatomyId === 'decision') {
    return caseTabMilestoneIcon(Scale);
  }

  return undefined;
}

/** Prefer merged case-type anatomy labels (e.g. Resolution for service) over static defaults. */
export function resolveCaseWorkspaceTabLabel(tab: CaseTab, anatomy: EffectiveCaseTypeAnatomy | undefined): string {
  const rows = anatomy?.tabs ?? [];
  const byId = rows.find((row) => row.id === tab);
  if (byId?.label) return byId.label;
  const byRoute = rows.find((row) => row.caseTabId === tab);
  if (byRoute?.label) return byRoute.label;
  return CASE_TAB_LABELS[tab];
}

export function casePhaseLabel(phase: CasePhase): string {
  return phase === 'pre-approval' ? 'Pre-approval' : 'Post-approval';
}

export function richValueClass(valueColor?: 'danger' | 'warning' | null) {
  if (valueColor === 'danger') return 'text-brand-red';
  if (valueColor === 'warning') return 'text-[#a36d00]';
  return 'text-text-primary';
}
