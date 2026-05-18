import type { UnderwritingScoring, UnderwritingScoringItem } from './objectRefs';

export type ScoringItemType = 'debit' | 'credit';
export type ScoringRow = UnderwritingScoringItem & { type: ScoringItemType; displayName: string; absPoints: number };

export function deriveHumanNet(scoring: Pick<UnderwritingScoring, 'debits' | 'credits' | 'humanNet'>): number {
  if (typeof scoring.humanNet === 'number') return scoring.humanNet;
  const debits = scoring.debits.reduce((sum, item) => sum + Math.abs(Number(item.points || 0)), 0);
  const credits = scoring.credits.reduce((sum, item) => sum + Math.abs(Number(item.points || 0)), 0);
  return debits - credits;
}

export function deriveRiskClass(net: number): string {
  if (net <= 0) return 'standard';
  if (net <= 25) return 'standard (possible rated)';
  if (net <= 75) return 'rated';
  if (net <= 150) return 'highly rated';
  return 'declined';
}

export function toScoringRows(scoring: Pick<UnderwritingScoring, 'debits' | 'credits'>): ScoringRow[] {
  return [
    ...scoring.debits.map((item) => ({ ...item, type: 'debit' as const, displayName: item.condition ?? item.label, absPoints: Math.abs(Number(item.points || 0)) })),
    ...scoring.credits.map((item) => ({ ...item, type: 'credit' as const, displayName: item.factor ?? item.label, absPoints: Math.abs(Number(item.points || 0)) })),
  ];
}

export function scoreBarPct(item: Pick<ScoringRow, 'absPoints'>, rows: Pick<ScoringRow, 'absPoints'>[]): number {
  const max = Math.max(1, ...rows.map((row) => row.absPoints));
  return Math.round((item.absPoints / max) * 100);
}

export function normalizeScoring(scoring: UnderwritingScoring): UnderwritingScoring {
  const humanNet = deriveHumanNet(scoring);
  const humanClass = deriveRiskClass(humanNet);
  const debitTotal = scoring.debits.reduce((sum, item) => sum + Math.abs(Number(item.points || 0)), 0);
  const creditTotal = scoring.credits.reduce((sum, item) => sum + Math.abs(Number(item.points || 0)), 0);
  return {
    ...scoring,
    debitTotal,
    creditTotal,
    netScore: humanNet,
    mappedDecision: humanClass,
    humanNet,
    humanClass,
    riskClass: scoring.offerControls?.riskClass ?? scoring.riskClass ?? humanClass,
    tableRating: scoring.offerControls?.tableRating ?? scoring.tableRating,
    underwriterNotes: scoring.offerControls?.uwNotes ?? scoring.underwriterNotes,
    aiComparison: {
      netScore: scoring.aiNet ?? scoring.aiComparison?.netScore ?? 0,
      riskClass: scoring.aiClass ?? scoring.aiComparison?.riskClass ?? 'standard',
      narrative: scoring.aiComparison?.narrative,
    },
  };
}

export function upsertScoringItem(scoring: UnderwritingScoring, type: ScoringItemType, item: UnderwritingScoringItem): UnderwritingScoring {
  const key = type === 'debit' ? 'debits' : 'credits';
  const rows = scoring[key];
  const exists = rows.some((row) => row.id === item.id);
  return normalizeScoring({
    ...scoring,
    [key]: exists ? rows.map((row) => (row.id === item.id ? item : row)) : [...rows, item],
  } as UnderwritingScoring);
}

export function deleteScoringItem(scoring: UnderwritingScoring, type: ScoringItemType, itemId: string): UnderwritingScoring {
  const key = type === 'debit' ? 'debits' : 'credits';
  return normalizeScoring({ ...scoring, [key]: scoring[key].filter((row) => row.id !== itemId) } as UnderwritingScoring);
}
