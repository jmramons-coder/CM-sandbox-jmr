import type { DecisionTabState } from '../types';

export type StepPhase = 'pre' | 'post';

export function getDeathClaimPreApprovalStepTooltip(
  stepIndex: number,
  isDone: boolean,
  isActive: boolean,
  decisionTabState: DecisionTabState,
  isDecisionStep: boolean,
): { title: string; body: string } {
  if (isDone) {
    const bodies: Record<number, string> = {
      0: 'Death notification received; claim opened and key parties identified.',
      1: 'Initial review completed — coverage, beneficiary designation, and intake checks addressed.',
      2: 'Required evidence collected, waived, or in progress for decision.',
      3: 'A formal death-benefit decision was recorded (approve, pend, decline, or information request).',
    };
    return {
      title: 'Completed',
      body: bodies[stepIndex] ?? 'This step is complete.',
    };
  }

  if (isActive) {
    if (stepIndex === 3) {
      if (decisionTabState === 'locked') {
        return {
          title: 'Current — blocked',
          body:
            'Decision step is open, but outstanding requirements must be fulfilled before you can record a decision. Review the Requirements tab.',
        };
      }
      if (isDecisionStep && decisionTabState === 'active') {
        return {
          title: 'Current — ready',
          body:
            'Evidence path is complete. Open the Decision tab to record approve, decline, pend, or request more information.',
        };
      }
      return {
        title: 'Current',
        body: 'Work the decision: verify beneficiary and policy position, then record the outcome.',
      };
    }

    const bodies: Record<number, string> = {
      0: 'Capture death notification details, index attachments, and confirm policy identity.',
      1: 'Validate coverage window, beneficiary records, and obvious gaps before deep requirements.',
      2: 'Gather death certificate, identity, beneficiary proof, and payout prerequisites.',
    };
    return {
      title: 'In progress',
      body: bodies[stepIndex] ?? 'This step is in progress.',
    };
  }

  const bodies: Record<number, string> = {
    0: 'Not started — FNOL will appear once the death notification is received.',
    1: 'Waiting on FNOL — initial review follows intake.',
    2: 'Waiting on initial review — requirement gathering tracks outstanding evidence.',
    3: 'Waiting on requirements — decision is recorded after a complete file.',
  };
  return {
    title: 'Upcoming',
    body: bodies[stepIndex] ?? 'This step unlocks when prior steps complete.',
  };
}

export function getNewBusinessPreApprovalStepTooltip(
  stepIndex: number,
  isDone: boolean,
  isActive: boolean,
  decisionTabState: DecisionTabState,
  isDecisionStep: boolean,
): { title: string; body: string } {
  if (isDone) {
    const bodies: Record<number, string> = {
      0: 'Application received and logged from advisor or portal.',
      1: 'Initial review completed; routing and obvious data gaps addressed.',
      2: 'Required items collected, waived, or tracked for underwriting.',
      3: 'Underwriting review completed; conditions and scoring aligned with file.',
      4: 'A formal new-business decision was recorded (accept, pend, decline, or return).',
    };
    return {
      title: 'Completed',
      body: bodies[stepIndex] ?? 'This step is complete.',
    };
  }

  if (isActive) {
    if (stepIndex === 4) {
      if (decisionTabState === 'locked') {
        return {
          title: 'Current — blocked',
          body:
            'Decision step is open, but outstanding requirements must be satisfied before you can record a final decision. Review the Requirements tab.',
        };
      }
      if (isDecisionStep && decisionTabState === 'active') {
        return {
          title: 'Current — ready',
          body:
            'Pre-underwriting work is complete. Open the Decision tab to record accept, pend, decline, or return with conditions.',
        };
      }
      return {
        title: 'Current',
        body: 'Work the decision: confirm underwriting outcome and record the disposition.',
      };
    }

    const bodies: Record<number, string> = {
      0: 'Confirm receipt, index attachments, and validate basic application identity.',
      1: 'Screen for completeness, product fit, and advisor follow-ups before deep requirements.',
      2: 'Gather signatures, financial evidence, and underwriting prerequisites.',
      3: 'Complete underwriting review — scoring, debits/credits, and conditions.',
    };
    return {
      title: 'In progress',
      body: bodies[stepIndex] ?? 'This step is in progress.',
    };
  }

  const bodies: Record<number, string> = {
    0: 'Not started — application must be received before initial review.',
    1: 'Waiting on application received — initial review follows intake.',
    2: 'Waiting on initial review — requirement gathering tracks outstanding evidence.',
    3: 'Waiting on requirements — underwriting review runs on a complete file.',
    4: 'Waiting on underwriting — decision is recorded after review.',
  };
  return {
    title: 'Upcoming',
    body: bodies[stepIndex] ?? 'This step unlocks when prior steps complete.',
  };
}

