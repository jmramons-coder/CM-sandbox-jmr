import type { CaseKind, ClaimSubType } from './objectRefs';

/** One-line hint prepended to copilot / assistant replies for claim-specific demos. */
export function copilotClaimContextHint(caseKind: CaseKind | undefined, claimSubType: ClaimSubType | undefined): string {
  if (caseKind !== 'claim' || !claimSubType) return '';
  return claimSubType === 'death'
    ? 'Context: life insurance death benefit claim — beneficiaries, certificates, jurisdiction, and payout settlement.'
    : 'Context: disability benefit claim — medical evidence, work capacity, benefit continuation, and RTW milestones.';
}

/** Generic journey insight copy when not using a fixture-specific bundle (e.g. Billy). */
export function insightStageNarratives(
  caseKind: CaseKind | undefined,
  claimSubType: ClaimSubType | undefined,
): { firstBody: string; laterBody: string; actorsLine: string } {
  if (caseKind === 'claim' && claimSubType === 'death') {
    return {
      firstBody:
        'This stage tracks beneficiary identity, jurisdiction, and carrier response through a death benefit file. Requirements and tasks mirror certificate, probate, and payout evidence — the copilot flags gaps early so settlement does not drift.',
      laterBody:
        'Progress follows death-benefit controls: probate or tax letters where needed, and payout prerequisites. Use the requirement grid as the single checklist for every stakeholder.',
      actorsLine: 'Beneficiary team · AI crew · Assessor',
    };
  }
  if (caseKind === 'claim' && claimSubType === 'disability_benefit') {
    return {
      firstBody:
        'This stage anchors disability-benefit handling: medical evidence, work capacity, RTW milestones, and policy fit. Requirements and tasks align to evidence and payment rules — AI surfaces risk before SLAs slip.',
      laterBody:
        'Progress unlocks as earlier beats complete. Follow the requirement grid and task queue; the copilot summarizes deltas at each transition.',
      actorsLine: 'Case team · AI crew · Medical',
    };
  }
  return {
    firstBody:
      'This stage anchors what the crew and assessor are watching. Requirements and tasks in the case mirror these beats — AI surfaces risk and next actions whenever the file moves.',
    laterBody:
      'Progress unlocks as earlier beats complete. Follow the requirement grid and task queue; the copilot summarizes deltas at each transition.',
    actorsLine: 'Case team · AI crew',
  };
}
