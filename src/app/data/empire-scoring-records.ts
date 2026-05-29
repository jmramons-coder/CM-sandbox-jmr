import type { UnderwritingScoring } from '../domain/objectRefs';
import { EMPIRE_DEMO_CASE_IDS } from './empireDemoCaseIds';

export const EMPIRE_SCORING_RECORDS: Record<string, UnderwritingScoring> = {
  [EMPIRE_DEMO_CASE_IDS.nbFullUw]: {
    caseKey: 'nb_full',
    caseId: EMPIRE_DEMO_CASE_IDS.nbFullUw,
    aiNet: 10,
    aiClass: 'standard',
    humanNet: null,
    humanClass: null,
    pending: ['Attending physician statement (APS)'],
    baseScore: 0,
    debitTotal: 10,
    creditTotal: 10,
    netScore: 0,
    mappedDecision: 'standard',
    riskClass: 'standard',
    offerControls: { tableRating: '', riskClass: 'standard', uwNotes: '' },
    debits: [
      {
        id: 'emp_d1',
        category: 'Build',
        condition: 'BMI 25.0',
        points: 10,
        icd: '',
        confidence: 'medium',
        notes: 'Self-declared height/weight at upper normal band. APS will confirm.',
        pending: true,
        aiGenerated: true,
        label: 'BMI 25.0',
        direction: 'debit',
      },
    ],
    credits: [
      {
        id: 'emp_c1',
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
      { id: 'emp_ev_1', label: 'APS', status: 'amber', issueCount: 1 },
    ],
    aiComparison: { netScore: 10, riskClass: 'standard' },
    underwriterNotes: '',
  },
};
