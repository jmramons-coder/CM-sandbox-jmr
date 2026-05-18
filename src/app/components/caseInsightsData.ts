import type { CaseKind, ClaimSubType } from '../domain/objectRefs';
import { insightStageNarratives } from '../domain/claimSubTypeContent';
import type { CasePhase, DecisionTabState } from '../types';

/** Rich step content for the AI journey insight story */
export type InsightSection = {
  label: string;
  headline: string;
  /** Primary narrative — flows as part of one vertical story */
  body: string;
  /** Optional second beat in the same section (continuation, not a separate card) */
  continuation?: string;
  /** Compact AI telemetry chips (confidence, model, last refresh, …) */
  aiSignals?: { label: string; value: string }[];
  /** One line: who touched this step (routing, crew, assessor) */
  actorsLine?: string;
};

export type InsightBundle = {
  /** Flat list of sections matching the case's single phase */
  sections: InsightSection[];
  /** @deprecated kept for backward compat — same as sections for the matching phase */
  pre: InsightSection[];
  /** @deprecated kept for backward compat */
  post: InsightSection[];
};

const BILLY_PRE: InsightSection[] = [
  {
    label: 'FNOL Received',
    headline: 'The file opens on a winter morning in Manchester',
    body:
      'A motorcycle accident on January 30th pulls Billy Bud out of his warehouse supervisor role. First notice lands in Amplify within hours: policy number, injury narrative, and the start of an Income Protection journey that the crew will thread for months.',
    continuation:
      'Identity and policy checks pass on first pass — no duplicate cover, no lapse — so the story can move forward without rework.',
    aiSignals: [
      { label: 'Intake confidence', value: '97%' },
      { label: 'Source', value: 'Portal + telephony capture' },
    ],
    actorsLine: 'Opened by case intake · Validated by AI document gate',
  },
  {
    label: 'Initial Triage',
    headline: 'Routing that respects complexity, not just queue depth',
    body:
      'The claim is classified as stand-alone IP with an own-occupation test and an eight-week deferred period. Priority reflects medical complexity and earnings exposure — the IP Claims team receives it with a Green RAG and a single owner.',
    continuation:
      'Triage notes highlight the Harley-Davidson business context so later medical and RTW discussions stay anchored to real duties, not generic job titles.',
    aiSignals: [
      { label: 'Queue match', value: 'IP Claims — Victor Ramon' },
      { label: 'AI routing', value: 'No conflict rules fired' },
    ],
    actorsLine: 'Triage engine · Team lead acknowledgment',
  },
  {
    label: 'Requirement Gathering',
    headline: 'Seven gates, one thread — nothing left hanging',
    body:
      'Every pre-approval requirement now sits in a fulfilled state: claimant interview, identity, employer confirmation, surgical report, APS, FCE, and orthopaedic opinion. The document engine cross-checks dates, authors, and diagnoses so the assessor is never arguing with the file.',
    continuation:
      'When you see [[requirements]] in other tabs, you are looking at the same spine this paragraph describes — not a side checklist, but the contract between policy and evidence.',
    aiSignals: [
      { label: 'Documents', value: '7 / 7 validated' },
      { label: 'Last cross-check', value: 'Mar 26, 2026' },
    ],
    actorsLine: 'Claimant & providers · AI rule engine · Assessor review',
  },
  {
    label: 'Medical Review',
    headline: 'Clinical story matches occupational reality',
    body:
      'Surgery and FCE line up: prolonged standing, stairs, and load-bearing duties are not viable yet. Diabetes and weight are in the chart as rehab complicators — material to recovery, but not used to deny eligibility under this policy wording.',
    continuation:
      'The crew’s read is that total disability for the stated occupation is well supported; residual questions are about trajectory, not basic eligibility.',
    aiSignals: [
      { label: 'Medical consensus', value: 'Aligned' },
      { label: 'Risk flags', value: 'Healing / mobility' },
    ],
    actorsLine: 'Medical review crew · Orthopaedic + FCE synthesis',
  },
  {
    label: 'Decision',
    headline: 'Recommendation on the table — human authority last',
    body:
      'At ninety-one percent confidence the AI crew recommends full monthly benefit within the sixty-five percent pre-tax cap and policy minimums. What remains is a formal decision: approve, decline, modify, or request information — recorded once in the Decision tab.',
    continuation:
      'That act closes pre-approval and hands the narrative to post-approval restoration, where requirements will again pace the journey — interview, monitoring, RTW, closure.',
    aiSignals: [
      { label: 'Confidence', value: '91%' },
      { label: 'Recommendation', value: 'Approve · full benefit' },
    ],
    actorsLine: 'AI crew · Awaiting assessor decision',
  },
];

