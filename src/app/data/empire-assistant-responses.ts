import type { DemoAssistantResponse } from './multi-case-dataset';
import { GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT } from '../constants/copilot-prompts';
import { EMPIRE_DEMO_CASE_IDS } from './empireDemoCaseIds';

const DI = EMPIRE_DEMO_CASE_IDS.disabilityClaim;
const CI = EMPIRE_DEMO_CASE_IDS.criticalIllnessClaim;
const LIFE = EMPIRE_DEMO_CASE_IDS.lifeDeathClaim;
const NB = EMPIRE_DEMO_CASE_IDS.nbFullUw;
const NB_S = EMPIRE_DEMO_CASE_IDS.nbSimplified;
const NB_G = EMPIRE_DEMO_CASE_IDS.nbGuaranteed;

export const EMPIRE_ASSISTANT_RESPONSES: DemoAssistantResponse[] = [
  {
    id: 'ai-emp-priorities',
    workflowTemplateId: 'ct_claim_disability',
    prompt: GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT,
    response:
      'Empire Life workload: sign off Sophie Chen CI decision ($125k ready). Chase Marc Tremblay employer physician statement (own-occupation wording). Track MacDonald estate probate for final $385k. NB: Amélie Dubois APS overdue; Liam O\'Brien PHI 22 May; Patricia Singh PAD pending before GLP issue.',
    linkedObjects: [
      { kind: 'case', id: CI, label: 'Sophie Chen · CI' },
      { kind: 'case', id: DI, label: 'Marc Tremblay · DI' },
      { kind: 'case', id: LIFE, label: 'MacDonald · Death' },
      { kind: 'case', id: NB, label: 'Amélie Dubois · NB' },
      { kind: 'case', id: NB_S, label: 'Liam O\'Brien · Solution 10' },
      { kind: 'case', id: NB_G, label: 'Patricia Singh · GLP' },
    ],
  },
  {
    id: 'ai-emp-ci-summary',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'Give a concise case summary for handoff.',
    response:
      'Sophie Chen · Empire Critical Illness Insurance $125,000 · POL-EMP-CI-2021-008734. Canadian specialist letter confirms invasive ductal carcinoma. Recommend full payout; copy advisor Pacific Wealth Advisors.',
    linkedObjects: [{ kind: 'case', id: CI, label: 'Sophie Chen' }],
  },
  {
    id: 'ai-emp-di-summary',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'Summarize the disability insurance claim.',
    response:
      'Marc Tremblay · $3,800/month own-occupation DI · waiting period satisfied 18 May. Employer physician statement overdue — must state unable to perform software development. Specialist letter supports incapacity.',
    linkedObjects: [{ kind: 'case', id: DI, label: 'DI' }],
  },
  {
    id: 'ai-emp-life-summary',
    workflowTemplateId: 'ct_claim_death',
    prompt: 'Summarize this death claim for handoff.',
    response:
      'Robert MacDonald · Empire Term Life 20 $400,000. Beneficiary Margaret MacDonald. $15,000 compassionate advance paid. Probate pending for remaining $385,000. Advisor Jean-Philippe Morin on copy.',
    linkedObjects: [{ kind: 'case', id: LIFE, label: 'MacDonald death' }],
  },
  {
    id: 'ai-emp-nb-summary',
    workflowTemplateId: 'ct_nb_full_uw',
    prompt: 'Summarize Amélie Dubois\'s application status.',
    response:
      'Amélie Dubois · Solution 20 participating $500,000 · APP-4401. MIB clear; financial questionnaire validated. APS from Clinique Médicale du Plateau overdue — provisional standard terms until medical received.',
    linkedObjects: [{ kind: 'case', id: NB, label: 'Amélie Dubois' }],
  },
  {
    id: 'ai-emp-glp-summary',
    workflowTemplateId: 'ct_nb_guaranteed',
    prompt: 'Summarize Patricia Singh\'s Guaranteed Life Protect application.',
    response:
      'Patricia Singh · Guaranteed Life Protect $50,000 · APP-6623. Age 67 — eligibility confirmed (40–75 band). No health questions. PAD authorization received — pending bank confirmation before contract issuance. 24-month graded benefit applies.',
    linkedObjects: [{ kind: 'case', id: NB_G, label: 'Patricia Singh' }],
  },
  {
    id: 'ai-emp-ci-doc-insight',
    workflowTemplateId: 'ct_claim_disability',
    prompt: 'What does the specialist diagnosis letter show for the CI claim?',
    response:
      'The oncology specialist letter dated 5 May 2026 confirms invasive ductal carcinoma stage IIA. Pathology corroborates. Meets Empire Life definition for full $125,000 — no partial-stage reduction applied.',
    linkedObjects: [
      { kind: 'document', id: 'doc_emp_ci_diagnosis', label: 'Specialist diagnosis' },
      { kind: 'case', id: CI, label: CI },
    ],
  },
];
