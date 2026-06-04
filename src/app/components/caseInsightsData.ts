import type { CaseKind, ClaimSubType } from '../domain/objectRefs';
import { insightStageNarratives } from '../domain/claimSubTypeContent';
import { DEMO_CASE_IDS, resolveSbliCaseId } from '../data/demoCaseIds';
import { getActiveDemoConfigurationId } from '../data/datasetResolutionContext';
import {
  applyNeutralCarrierToText,
  usesSbliBrandedDemoData,
} from '../data/sharedDemoDatasetNeutralize';
import type { CasePhase, DecisionTabState } from '../types';

/** Rich step content for the AI journey insight story */
export type InsightSection = {
  label: string;
  headline: string;
  body: string;
  continuation?: string;
  aiSignals?: { label: string; value: string }[];
  actorsLine?: string;
};

export type InsightBundle = {
  sections: InsightSection[];
  pre: InsightSection[];
  post: InsightSection[];
};

const CD26_WOP: InsightSection[] = [
  {
    label: 'FNOL Received',
    headline: 'Waiver of premium claim opens after the accident',
    body:
      'Billy Bud filed a Waiver of Premium claim Jan 30, 2026 following a motorcycle accident. SBLI Term Life 20 ($500,000) is in force with the WOP rider active since Mar 2021.',
    continuation: 'Identity and policy checks passed — duplicate cover and lapse rules clear.',
    aiSignals: [
      { label: 'Intake confidence', value: '97%' },
      { label: 'Product', value: 'SBLI Term Life 20' },
    ],
    actorsLine: 'Case intake · AI document gate',
  },
  {
    label: 'Medical evidence',
    headline: 'Total disability supported for WOP rider',
    body:
      'Attending physician statement, surgical report, and employer confirmation align on total disability. The 90-day waiting period was satisfied Apr 30, 2026.',
    aiSignals: [
      { label: 'Evidence', value: 'Complete' },
      { label: 'Waiting period', value: 'Satisfied' },
    ],
    actorsLine: 'Medical review · Victor Ramon',
  },
  {
    label: 'Decision',
    headline: 'Ready to approve waiver of premium',
    body:
      'At 91% confidence the AI recommends approving the WOP claim — no exclusions or contestability issues. Record the decision in the Decision tab to formalize.',
    aiSignals: [
      { label: 'Confidence', value: '91%' },
      { label: 'Recommendation', value: 'Approve WOP' },
    ],
    actorsLine: 'AI crew · Assessor decision',
  },
];

const CD44_DEATH: InsightSection[] = [
  {
    label: 'FNOL',
    headline: 'Death benefit claim for Thomas Dupont',
    body:
      'Marie Dupont (beneficiary) filed Feb 3, 2026 following death of insured Thomas Dupont on Jan 28, 2026 (acute myocardial infarction). Policy in force 6y 11m.',
    aiSignals: [{ label: 'Intake', value: 'Complete' }],
    actorsLine: 'Beneficiary · Claims intake',
  },
  {
    label: 'Contestability',
    headline: 'MIB vs application — clean comparison',
    body:
      'Contestability period lapsed. APS, toxicology, and identity verification complete. MIB comparison shows no material misrepresentation.',
    aiSignals: [
      { label: 'Confidence', value: '96%' },
      { label: 'MIB', value: 'No adverse hit' },
    ],
    actorsLine: 'Contestability review crew',
  },
  {
    label: 'Payout decision',
    headline: '$500,000 ACH to Marie Dupont',
    body:
      'Human sign-off is the remaining gate before releasing the death benefit. Recommend approve $500,000 ACH payout to primary beneficiary.',
    aiSignals: [{ label: 'Recommendation', value: 'Approve payout' }],
    actorsLine: 'Assessor · Senior review (if escalated)',
  },
];

const NB66_FULL_UW: InsightSection[] = [
  {
    label: 'Application intake',
    headline: 'Marc Tremblay · full underwriting path',
    body:
      'SBLI Term Life 20 · $625,000 · age 42. T2 diabetes disclosed (diet-controlled). MIB hit: prior decline 2022 — accelerated UW not available.',
    aiSignals: [{ label: 'Path', value: 'Full UW' }],
    actorsLine: 'NB intake · MIB rules',
  },
  {
    label: 'Evidence gathering',
    headline: 'Paramedical and APS drive the timeline',
    body:
      'Paramedical exam scheduled May 19, 2026. APS outstanding. Preliminary scoring +75 debits — rated offer anticipated after labs and APS.',
    aiSignals: [{ label: 'Confidence', value: '88%' }],
    actorsLine: 'Underwriter · Exam vendor',
  },
  {
    label: 'Offer',
    headline: 'Rating decision pending evidence',
    body:
      'Once APS and paramedical results are in, the crew can issue a rated offer or request additional requirements.',
    actorsLine: 'Chief underwriter · AI scoring',
  },
];

