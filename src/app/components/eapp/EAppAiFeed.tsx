/* ─── Types ─── */

export type AiFeedEntryKind = 'prefill' | 'section' | 'branch';

export interface AiFeedEntry {
  id: string;
  timestamp: number;
  kind: AiFeedEntryKind;
  title: string;
  detail: string;
  source?: string;
}

/* ─── Reasons lookup ─── */

export const AI_REASONS: Record<string, { title: string; detail: string; source?: string }> = {
  'personal': {
    title: 'Pre-filled personal details',
    detail: '7 fields populated from client profile.',
    source: 'Case Management · Client Profile',
  },
  'contact': {
    title: 'Pre-filled contact information',
    detail: '8 fields populated from client profile.',
    source: 'Case Management · Client Profile',
  },
  'contingent-ben': {
    title: 'Generated contingent beneficiary section',
    detail: 'Primary beneficiary data triggered additional fields.',
    source: 'eApp Engine',
  },
  'riders': {
    title: 'Recommended riders based on profile',
    detail: 'Age, coverage amount, and health answers analyzed.',
    source: 'Underwriting Rules · PAS',
  },
  'term-riders': {
    title: 'Recommended riders based on profile',
    detail: 'Term length and coverage amount analyzed.',
    source: 'Underwriting Rules · PAS',
  },
  'tobacco-detail': {
    title: 'Tobacco use details revealed',
    detail: 'Applicant answered "Yes" to tobacco use.',
    source: 'Form Response',
  },
  'medication-detail': {
    title: 'Medication details revealed',
    detail: 'Applicant indicated current medications.',
    source: 'Form Response',
  },
  'health-conditions': {
    title: 'Health condition follow-ups available',
    detail: 'Per-condition reflex questions will activate on Yes answers.',
    source: 'Form Response · Medical Questionnaire',
  },
  'income-verification': {
    title: 'Income verification required',
    detail: 'Face amount exceeds $250,000 threshold.',
    source: 'Underwriting Rules',
  },
  'agent-info': {
    title: 'Pre-filled agent information',
    detail: '4 fields populated from agent profile.',
    source: 'Agent Profile · Session',
  },
};

export function createFeedEntry(
  kind: AiFeedEntryKind,
  sectionId: string,
  overrides?: Partial<AiFeedEntry>,
): AiFeedEntry {
  const reason = AI_REASONS[sectionId];
  return {
    id: `${sectionId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    kind,
    title: reason?.title ?? `AI action on ${sectionId}`,
    detail: reason?.detail ?? '',
    source: reason?.source,
    ...overrides,
  };
}

