import type { UnderwritingScoring } from '../domain/objectRefs';
import { GUARDIAN_DEMO_CASE_IDS } from './guardianDemoCaseIds';

export const GUARDIAN_SCORING_RECORDS: Record<string, UnderwritingScoring> = {
  [GUARDIAN_DEMO_CASE_IDS.nbFullUw]: {
    caseKey: 'nb_full',
    caseId: GUARDIAN_DEMO_CASE_IDS.nbFullUw,
    aiNet: 15,
    aiClass: 'standard',
    humanNet: null,
    humanClass: null,
    pending: ['GP report (Medicals)'],
    baseScore: 0,
    debitTotal: 15,
    creditTotal: 10,
    netScore: 5,
    mappedDecision: 'standard',
    riskClass: 'standard',
    offerControls: { tableRating: '', riskClass: 'standard', uwNotes: '' },
    debits: [
      {
        id: 'gdn_d1',
        category: 'Build',
        condition: 'BMI 26.1',
        points: 15,
        icd: '',
        confidence: 'medium',
        notes: 'Self-declared height/weight within overweight band. GP report will confirm.',
        pending: true,
        aiGenerated: true,
        label: 'BMI 26.1',
        direction: 'debit',
      },
    ],
    credits: [
      {
        id: 'gdn_c1',
        category: 'Lifestyle',
        factor: 'Non-smoker',
        points: -10,
        icd: '',
        confidence: 'high',
        notes: 'Non-smoker declared; no nicotine substitutes.',
        pending: false,
        aiGenerated: true,
        label: 'Non-smoker',
        direction: 'credit',
      },
    ],
    flatExtras: [],
    exclusions: [],
    evidence: [
      { id: 'gdn_ev_1', label: 'GP report', status: 'amber', issueCount: 1 },
    ],
    aiComparison: { netScore: 15, riskClass: 'standard' },
    underwriterNotes: '',
  },
};