export function getPreApprovalStepTooltip(
  stepIndex: number,
  isDone: boolean,
  isActive: boolean,
  decisionTabState: DecisionTabState,
  isDecisionStep: boolean,
  aiMode: string | null,
): { title: string; body: string } {
  const ai = aiMode ? ` AI mode: ${aiMode}.` : '';

  if (isDone) {
    const bodies: Record<number, string> = {
      0: 'First notice of loss received; claim opened and acknowledged in Amplify.',
      1: 'Claim validated, prioritized, and assigned — routing complete.',
      2: 'Required documents and checks collected, waived, or satisfied for this phase.',
      3: 'Clinical evidence reviewed; assessment factors updated for decision support.',
      4: 'A formal claim decision was recorded (approve, decline, modified offer, or information request).',
    };
    return {
      title: 'Completed',
      body: bodies[stepIndex] ?? 'This step is complete.',
    };
  }

  if (isActive) {
    if (stepIndex === 4) {
      if (decisionTabState === 'locked') {
        return {
          title: 'Current — blocked',
          body:
            'Decision step is open, but outstanding requirements must be fulfilled before you can record a decision. Review the Requirements tab.',
        };
      }
      if (isDecisionStep && decisionTabState === 'active') {
        return {
          title: 'Current — ready',
          body:
            'All pre-approval requirements are complete. Open the Decision tab to review AI factors, then record approve, decline, modified offer, or an information request.',
        };
      }
      return {
        title: 'Current',
        body: `Work the decision: verify evidence, then record the outcome in the Decision tab.${ai}`,
      };
    }

    const bodies: Record<number, string> = {
      0: 'Capture and confirm FNOL details; ensure the claim is correctly opened.',
      1: `Validate intake data, assign ownership, and route the claim.${ai}`,
      2: `Gather outstanding requirements from claimants, employers, and providers.${ai}`,
      3: `Complete medical review and align assessment factors with evidence.${ai}`,
    };
    return {
      title: 'In progress',
      body: bodies[stepIndex] ?? 'This step is in progress.',
    };
  }

  const bodies: Record<number, string> = {
    0: 'Not started — FNOL will appear here once the claim is filed and acknowledged.',
    1: 'Waiting on FNOL — triage runs after first notice is complete.',
    2: 'Waiting on triage — requirements are collected after routing.',
    3: 'Waiting on requirements — medical review follows a complete requirement set.',
    4: 'Waiting on medical review — the formal decision is recorded after review.',
  };
  return {
    title: 'Upcoming',
    body: bodies[stepIndex] ?? 'This step unlocks when prior steps complete.',
  };
}

export function getPostApprovalStepTooltip(
  stepIndex: number,
  isDone: boolean,
  isActive: boolean,
): { title: string; body: string } {
  if (isDone) {
    const bodies: Record<number, string> = {
      0: 'Restoration plan agreed with the claimant; cadence and guardrails documented.',
      1: 'Active recovery period — benefits and rehab milestones in motion.',
      2: 'Monitoring period completed or superseded by the next phase.',
      3: 'Return-to-work planning concluded or clearance obtained.',
      4: 'Case closed out per policy — final notifications and file complete.',
    };
    return {
      title: 'Completed',
      body: bodies[stepIndex] ?? 'This step is complete.',
    };
  }

  if (isActive) {
    const bodies: Record<number, string> = {
      0:
        'Schedule and hold the restoration plan interview with the claimant. Align on physician cadence, PT, and RTW guardrails before Recovery Underway — see My Tasks.',
      1: 'Ongoing recovery — track compliance, milestones, and setbacks against the plan.',
      2: 'Watch triggers, reviews, and SLA-driven follow-ups; escalate when risk signals appear.',
      3: 'Prepare RTW clearance, accommodations, and phased return where applicable.',
      4: 'Finalize closure: confirm benefits end date, communications, and archive.',
    };
    return {
      title: 'In progress',
      body: bodies[stepIndex] ?? 'This phase is active.',
    };
  }

  const bodies: Record<number, string> = {
    0: 'Unlocked after approval — interview and plan alignment happen here first.',
    1: 'Starts after the restoration plan is in place.',
    2: 'Runs during active recovery — surveillance and touchpoints.',
    3: 'Begins when RTW is approaching or medically cleared.',
    4: 'Final step — full closure after RTW or benefit exhaustion.',
  };
  return {
    title: 'Upcoming',
    body: bodies[stepIndex] ?? 'Unlocks when earlier phases complete.',
  };
}