const NB98_SIMPLE_UW: InsightSection[] = [
  {
    label: 'Accelerated eligibility',
    headline: 'Elena Rossi · simplified UW path',
    body:
      'SBLI Simple Term Life · $350,000 · age 35. Accelerated criteria met: age band, amount, disclosures, and MIB all clear.',
    aiSignals: [{ label: 'Path', value: 'Accelerated' }],
    actorsLine: 'Digital intake · Rules engine',
  },
  {
    label: 'Tele-interview',
    headline: 'Same-day coverage eligible after interview',
    body:
      'Tele-interview scheduled May 17, 2026. LegacyShield digital vault activated. Standard rates likely on clean pass.',
    aiSignals: [{ label: 'Confidence', value: '95%' }],
    actorsLine: 'Interview scheduler · Applicant',
  },
  {
    label: 'Issue',
    headline: 'Anticipated clean issue',
    body:
      'No adverse disclosures or MIB alerts. Pending interview confirmation to bind coverage.',
    actorsLine: 'Underwriter · AI pre-issue check',
  },
];

const CASE_INSIGHT_BUNDLES: Record<string, InsightSection[]> = {
  [DEMO_CASE_IDS.wopClaim]: CD26_WOP,
  [DEMO_CASE_IDS.deathClaim]: CD44_DEATH,
  [DEMO_CASE_IDS.nbFullUw]: NB66_FULL_UW,
  [DEMO_CASE_IDS.nbSimpleUw]: NB98_SIMPLE_UW,
};

function neutralizeInsightSections(sections: InsightSection[]): InsightSection[] {
  return sections.map((section) => ({
    ...section,
    label: applyNeutralCarrierToText(section.label),
    headline: applyNeutralCarrierToText(section.headline),
    body: applyNeutralCarrierToText(section.body),
    continuation: section.continuation ? applyNeutralCarrierToText(section.continuation) : undefined,
    actorsLine: section.actorsLine ? applyNeutralCarrierToText(section.actorsLine) : undefined,
    aiSignals: section.aiSignals?.map((signal) => ({
      ...signal,
      label: applyNeutralCarrierToText(signal.label),
      value: applyNeutralCarrierToText(signal.value),
    })),
  }));
}

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
  const resolvedId = resolveSbliCaseId(caseId);
  const curatedRaw = CASE_INSIGHT_BUNDLES[resolvedId];
  const curated =
    curatedRaw && usesSbliBrandedDemoData(getActiveDemoConfigurationId())
      ? curatedRaw
      : curatedRaw
        ? neutralizeInsightSections(curatedRaw)
        : undefined;
  if (curated) {
    const pre = [...curated];
    if (
      resolvedId === DEMO_CASE_IDS.wopClaim &&
      phase === 'pre-approval' &&
      decisionTabState === 'locked'
    ) {
      const decisionIdx = pre.findIndex((s) => s.label === 'Decision');
      if (decisionIdx >= 0) {
        pre[decisionIdx] = {
          ...pre[decisionIdx],
          headline: 'Decision — waiting on requirements',
          body:
            'The Decision tab is locked until all pre-decision requirements are fulfilled or waived. Complete the requirements grid, then the WOP approval recommendation is ready to record.',
          continuation: undefined,
          aiSignals: [
            { label: 'Status', value: 'Tab locked' },
            { label: 'Next', value: 'Complete requirements' },
          ],
          actorsLine: 'Assessor · Requirements engine',
        };
      }
    }
    const sections = phase === 'post-approval' ? genericSections(postStages, options?.caseKind, options?.claimSubType) : pre;
    return {
      sections,
      pre,
      post: genericSections(postStages, options?.caseKind, options?.claimSubType),
    };
  }
  const stages = phase === 'post-approval' ? postStages : preStages;
  const sections = genericSections(stages, options?.caseKind, options?.claimSubType);
  return {
    sections,
    pre: genericSections(preStages, options?.caseKind, options?.claimSubType),
    post: genericSections(postStages, options?.caseKind, options?.claimSubType),
  };
}
