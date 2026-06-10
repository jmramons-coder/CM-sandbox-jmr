import type { ActivityEventRecord } from './multi-case-dataset';
import { HOMESTEADERS_DEMO_CASE_IDS } from './homesteadersDemoCaseIds';

const PN_MID = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimMid;
const PN_DEC = HOMESTEADERS_DEMO_CASE_IDS.preneedClaimDecision;
const NB = HOMESTEADERS_DEMO_CASE_IDS.nbFullUw;
const NB_S = HOMESTEADERS_DEMO_CASE_IDS.nbSimplified;
const NB_G = HOMESTEADERS_DEMO_CASE_IDS.nbGuaranteed;

export const HOMESTEADERS_ACTIVITY_RECORDS: ActivityEventRecord[] = [
  {
    id: 'evt_hsl_pn142_fnol',
    kind: 'event',
    label: 'Preneed death FNOL registered',
    actor: 'user',
    timestamp: '2026-05-02T09:35:00Z',
    stage: 'fnol_received',
    detail: 'Helen Martinez — preneed death reported via myHomesteaders. Claim CLM-PN-2026-0142.',
    user: 'Victor Ramon',
    linkedObjects: [{ kind: 'case', id: PN_MID, label: PN_MID }],
  },
  {
    id: 'evt_hsl_pn142_death_cert',
    kind: 'event',
    label: 'Death certificate received',
    actor: 'system',
    timestamp: '2026-05-01T14:20:00Z',
    stage: 'initial_triage',
    detail: 'Certified Iowa death certificate validated for Helen Martinez.',
    user: 'System',
    linkedObjects: [{ kind: 'case', id: PN_MID, label: PN_MID }],
  },
  {
    id: 'evt_hsl_pn287_decision_ready',
    kind: 'event',
    label: 'Case marked decision-ready',
    actor: 'ai',
    timestamp: '2026-05-20T11:00:00Z',
    stage: 'decision',
    detail: 'All preneed requirements fulfilled. AI recommends $12,500 payment to Riverside Memorial Chapel.',
    user: 'AI Agent',
    linkedObjects: [{ kind: 'case', id: PN_DEC, label: PN_DEC }],
  },
  {
    id: 'evt_hsl_nb7721_aps_ordered',
    kind: 'event',
    label: 'APS ordered — hypertension disclosure',
    actor: 'ai',
    timestamp: '2026-05-11T10:05:00Z',
    stage: 'req_gathering',
    detail: 'APS ordered to Dr. Patterson following health questionnaire disclosure on Margaret Chen $15,000 preneed application.',
    user: 'AI Agent',
    linkedObjects: [{ kind: 'case', id: NB, label: NB }],
  },
  {
    id: 'evt_hsl_nb8804_expressions',
    kind: 'event',
    label: 'Personal Expressions guide completed',
    actor: 'user',
    timestamp: '2026-05-14T16:30:00Z',
    stage: 'personal-expressions',
    detail: 'Robert Sullivan Personal Expressions planning guide signed with Riverside Memorial Chapel funeral director.',
    user: 'Victor Ramon',
    linkedObjects: [{ kind: 'case', id: NB_S, label: NB_S }],
  },
  {
    id: 'evt_hsl_nb9905_pad',
    kind: 'event',
    label: 'PAD authorization received',
    actor: 'system',
    timestamp: '2026-05-18T09:45:00Z',
    stage: 'contract-issuance',
    detail: 'Pre-authorized debit form received for Dorothy Hayes — bank confirmation pending.',
    user: 'System',
    linkedObjects: [{ kind: 'case', id: NB_G, label: NB_G }],
  },
];
