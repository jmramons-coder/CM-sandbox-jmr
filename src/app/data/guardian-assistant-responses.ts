import type { DemoAssistantResponse } from './multi-case-dataset';
import { GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT } from '../constants/copilot-prompts';
import { GUARDIAN_DEMO_CASE_IDS } from './guardianDemoCaseIds';

const IP = GUARDIAN_DEMO_CASE_IDS.incomeProtectionClaim;
const CI = GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim;
const LIFE = GUARDIAN_DEMO_CASE_IDS.lifeDeathClaim;
const NB = GUARDIAN_DEMO_CASE_IDS.nbFullUw;
const NB_S = GUARDIAN_DEMO_CASE_IDS.nbSimplified;

export const GUARDIAN_ASSISTANT_RESPONSES: DemoAssistantResponse[] = [
  {
    id: 'ai-gdn-priorities',
    workflowTemplateId: 'ct_claim_disability',
    prompt: GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT,
    response:
      'Guardian UK workload: sign off Leana Mitchell CI decision (£150k ready). Chase James Hartley employer Fit Note (own-occupation wording). Track Clarke probate for final £490k. NB: Priya Sharma GP report overdue; Oliver Hughes tele-interview 19 May.',
    linkedObjects: [
      { kind: 'case', id: CI, label: 'Leana Mitchell · CI' },
      { kind: 'case', id: IP, label: 'James Hartley · IP' },
      { kind: 'case', id: LIFE, label: 'Clarke · Death' },
      { kind: 'case', id: NB, label: 'Priya Sharma · NB' },
      { kind: 'case', id: NB_S, label: 'Oliver Hughes · Essentials' },
    ],
  },
  {
    id: 'ai-gdn-documents',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'How can I spot missing or outstanding documents and follow-ups across my Guardian cases?',
    response:
      'Use Requirements on each case: red/overdue gates drive IP employer Fit Note and NB GP report. Documents tab shows AI insights — consultant letter for Hartley and GP chase for Sharma are the main outstanding items. Funeral and death cert complete on Clarke.',
    linkedObjects: [
      { kind: 'case', id: IP, label: IP },
      { kind: 'case', id: NB, label: NB },
    ],
  },
  {
    id: 'ai-gdn-ci-summary',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'Give a concise case summary for handoff.',
    response:
      'Leana Mitchell · Guardian CI Protection £150,000 · GDN-CI-2021-004455. UK consultant letter confirms invasive ductal carcinoma — faster-fairer path satisfied. HALO active. Recommend full payout; copy adviser Harriet Shaw.',
    linkedObjects: [{ kind: 'case', id: CI, label: 'Leana Mitchell' }],
  },
  {
    id: 'ai-gdn-ip-summary',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'Summarize the income protection claim.',
    response:
      'James Hartley · £4,200/month own-occupation IP · deferred period satisfied 10 May. HALO engaged. Employer Fit Note overdue — must state unable to perform software engineering. Consultant letter supports incapacity.',
    linkedObjects: [{ kind: 'case', id: IP, label: IP }],
  },
  {
    id: 'ai-gdn-life-summary',
    workflowTemplateId: 'ct_claim_death',
    prompt: 'Summarize this death claim for handoff.',
    response:
      'David Clarke · Guardian Life Protection £500,000. Beneficiary Sarah Clarke. £10,000 funeral advance paid under PDG pledge. Probate pending for remaining £490,000. Adviser Northbridge on copy.',
    linkedObjects: [{ kind: 'case', id: LIFE, label: 'Clarke death' }],
  },
  {
    id: 'ai-gdn-nb-summary',
    workflowTemplateId: 'ct_new_business',
    prompt: 'Summarize Priya Sharma\'s application status.',
    response:
      'Priya Sharma · Life & CI £350,000 · APP-7721. MIB clear; children’s CI rider validated; tele-interview done. GP report from Reading Medical Centre overdue — provisional standard terms until medical received.',
    linkedObjects: [{ kind: 'case', id: NB, label: 'Priya Sharma' }],
  },
  {
    id: 'ai-gdn-ci-doc-insight',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'What does the consultant diagnosis letter show for the CI claim?',
    response:
      'The consultant oncology letter dated 2 May 2026 confirms invasive ductal carcinoma stage IIA. Histopathology corroborates. Meets Guardian definition for full £150,000 — no partial-stage reduction applied.',
    linkedObjects: [
      { kind: 'document', id: 'doc_gdn_ci_diagnosis', label: 'Consultant diagnosis' },
      { kind: 'case', id: CI, label: CI },
    ],
  },
];
