import type { DemoAssistantResponse } from './multi-case-dataset';
import { GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT } from '../constants/copilot-prompts';
import { DEMO_CASE_IDS } from './demoCaseIds';

const CD26 = DEMO_CASE_IDS.wopClaim;
const CD44 = DEMO_CASE_IDS.deathClaim;
const NB66 = DEMO_CASE_IDS.nbFullUw;
const NB98 = DEMO_CASE_IDS.nbSimpleUw;

/** Curated copilot Q&A aligned with SBLI_DATASET cases and GI summaries. */
export const SBLI_ASSISTANT_RESPONSES: DemoAssistantResponse[] = [
  {
    id: 'ai-sbli-priorities',
    workflowTemplateId: 'ct_claim_disability',
    prompt: GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT,
    response:
      'Use the case list below — it is built from your active SBLI demo workload (WOP claim, death claim, and two new-business files).',
    linkedObjects: [
      { kind: 'case', id: CD26, label: 'Billy Bud · WOP' },
      { kind: 'case', id: CD44, label: 'Marie Dupont · Death' },
      { kind: 'case', id: NB66, label: 'Marc Tremblay · NB UW' },
      { kind: 'case', id: NB98, label: 'Elena Rossi · Simple NB' },
    ],
  },
  {
    id: 'ai-sbli-queue',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'What should I prioritize in my queue today—overdue items, due today, and anything at risk?',
    response:
      'Focus on SLA risk first: Billy Bud\'s WOP claim is pending decision with a breached SLA. Marie Dupont\'s death claim is ready for human sign-off on the $500k payout. Marc Tremblay needs APS and paramedical follow-up; Elena Rossi is on the accelerated path pending tele-interview.',
    linkedObjects: [
      { kind: 'case', id: CD26, label: CD26 },
      { kind: 'case', id: CD44, label: CD44 },
    ],
  },
  {
    id: 'ai-sbli-tasks',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'Help me plan my work: summarize my open tasks, due dates, and suggested order to tackle them.',
    response:
      'Open work clusters on the WOP and death claims: complete the WOP approval decision, then finalize contestability sign-off for the Dupont death benefit. New-business tasks are exam- and APS-driven for Marc; Elena\'s file is waiting on tele-interview completion.',
    linkedObjects: [{ kind: 'case', id: CD26, label: CD26 }],
  },
  {
    id: 'ai-sbli-documents',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'How can I spot missing or outstanding documents and follow-ups across my cases?',
    response:
      'In Amplify, use the Requirements grid on each case: fulfilled vs outstanding gates drive decision locks. For CD26-5546112 all medical evidence for WOP is in; for CD44-6679812 contestability documents are complete pending sign-off; NB66-7622343 still shows APS outstanding; NB98-9989870 has no adverse document flags on the accelerated path.',
    linkedObjects: [
      { kind: 'case', id: CD26, label: CD26 },
      { kind: 'case', id: NB66, label: NB66 },
    ],
  },
  {
    id: 'ai-sbli-cd26-summary',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'Give a concise case summary for handoff.',
    response:
      'Billy Bud · Waiver of premium on SBLI Term Life 20 ($500k). Motorcycle accident Jan 30, 2026; total disability confirmed; 90-day wait satisfied Apr 30, 2026. Medical evidence complete, no exclusions — ready for approval decision.',
    linkedObjects: [{ kind: 'case', id: CD26, label: 'Billy Bud' }],
  },
  {
    id: 'ai-sbli-cd26-recommend',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'Why does the AI recommend this outcome?',
    response:
      'Recommendation: approve waiver of premium. Confidence is driven by verified rider in force, satisfied waiting period, attending physician alignment on total disability, and no contestability or exclusion triggers on the policy.',
    linkedObjects: [{ kind: 'case', id: CD26, label: CD26 }],
  },
  {
    id: 'ai-sbli-cd44-summary',
    workflowTemplateId: 'ct_claim_death',
    prompt: 'Summarize this death claim for handoff.',
    response:
      'Thomas Dupont death benefit · primary contact Marie Dupont (beneficiary). AMI Jan 28, 2026; policy in force 6y 11m; contestability lapsed. APS, toxicology, and identity complete; MIB clean — recommend $500,000 ACH to Marie Dupont.',
    linkedObjects: [{ kind: 'case', id: CD44, label: 'Marie Dupont' }],
  },
  {
    id: 'ai-sbli-cd44-contest',
    workflowTemplateId: 'ct_claim_death',
    prompt: 'Explain the contestability review for this case.',
    response:
      'MIB vs application comparison shows no material misrepresentation. Toxicology and APS support stated cause of death. Human sign-off is the remaining gate before releasing the $500k ACH payout to Marie Dupont.',
    linkedObjects: [{ kind: 'case', id: CD44, label: CD44 }],
  },
  {
    id: 'ai-sbli-nb66-summary',
    workflowTemplateId: 'ct_new_business',
    prompt: 'Summarize Marc Tremblay\'s application status.',
    response:
      'Marc Tremblay · SBLI Term Life 20 · $625k · age 42. T2 diabetes disclosed; MIB prior decline 2022 blocks accelerated UW. Paramedical May 19; APS outstanding; preliminary +75 debits — rated offer expected.',
    linkedObjects: [{ kind: 'case', id: NB66, label: 'Marc Tremblay' }],
  },
  {
    id: 'ai-sbli-nb98-summary',
    workflowTemplateId: 'ct_new_business',
    prompt: 'Summarize Elena Rossi\'s application status.',
    response:
      'Elena Rossi · SBLI Simple Term Life · $350k · age 35. Accelerated UW path confirmed (age, amount, disclosures, MIB). Tele-interview May 17 pending; LegacyShield vault active — standard rates likely on clean pass.',
    linkedObjects: [{ kind: 'case', id: NB98, label: 'Elena Rossi' }],
  },
  {
    id: 'ai-sbli-factors-net',
    workflowTemplateId: 'ct_new_business',
    prompt: 'Explain the net assessment score for this case.',
    response:
      'Net score reflects debits and credits from disclosed conditions, lab results, and MIB history. For full UW files, MIB hits and APS findings weigh heavily; simplified UW paths emphasize knockout questions and interview outcomes.',
    linkedObjects: [],
  },
  {
    id: 'ai-sbli-factors-drivers',
    workflowTemplateId: 'ct_new_business',
    prompt: 'What are the main risk drivers in the factor table?',
    response:
      'Primary drivers: disclosed diabetes and BMI for Marc Tremblay; prior carrier decline on MIB. For Elena Rossi, drivers are minimal — accelerated eligibility factors are all green pending interview confirmation.',
    linkedObjects: [{ kind: 'case', id: NB66, label: NB66 }],
  },
  {
    id: 'ai-sbli-draft-escalation',
    workflowTemplateId: 'ct_claim_death',
    prompt: 'Help me draft an escalation email for the overdue surgical report',
    response:
      'Subject: Outstanding attending physician statement — Dupont death claim (CD44-6679812)\n\nDear Provider Relations,\n\nWe are finalizing the death benefit claim for Thomas Dupont (policy SBLI Term Life 20). Please confirm receipt and expected delivery date for the attending physician statement referenced on our request of May 2, 2026.\n\nThank you,\nVictor Ramon · SBLI Claims',
    linkedObjects: [{ kind: 'case', id: CD44, label: CD44 }],
  },
  {
    id: 'ai-sbli-marc-timeline',
    workflowTemplateId: 'ct_new_business',
    prompt: "Show me Marc Tremblay's rehabilitation timeline",
    response:
      'Marc Tremblay is on a new-business underwriting timeline (not a claim rehab track): application intake → MIB review → paramedical exam → APS → rating decision. Next milestone: paramedical exam May 19, 2026, then APS fulfillment before offer.',
    linkedObjects: [{ kind: 'case', id: NB66, label: 'Marc Tremblay' }],
  },
];