const BILLY_POST: InsightSection[] = [
  {
    label: 'Restoration Plan',
    headline: 'From approval to a shared plan the claimant can hold',
    body:
      'Post-approval begins with a conversation, not a PDF: you and Billy align on physician cadence, physiotherapy, and guardrails before benefits settle into a rhythm. AI proposes three interview slots; the claimant chooses on the portal or email — the task lands in My Tasks when they answer.',
    continuation:
      'This step is where abstract “recovery” becomes dated appointments and clear expectations.',
    aiSignals: [
      { label: 'Scheduler', value: 'AI calendar hold' },
      { label: 'Channel', value: 'Portal + email' },
    ],
    actorsLine: 'Assessor · Claimant · AI scheduler',
  },
  {
    label: 'Recovery Underway',
    headline: 'Benefits and rehab in the same frame',
    body:
      'With the plan agreed, payment rhythm and clinical milestones move together. Setbacks are expected — the system is built to surface them as tasks or requirement updates rather than surprises in a monthly review.',
    continuation:
      'Think of this chapter as the long middle of the story where discipline matters more than drama.',
    aiSignals: [
      { label: 'Watch mode', value: 'Active benefit + rehab' },
    ],
    actorsLine: 'Assessor · Case manager · Monitoring rules',
  },
  {
    label: 'Monitoring',
    headline: 'Signals, SLAs, and proportionate escalation',
    body:
      'Pharmacy, self-report, and clinical touchpoints feed a risk score. When drift exceeds thresholds, the crew creates work — it does not wait for the quarterly file review.',
    aiSignals: [
      { label: 'Signal depth', value: 'Multi-source' },
    ],
    actorsLine: 'AI monitoring · Assessor on exception',
  },
  {
    label: 'RTW Planning',
    headline: 'Return-to-work as a negotiated path',
    body:
      'Employer statement, phased hours, and medical clearance are sequenced before a hard RTW date. Accommodations are documented so disputes do not reopen the medical question later.',
    actorsLine: 'Assessor · Employer · Treating physicians',
  },
  {
    label: 'Case Closure',
    headline: 'A clean ending: benefits, letters, archive',
    body:
      'Closure ties off payments, sends the right claimant and employer communications, and leaves an audit trail that matches the requirements grid — nothing informal left in email alone.',
    aiSignals: [
      { label: 'Closure gate', value: 'Requirements complete' },
    ],
    actorsLine: 'Assessor · Communications template engine',
  },
];

function genericSections(
  stages: readonly string[],
  caseKind?: CaseKind,
  claimSubType?: ClaimSubType,
): InsightSection[] {
  const { firstBody, laterBody, actorsLine } = insightStageNarratives(caseKind, claimSubType);
  return stages.map((label, i): InsightSection => ({
    label,
    headline: label,
    body: i === 0 ? firstBody : laterBody,
    actorsLine,
  }));
}

export type InsightBundleOptions = {
  claimSubType?: ClaimSubType;
  caseKind?: CaseKind;
};

export function getInsightBundle(
  caseId: string,
  phase: CasePhase,
  preStages: readonly string[],
  postStages: readonly string[],
  decisionTabState: DecisionTabState,
  options?: InsightBundleOptions,
): InsightBundle {
  if (caseId === 'IP26-5546112') {
    const pre = [...BILLY_PRE];
    if (phase === 'pre-approval' && decisionTabState === 'locked') {
      pre[4] = {
        ...pre[4],
        headline: 'Decision — waiting on requirements',
        body:
          'The Decision tab is visible but the lock is on: one or more pre-approval requirements still need a fulfilled or waived state. The story pauses here until the requirement grid is clean — then the same ninety-one percent recommendation is ready to formalize.',
        continuation: undefined,
        aiSignals: [
          { label: 'Status', value: 'Tab locked' },
          { label: 'Next', value: 'Complete Requirements' },
        ],
        actorsLine: 'Assessor · Requirements engine',
      };
    }
    const sections = phase === 'post-approval' ? [...BILLY_POST] : pre;
    return { sections, pre, post: [...BILLY_POST] };
  }
  const stages = phase === 'post-approval' ? postStages : preStages;
  const sections = genericSections(stages, options?.caseKind, options?.claimSubType);
  return {
    sections,
    pre: genericSections(preStages, options?.caseKind, options?.claimSubType),
    post: genericSections(postStages, options?.caseKind, options?.claimSubType),
  };
}
