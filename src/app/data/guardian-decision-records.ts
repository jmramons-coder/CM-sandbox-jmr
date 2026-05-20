import type { CaseDecisionFlow } from '../domain/objectRefs';
import { GUARDIAN_DEMO_CASE_IDS } from './guardianDemoCaseIds';

export const GUARDIAN_DECISION_FLOW_RECORDS: Record<string, CaseDecisionFlow & { caseKey: string }> = {
  [GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim]: {
    caseId: GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim,
    caseType: 'CLM',
    caseSubtype: 'disability_benefit',
    title: `Decision — ${GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim}`,
    subtitle: 'Claim · Critical illness · Leana Mitchell',
    steps: ['Review', 'Decision', 'Attestation', 'Confirm'],
    keyFacts: [
      { label: 'Life assured', value: 'Leana Mitchell' },
      { label: 'Policy', value: 'GDN-CI-2021-004455' },
      { label: 'Sum assured', value: '£150,000' },
      { label: 'Diagnosis', value: 'Invasive ductal carcinoma' },
      { label: 'Evidence', value: 'UK consultant letter received' },
      { label: 'AI confidence', value: '92%' },
    ],
    aiRecommendation: {
      text: 'UK consultant diagnosis satisfies Guardian critical illness definition. No exclusions or contestability issues. Recommend full £150,000 payout; notify financial adviser Harriet Shaw.',
      confidence: 92,
      recommendedOptionId: 'approve',
    },
    warnings: [
      { text: 'Partial payout rules reviewed — full sum assured recommended based on stage and definitions.' },
    ],
    options: [
      {
        id: 'approve',
        title: 'Approve CI payout — £150,000',
        description: 'Approve the critical illness claim in full. Funds to life assured account within 5 working days. HALO support continues.',
        tag: 'Recommended by AI',
        tagCls: 'pf',
        submitLabel: 'Approve payout',
        submitStyle: 'success',
      },
      {
        id: 'partial',
        title: 'Approve partial payout',
        description: 'Pay a reduced amount per policy partial definitions. Requires medical director sign-off.',
        tag: 'Review required',
        tagCls: 'pp',
        submitLabel: 'Approve partial',
        submitStyle: 'warning',
      },
      {
        id: 'decline',
        title: 'Decline claim',
        description: 'Decline with reason code and generate decline letter. Appeal rights apply under FCA rules.',
        tag: 'Irreversible',
        tagCls: 'po',
        submitLabel: 'Decline claim',
        submitStyle: 'danger',
      },
    ],
    confirmChecks: [
      'I have reviewed the consultant diagnosis against policy definitions',
      'I confirm contestability and exclusions do not apply',
      'I understand this triggers the £150,000 payment event',
    ],
    outcomes: {
      approve: {
        optionId: 'approve',
        icon: 'ti-circle-check',
        iconBg: 'var(--green-bg)',
        iconColor: 'var(--green-t)',
        title: 'CI claim approved',
        subtitle: '£150,000 payment queued. Adviser and life assured notifications will be sent within 24 hours.',
        nextSteps: ['Payment file sent to treasury', 'HALO handoff confirmed', 'Case status updated to Approved'],
      },
      partial: {
        optionId: 'partial',
        icon: 'ti-adjustments',
        iconBg: 'var(--amber-bg)',
        iconColor: 'var(--amber-t)',
        title: 'Partial payout approved',
        subtitle: 'Reduced amount per partial definitions. Medical director attestation recorded.',
        nextSteps: ['Partial payment queued', 'Adviser notified of partial settlement'],
      },
      decline: {
        optionId: 'decline',
        icon: 'ti-circle-x',
        iconBg: 'var(--red-bg)',
        iconColor: 'var(--red-t)',
        title: 'Claim declined',
        subtitle: 'Decline letter generated. Appeal window opened per policy terms.',
        nextSteps: ['Decline letter issued', 'Appeal rights communicated'],
      },
    },
    caseKey: 'ci',
  },
};
