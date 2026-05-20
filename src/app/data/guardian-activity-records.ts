import type { ActivityEventRecord } from './multi-case-dataset';
import { GUARDIAN_DEMO_CASE_IDS } from './guardianDemoCaseIds';

export const GUARDIAN_ACTIVITY_RECORDS: ActivityEventRecord[] = [
  {
    id: 'evt_gdn_ip_fnol',
    kind: 'event',
    label: 'FNOL registered by phone',
    actor: 'user',
    timestamp: '2026-03-18T10:45:00Z',
    stage: 'fnol_received',
    detail: 'James Hartley — income protection incapacity. Claim CLM-IP-2026-0142.',
    user: 'Victor Ramon',
    linkedObjects: [{ kind: 'case', id: GUARDIAN_DEMO_CASE_IDS.incomeProtectionClaim, label: 'CLM-IP-2026-0142' }],
  },
  {
    id: 'evt_gdn_ci_decision_ready',
    kind: 'event',
    label: 'Case marked decision-ready',
    actor: 'ai',
    timestamp: '2026-05-16T14:00:00Z',
    stage: 'decision',
    detail: 'All CI requirements fulfilled. AI recommends full £150,000 payout.',
    user: 'AI Agent',
    linkedObjects: [{ kind: 'case', id: GUARDIAN_DEMO_CASE_IDS.criticalIllnessClaim, label: 'CLM-CI-2026-0089' }],
  },
  {
    id: 'evt_gdn_life_funeral',
    kind: 'event',
    label: 'Funeral advance payment released',
    actor: 'system',
    timestamp: '2026-05-06T11:30:00Z',
    stage: 'initial_triage',
    detail: '£10,000 Funeral Payment Pledge paid to Sarah Clarke.',
    user: 'System',
    linkedObjects: [{ kind: 'case', id: GUARDIAN_DEMO_CASE_IDS.lifeDeathClaim, label: 'CLM-LIFE-2026-0033' }],
  },
  {
    id: 'evt_gdn_nb_gp_chase',
    kind: 'event',
    label: 'GP report chase sent',
    actor: 'user',
    timestamp: '2026-05-17T09:00:00Z',
    stage: 'req_gathering',
    detail: 'Chase letter to Reading Medical Centre for Priya Sharma GP report.',
    user: 'Victor Ramon',
    linkedObjects: [{ kind: 'case', id: GUARDIAN_DEMO_CASE_IDS.nbFullUw, label: 'NB-2026-7721' }],
  },
];
