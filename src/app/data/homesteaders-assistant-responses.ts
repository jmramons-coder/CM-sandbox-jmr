import type { DemoAssistantResponse } from './multi-case-dataset';
import { GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT } from '../constants/copilot-prompts';
import { HOMESTEADERS_DEMO_CASE_IDS } from './homesteadersDemoCaseIds';

const PN_MID = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimMid;
const PN_DEC = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimDecision;
const NB = HOMESTEADERS_DEMO_CASE_IDS.nbFullUw;
const NB_S = HOMESTEADERS_DEMO_CASE_IDS.nbSimplified;
const NB_G = HOMESTEADERS_DEMO_CASE_IDS.nbGuaranteed;

export const HOMESTEADERS_ASSISTANT_RESPONSES: DemoAssistantResponse[] = [
  {
    id: 'ai-hsl-priorities',
    workflowTemplateId: 'ct_claim_death',
    prompt: GLOBAL_COPILOT_CASE_PRIORITIES_PROMPT,
    response:
      'Homesteaders workload: sign off James Whitfield preneed decision ($12,500 to Riverside Memorial Chapel). Chase Helen Martinez funeral home assignment at Oak Grove. NB: Margaret Chen — APS overdue from Dr. Patterson; Robert Sullivan simplified path ready to approve; Dorothy Hayes PAD pending before $5,000 contract issue.',
    linkedObjects: [
      { kind: 'case', id: PN_DEC, label: 'Whitfield · Preneed claim' },
      { kind: 'case', id: PN_MID, label: 'Martinez · Preneed claim' },
      { kind: 'case', id: NB, label: 'Margaret Chen · NB' },
      { kind: 'case', id: NB_S, label: 'Robert Sullivan · NB' },
      { kind: 'case', id: NB_G, label: 'Dorothy Hayes · NB' },
    ],
  },
  {
    id: 'ai-hsl-pn142-summary',
    workflowTemplateId: 'ct_claim_death',
    prompt: 'Summarize this preneed death claim for handoff.',
    response:
      'Helen Martinez · Homesteaders preneed $10,000 · POL-HSL-PN-2015-001142. Death certificate received. Oak Grove Funeral Home assignment letter still outstanding — Sandra Martinez is contact. Helping people design a better farewell — confirm funeral director partner before payment.',
    linkedObjects: [{ kind: 'case', id: PN_MID, label: PN_MID }],
  },
  {
    id: 'ai-hsl-pn287-summary',
    workflowTemplateId: 'ct_claim_death',
    prompt: 'Summarize this preneed death claim for decision.',
    response:
      'James Whitfield · preneed $12,500 · POL-HSL-PN-2014-002287. All requirements fulfilled. Riverside Memorial Chapel confirmed as funeral home payee. Recommend full $12,500 payment. Copy funeral director Thomas Reed and Linda Whitfield.',
    linkedObjects: [{ kind: 'case', id: PN_DEC, label: PN_DEC }],
  },
  {
    id: 'ai-hsl-nb7721-summary',
    workflowTemplateId: 'ct_nb_full_uw',
    prompt: 'Summarize Margaret Chen\'s preneed application status.',
    response:
      'Margaret Chen · $15,000 preneed · APP-7721 via Riverside Memorial Chapel. MIB clear. Health questionnaire notes treated hypertension — APS from Dr. Patterson overdue 4 days. Provisional standard pending medical evidence.',
    linkedObjects: [{ kind: 'case', id: NB, label: NB }],
  },
  {
    id: 'ai-hsl-nb8804-summary',
    workflowTemplateId: 'ct_nb_simplified',
    prompt: 'Summarize Robert Sullivan\'s simplified preneed application.',
    response:
      'Robert Sullivan · $8,500 preneed sold by Riverside Memorial Chapel funeral director. Personal Expressions planning guide complete 14 May. Simplified path — recommend approve standard, no APS at this face amount.',
    linkedObjects: [{ kind: 'case', id: NB_S, label: NB_S }],
  },
  {
    id: 'ai-hsl-nb9905-summary',
    workflowTemplateId: 'ct_nb_guaranteed',
    prompt: 'Summarize Dorothy Hayes\'s guaranteed preneed application.',
    response:
      'Dorothy Hayes · guaranteed preneed $5,000 · APP-9905 through Oak Grove Funeral Home. Age 70 — eligibility confirmed, no health questions. Beneficiary designated. PAD authorization received — bank confirmation pending before contract issuance.',
    linkedObjects: [{ kind: 'case', id: NB_G, label: NB_G }],
  },
  {
    id: 'ai-hsl-pn287-doc-insight',
    workflowTemplateId: 'ct_claim_death',
    prompt: 'What does the funeral home assignment letter show?',
    response:
      'The Riverside Memorial Chapel assignment letter dated 22 Apr 2026 confirms the funeral home as payee for the full $12,500 preneed benefit under POL-HSL-PN-2014-002287. Signed by funeral director Thomas Reed.',
    linkedObjects: [
      { kind: 'document', id: 'doc_hsl_pn287_assignment', label: 'Assignment letter' },
      { kind: 'case', id: PN_DEC, label: PN_DEC },
    ],
  },
];
